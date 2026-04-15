'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('Orders', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_orders_users',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('Carts', {
      fields: ['userId'],
      type: 'unique',
      name: 'unique_user_cart'
    });
  },





  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Orders', 'fk_orders_users');
    await queryInterface.removeConstraint('Carts', 'unique_user_cart');
  }
};
