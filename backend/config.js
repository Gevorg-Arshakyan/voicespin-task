module.exports = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/inventory-management',
  nodeEnv: process.env.NODE_ENV || 'development'
};
