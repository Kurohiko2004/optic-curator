'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      this.belongsTo(models.Cart, {
        foreignKey: 'cartId',
        as: 'cart'
      });
      this.belongsTo(models.Glasses, {
        foreignKey: 'glassesId',
        as: 'glasses'
      });
    }
  }
  CartItem.init({
    cartId: DataTypes.INTEGER,
    glassesId: DataTypes.INTEGER,
    quantity: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CartItem',
  });
  return CartItem;
};