'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addConstraint('Glasses', {
      fields: ['glassesShapesId'],
      type: 'foreign key',
      name: 'fk_glasses_glassesShapesId',
      references: {
        table: 'GlassesShapes',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('OrderItems', {
      fields: ['glassesId'],
      type: 'foreign key',
      name: 'fk_orderItems_glasses',
      references: {
        table: 'Glasses',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('OrderItems', {
      fields: ['orderId'],
      type: 'foreign key',
      name: 'fk_orderItems_orders',
      references: {
        table: 'Orders',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });



    await queryInterface.addConstraint('Carts', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_carts_users',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('CartItems', {
      fields: ['cartId'],
      type: 'foreign key',
      name: 'fk_cartItems_carts',
      references: {
        table: 'Carts',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    await queryInterface.addConstraint('CartItems', {
      fields: ['glassesId'],
      type: 'foreign key',
      name: 'fk_cartItems_glasses',
      references: {
        table: 'Glasses',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Glasses', 'fk_glasses_glassesShapesId');

    await queryInterface.removeConstraint('OrderItems', 'fk_orderItems_glasses');
    await queryInterface.removeConstraint('OrderItems', 'fk_orderItems_orders');

    await queryInterface.removeConstraint('Carts', 'fk_carts_users');
    await queryInterface.removeConstraint('CartItems', 'fk_cartItems_carts');
    await queryInterface.removeConstraint('CartItems', 'fk_cartItems_glasses');


  }
};