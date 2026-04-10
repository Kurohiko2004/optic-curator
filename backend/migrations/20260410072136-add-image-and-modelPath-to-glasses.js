'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Glasses', 'image', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Glasses', 'modelPath', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Glasses', 'image');
    await queryInterface.removeColumn('Glasses', 'modelPath');
  }
};
