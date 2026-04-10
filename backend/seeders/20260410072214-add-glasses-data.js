'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Seed GlassesShapes
    await queryInterface.bulkInsert('GlassesShapes', [
      { id: 1, name: 'Aviator', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Round', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Wayfarer', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Cat Eye', createdAt: new Date(), updatedAt: new Date() },
      { id: 5, name: 'Geometric', createdAt: new Date(), updatedAt: new Date() },
      { id: 6, name: 'Square', createdAt: new Date(), updatedAt: new Date() }
    ], {});

    // 2. Seed Colors
    await queryInterface.bulkInsert('Colors', [
      { id: 1, name: 'Obsidian Black', createdAt: new Date(), updatedAt: new Date() },
      { id: 2, name: 'Sapphire Blue', createdAt: new Date(), updatedAt: new Date() },
      { id: 3, name: 'Rose Gold', createdAt: new Date(), updatedAt: new Date() },
      { id: 4, name: 'Cyber Silver', createdAt: new Date(), updatedAt: new Date() }
    ], {});

    // 3. Seed Glasses
    await queryInterface.bulkInsert('Glasses', [
      {
        id: 1,
        glassesShapeId: 1, // Aviator
        name: 'Lumina Horizon 1',
        description: 'Premium Aviator glasses with a sleek obsidian finish.',
        price: 199.00,
        stock: 50,
        materialFrame: 'Titanium',
        lensType: 'Polarized',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        glassesShapeId: 2, // Round
        name: 'Eco Classic 2',
        description: 'Classic round frames made from eco-friendly acetate.',
        price: 224.00,
        stock: 30,
        materialFrame: 'Acetate',
        lensType: 'Blue Light Filter',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        glassesShapeId: 3, // Wayfarer
        name: 'Urban Explorer 3',
        description: 'Versatile wayfarer style for the modern adventurer.',
        price: 249.00,
        stock: 100,
        materialFrame: 'Nylon',
        lensType: 'Photochromic',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});

    // 4. Seed GlassesColors (Junction Table)
    await queryInterface.bulkInsert('GlassesColors', [
      { glassesId: 1, colorsId: 1, createdAt: new Date(), updatedAt: new Date() },
      { glassesId: 1, colorsId: 2, createdAt: new Date(), updatedAt: new Date() },
      { glassesId: 2, colorsId: 3, createdAt: new Date(), updatedAt: new Date() },
      { glassesId: 3, colorsId: 1, createdAt: new Date(), updatedAt: new Date() },
      { glassesId: 3, colorsId: 4, createdAt: new Date(), updatedAt: new Date() }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('GlassesColors', null, {});
    await queryInterface.bulkDelete('Glasses', null, {});
    await queryInterface.bulkDelete('Colors', null, {});
    await queryInterface.bulkDelete('GlassesShapes', null, {});
  }
};
