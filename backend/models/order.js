'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      this.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      this.hasMany(models.OrderItem, {
        foreignKey: 'orderId',
        as: 'orderItems'
      });
    }
  }
  Order.init({
    userId: DataTypes.INTEGER,
    totalPrice: DataTypes.DECIMAL,
    status: DataTypes.STRING,
    paymentMethod: DataTypes.STRING,
    paymentStatus: DataTypes.STRING,
    transactionId: DataTypes.STRING,
    paidAt: DataTypes.DATE,
    recipientName: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    shippingAddress: DataTypes.STRING

  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};