'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'recipientName', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'phoneNumber', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('Orders', 'shippingAddress', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'recipientName');
    await queryInterface.removeColumn('Orders', 'phoneNumber');
    await queryInterface.removeColumn('Orders', 'shippingAddress');
  }
};
