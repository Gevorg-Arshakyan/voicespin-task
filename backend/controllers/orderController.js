const Order = require('../models/Order');
const Product = require('../models/Product');

const DISCOUNT_CODES = {
  'SAVE5': { percent: 5, description: '5% off' }
};


const createOrder = async (req, res) => {
  try {
    const { items, discountCode } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Order must contain at least one item' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { productId, qty } = item;

      if (!productId || !qty || qty <= 0 || !Number.isInteger(qty)) {
        return res.status(400).json({ 
          error: 'Each item must have valid productId and positive integer quantity' 
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${productId} not found` });
      }

      if (product.stock < qty) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${qty}` 
        });
      }

      const itemTotal = product.price * qty;
      subtotal += itemTotal;

      orderItems.push({
        productId: product._id,
        qty,
        priceAtPurchase: product.price
      });
    }

    let discountAmount = 0;
    let total = subtotal;

    if (discountCode) {
      const discount = DISCOUNT_CODES[discountCode.toUpperCase()];
      if (discount) {
        discountAmount = (subtotal * discount.percent) / 100;
        total = subtotal - discountAmount;
      } else {
        return res.status(400).json({ error: 'Invalid discount code' });
      }
    }

    const order = new Order({
      items: orderItems,
      total,
      discountCode: discountCode ? discountCode.toUpperCase() : undefined,
      discountAmount
    });

    try {
      for (const item of orderItems) {
        const result = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.qty } },
          { new: true }
        );
        
        if (!result) {
          throw new Error(`Product ${item.productId} not found during stock update`);
        }
        
        if (result.stock < 0) {
          throw new Error(`Insufficient stock for product ${result.name}`);
        }
      }

      const savedOrder = await order.save();

      const populatedOrder = await Order.findById(savedOrder._id)
        .populate('items.productId', 'name category');

      res.status(201).json(populatedOrder);
    } catch (error) {
      console.error('Error creating order:', error.message);
      throw error;
    }
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};


const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name category price');

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid order ID' });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const orders = await Order.find()
      .populate('items.productId', 'name category')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await Order.countDocuments();

    res.json({
      orders,
      pagination: {
        current: pageNumber,
        pages: Math.ceil(total / limitNumber),
        total,
        limit: limitNumber
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrderById,
  getOrders
};
