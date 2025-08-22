const Product = require('../models/Product');

const createProduct = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;

    if (!name || !category || price === undefined || stock === undefined) {
      return res.status(400).json({
        error: 'Please provide all required fields: name, category, price, stock'
      });
    }

    if (price < 0) {
      return res.status(400).json({ error: 'Price cannot be negative' });
    }

    if (stock < 0 || !Number.isInteger(stock)) {
      return res.status(400).json({ error: 'Stock must be a non-negative integer' });
    }

    const product = new Product({
      name,
      category,
      price,
      stock
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const products = await Product.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNumber);

    const total = await Product.countDocuments(filter);

    res.json({
      products,
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

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid product ID' });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct
};
