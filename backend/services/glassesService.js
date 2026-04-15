const db = require('../models/index.js');
const { Op } = require('sequelize');

/**
 * Lấy danh sách kính với phân trang, lọc và sắp xếp
 * @param {object} query params từ request
 * @param {object} pagination { limit, offset }
 * @returns {object} { count, rows }
 */
const findAllGlasses = async (queryParams, pagination) => {
    const { glassesShapeId, minPrice, maxPrice, search, sortBy, sortOrder } = queryParams;
    const { limit, offset } = pagination;

    const whereCondition = {};

    // Tìm kiếm theo tên
    if (search) {
        whereCondition.name = {
            [Op.like]: `%${search}%`
        };
    }

    // Lọc theo hình dáng
    if (glassesShapeId) {
        whereCondition.glassesShapeId = glassesShapeId;
    }

    // Lọc theo giá
    if (minPrice || maxPrice) {
        whereCondition.price = {
            [Op.between]: [parseFloat(minPrice) || 0, parseFloat(maxPrice) || 1000000]
        };
    }

    return await db.Glasses.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        include: [
            {
                model: db.GlassesShape,
                as: 'shape',
                attributes: ['id', 'name']
            },
            {
                model: db.Color,
                as: 'colors',
                attributes: ['id', 'name'],
                through: { attributes: [] } // Ẩn dữ liệu bảng trung gian
            }
        ],
        order: [[sortBy || 'price', sortOrder || 'ASC']], // Changed default sortBy to 'price' and sortOrder to 'ASC'
        distinct: true // Tránh đếm trùng khi join many-to-many
    });
};


const findById = async (id) => {
    return await db.Glasses.findByPk(id, {
        include: [
            {
                model: db.GlassesShape,
                as: 'shape',
                attributes: ['id', 'name']
            },
            {
                model: db.Color,
                as: 'colors',
                attributes: ['id', 'name'],
                through: { attributes: [] }
            }
        ]
    });
};

const create = async (glassData) => {
    const { colorIds, ...data } = glassData;
    const newGlass = await db.Glasses.create(data);
    if (colorIds && colorIds.length > 0) {
        await newGlass.setColors(colorIds);
    }
    return findById(newGlass.id);
};

const update = async (id, glassData) => {
    const glass = await db.Glasses.findByPk(id);
    if (!glass) return null;
    const { colorIds, ...data } = glassData;
    await glass.update(data);
    if (colorIds) {
        await glass.setColors(colorIds);
    }
    return findById(id);
};

const findAllShapes = async () => {
    return await db.GlassesShape.findAll({
        attributes: ['id', 'name']
    });
};

const findAllColors = async () => {
    return await db.Color.findAll({
        attributes: ['id', 'name']
    });
};

module.exports = {
    findAllGlasses,
    findById,
    create,
    update,
    findAllShapes,
    findAllColors
};
