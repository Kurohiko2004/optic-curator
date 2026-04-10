'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GlassesColor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GlassesColor.init({
    glassesId: DataTypes.INTEGER,
    colorsId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'GlassesColor',
    tableName: 'GlassesColors'
  });
  return GlassesColor;
};
