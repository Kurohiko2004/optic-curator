'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Glasses extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.GlassesShape, { // Changed from GlassShape to GlassesShape
        foreignKey: 'glassShapeId',
        as: 'glassShape'
      });
      this.hasMany(models.CartItem, {
        foreignKey: 'glassesId',
        as: 'cartItems'
      });
      this.hasMany(models.OrderItem, {
        foreignKey: 'glassesId',
        as: 'orderItems'
      });
    }
  }
  Glasses.init({
    glassShapeId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    price: DataTypes.DECIMAL,
    stock: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Glasses',
  });
  return Glasses;
};