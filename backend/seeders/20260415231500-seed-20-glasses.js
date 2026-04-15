'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const glasses = [
      {
        name: 'Vanguard Elite',
        description: 'Bold square frames for a sharp, professional look. Features high-grade titanium construction.',
        price: 210000,
        stock: 45,
        glassesShapeId: 6,
        materialFrame: 'Titanium',
        lensType: 'Polarized',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Azure Breeze',
        description: 'Lightweight round glasses with a subtle blue tint. Perfect for casual weekend outings.',
        price: 185000,
        stock: 60,
        glassesShapeId: 2,
        materialFrame: 'Acetate',
        lensType: 'Blue Light Filter',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Midnight Aviator',
        description: 'Classic aviator silhouette with a matte black finish. Timeless style meets modern durability.',
        price: 195000,
        stock: 35,
        glassesShapeId: 1,
        materialFrame: 'Stainless Steel',
        lensType: 'Polarized',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Retro Glow',
        description: 'Vintage-inspired cat-eye frames that add a touch of glamour to any outfit.',
        price: 220000,
        stock: 25,
        glassesShapeId: 4,
        materialFrame: 'Nylon',
        lensType: 'Clear',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Horizon Prism',
        description: 'Geometric frames with a unique prismatic finish. For those who want to stand out.',
        price: 275000,
        stock: 15,
        glassesShapeId: 5,
        materialFrame: 'Titanium',
        lensType: 'Photochromic',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Urban Stealth',
        description: 'Minimalist wayfarer design with hidden hinges and a velvet-touch finish.',
        price: 155000,
        stock: 80,
        glassesShapeId: 3,
        materialFrame: 'Nylon',
        lensType: 'Blue Light Filter',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Copper Peak',
        description: 'Square frames in a rustic copper tone. Rugged and reliable.',
        price: 190000,
        stock: 40,
        glassesShapeId: 6,
        materialFrame: 'Stainless Steel',
        lensType: 'Polarized',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Crystal Clear',
        description: 'Transparent acetate frames that offer a clean, modern aesthetic.',
        price: 165000,
        stock: 70,
        glassesShapeId: 2,
        materialFrame: 'Acetate',
        lensType: 'Clear',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Solar Flare',
        description: 'Golden aviators that capture the essence of summer. High-impact lenses included.',
        price: 240000,
        stock: 20,
        glassesShapeId: 1,
        materialFrame: 'Gold Plated',
        lensType: 'Gradient',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Velvet Noir',
        description: 'Luxurious cat-eye frames with a soft-touch texture. Elegance redefined.',
        price: 235000,
        stock: 30,
        glassesShapeId: 4,
        materialFrame: 'Acetate',
        lensType: 'Clear',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Iron Sight',
        description: 'Industrial-grade geometric frames for a tech-forward appearance.',
        price: 260000,
        stock: 22,
        glassesShapeId: 5,
        materialFrame: 'Stainless Steel',
        lensType: 'Blue Light Filter',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Amber Wave',
        description: 'Warm amber tones in a classic wayfarer shape. Earthy and inviting.',
        price: 175000,
        stock: 55,
        glassesShapeId: 3,
        materialFrame: 'Wood',
        lensType: 'Polarized',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Titan Edge',
        description: 'Brushed titanium square frames that are virtually indestructible.',
        price: 295000,
        stock: 12,
        glassesShapeId: 6,
        materialFrame: 'Titanium',
        lensType: 'Photochromic',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mist Round',
        description: 'Soft gray frames with a frosted finish. Understated yet sophisticated.',
        price: 145000,
        stock: 100,
        glassesShapeId: 2,
        materialFrame: 'Nylon',
        lensType: 'Clear',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Obsidian Wing',
        description: 'Sleek aviators with carbon fiber accents. Engineered for performance.',
        price: 280000,
        stock: 18,
        glassesShapeId: 1,
        materialFrame: 'Carbon Fiber',
        lensType: 'Polarized',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gilded Muse',
        description: 'Ornate geometric frames with gold leaf detailing. A true work of art.',
        price: 820000,
        stock: 8,
        glassesShapeId: 5,
        materialFrame: 'Titanium',
        lensType: 'Gradient',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Carbon Way',
        description: 'Ultra-light wayfarers made from recycled carbon composites.',
        price: 215000,
        stock: 45,
        glassesShapeId: 3,
        materialFrame: 'Carbon Composite',
        lensType: 'Blue Light Filter',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ruby Cat',
        description: 'Deep red frames that command attention. Bold and beautiful.',
        price: 205000,
        stock: 33,
        glassesShapeId: 4,
        materialFrame: 'Acetate',
        lensType: 'Clear',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Steel Matrix',
        description: 'Square frames with a laser-etched pattern on the temples.',
        price: 680000,
        stock: 50,
        glassesShapeId: 6,
        materialFrame: 'Stainless Steel',
        lensType: 'Photochromic',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lunar Round',
        description: 'Silver-toned round glasses that reflect the moonlight. Ethereal design.',
        price: 190000,
        stock: 40,
        glassesShapeId: 2,
        materialFrame: 'Titanium',
        lensType: 'Blue Light Filter',
        image: '/item1.png',
        modelPath: '/model/glasses/glass1.glb',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Glasses', glasses, {});

    // Optional: Assign random colors to these new glasses
    const insertedGlasses = await queryInterface.sequelize.query(
      `SELECT id FROM Glasses WHERE name IN (${glasses.map(g => `'${g.name}'`).join(',')})`
    );

    const glassesRows = insertedGlasses[0];
    const glassesColors = [];

    glassesRows.forEach(glass => {
      // Assign 1-2 random colors to each glass
      const colorIds = [1, 2, 3, 4];
      const numColors = Math.floor(Math.random() * 2) + 1;
      const selectedColors = colorIds.sort(() => 0.5 - Math.random()).slice(0, numColors);

      selectedColors.forEach(colorId => {
        glassesColors.push({
          glassesId: glass.id,
          colorsId: colorId,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    });

    if (glassesColors.length > 0) {
      await queryInterface.bulkInsert('GlassesColors', glassesColors, {});
    }
  },

  async down(queryInterface, Sequelize) {
    const glassNames = [
      'Vanguard Elite', 'Azure Breeze', 'Midnight Aviator', 'Retro Glow',
      'Horizon Prism', 'Urban Stealth', 'Copper Peak', 'Crystal Clear',
      'Solar Flare', 'Velvet Noir', 'Iron Sight', 'Amber Wave',
      'Titan Edge', 'Mist Round', 'Obsidian Wing', 'Gilded Muse',
      'Carbon Way', 'Ruby Cat', 'Steel Matrix', 'Lunar Round'
    ];

    // Delete associations first
    const glassesToDelete = await queryInterface.sequelize.query(
      `SELECT id FROM Glasses WHERE name IN (${glassNames.map(name => `'${name}'`).join(',')})`
    );

    if (glassesToDelete[0].length > 0) {
      const ids = glassesToDelete[0].map(g => g.id);
      await queryInterface.bulkDelete('GlassesColors', { glassesId: ids }, {});
    }

    await queryInterface.bulkDelete('Glasses', { name: glassNames }, {});
  }
};
