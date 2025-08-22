const Order = require('../models/Order');
const Product = require('../models/Product');
const moment = require('moment');

const getSalesStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? moment(startDate).startOf('day') : moment().subtract(30, 'days').startOf('day');
    const end = endDate ? moment(endDate).endOf('day') : moment().endOf('day');

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
    }

    if (start.isAfter(end)) {
      return res.status(400).json({ error: 'Start date cannot be after end date' });
    }

    const dailySales = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start.toDate(),
            $lte: end.toDate()
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          totalSales: { $sum: '$total' },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      },
      {
        $project: {
          _id: 0,
          date: {
            $dateFromParts: {
              year: '$_id.year',
              month: '$_id.month',
              day: '$_id.day'
            }
          },
          totalSales: { $round: ['$totalSales', 2] },
          orderCount: 1
        }
      }
    ]);

    const topCategories = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start.toDate(),
            $lte: end.toDate()
          }
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalQuantity: { $sum: '$items.qty' },
          totalRevenue: { 
            $sum: { 
              $multiply: ['$items.qty', '$items.priceAtPurchase'] 
            } 
          },
          orderCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalRevenue: -1 }
      },
      {
        $project: {
          _id: 0,
          category: '$_id',
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          orderCount: 1
        }
      }
    ]);

    const overallStats = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start.toDate(),
            $lte: end.toDate()
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 },
          averageOrderValue: { $avg: '$total' },
          totalDiscounts: { $sum: '$discountAmount' }
        }
      },
      {
        $project: {
          _id: 0,
          totalRevenue: { $round: ['$totalRevenue', 2] },
          totalOrders: 1,
          averageOrderValue: { $round: ['$averageOrderValue', 2] },
          totalDiscounts: { $round: ['$totalDiscounts', 2] }
        }
      }
    ]);

    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: start.toDate(),
            $lte: end.toDate()
          }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.productId',
          totalQuantity: { $sum: '$items.qty' },
          totalRevenue: { 
            $sum: { 
              $multiply: ['$items.qty', '$items.priceAtPurchase'] 
            } 
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$product.name',
          category: '$product.category',
          totalQuantity: 1,
          totalRevenue: { $round: ['$totalRevenue', 2] }
        }
      }
    ]);

    res.json({
      dateRange: {
        startDate: start.format('YYYY-MM-DD'),
        endDate: end.format('YYYY-MM-DD')
      },
      overallStats: overallStats[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalDiscounts: 0
      },
      dailySales,
      topCategories,
      topProducts,
      topSellingCategory: topCategories[0]?.category || null
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

module.exports = {
  getSalesStats
};
