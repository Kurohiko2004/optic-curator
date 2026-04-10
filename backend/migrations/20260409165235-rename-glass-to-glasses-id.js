'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable('GlassShapes', 'GlassesShapes');
    await queryInterface.renameColumn('Glasses', 'glassShapeId', 'glassesShapeId');

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameTable('GlassesShapes', 'GlassShapes');
    await queryInterface.renameColumn('Glasses', 'glassesShapeId', 'glassShapeId');
  }
};
