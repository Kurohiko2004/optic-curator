export const shapes = ['Aviator', 'Round', 'Wayfarer', 'Cat Eye', 'Geometric', 'Square'];
export const faceShapes = ['Oval', 'Heart', 'Square', 'Round', 'Triangle', 'Diamond'];

export const glassesItems = Array.from({ length: 9 }).map((_, i) => ({
  id: i + 1,
  name: `Lumina Horizon ${i + 1}`,
  price: 199 + (i * 25),
  type: i % 2 === 0 ? 'Premium Acetate' : 'Titanium Edition',
  color: ['Obsidian Black', 'Sapphire Blue', 'Rose Gold', 'Cyber Silver'][i % 4],
  image: '/item1.png'
}));
