'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Glasses', 'materialFrame', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Glasses', 'lensType', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Glasses', 'materialFrame');
    await queryInterface.removeColumn('Glasses', 'lensType');
  }
};
