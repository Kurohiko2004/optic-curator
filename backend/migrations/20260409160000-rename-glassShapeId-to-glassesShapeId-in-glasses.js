'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Rename the column 'glassShapeId' to 'glassesShapeId' in the 'Glasses' table
    await queryInterface.renameColumn('Glasses', 'glassShapeId', 'glassesShapeId');
  },

  async down (queryInterface, Sequelize) {
    // Revert the column name if rolling back the migration
    await queryInterface.renameColumn('Glasses', 'glassesShapeId', 'glassShapeId');
  }
};
