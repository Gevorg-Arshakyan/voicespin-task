const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct
} = require('../controllers/productController');

router.post('/', createProduct);

router.get('/', getProducts);

router.get('/:id', getProductById);

router.put('/:id', updateProduct);

module.exports = router;
