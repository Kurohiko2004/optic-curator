'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Order, {
        foreignKey: 'orderId',
        as: 'order'
      });
      this.belongsTo(models.Glasses, {
        foreignKey: 'glassesId',
        as: 'glasses'
      });
    }
  }
  OrderItem.init({
    orderId: DataTypes.INTEGER,
    glassesId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER,
    priceAtPurchase: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'OrderItem',
  });
  return OrderItem;
};