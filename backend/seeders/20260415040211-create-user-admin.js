require('dotenv').config();
'use strict';

const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const password = process.env.ADMIN_PASSWORD;
    const hashedPassword = await bcrypt.hash(password, 10);

    await queryInterface.bulkInsert('Users', [{
      roleId: 1,
      username: process.env.ADMIN_USERNAME,
      password: hashedPassword,
      email: process.env.ADMIN_EMAIL,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: process.env.ADMIN_EMAIL });
  }
};
