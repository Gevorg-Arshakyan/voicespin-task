const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: ['Beverages', 'Snacks', 'Electronics', 'Clothing', 'Books', 'Other']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock cannot be negative'],
    validate: {
      validator: Number.isInteger,
      message: 'Stock must be an integer'
    }
  }
}, {
  timestamps: true
});

productSchema.index({ name: 'text', category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ category: 1, price: 1 });

module.exports = mongoose.model('Product', productSchema);
