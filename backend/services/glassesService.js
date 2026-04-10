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
            [Op.between]: [parseFloat(minPrice) || 0, parseFloat(maxPrice) || 999999999]
        };
    }

    return await db.Glasses.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        attributes: {
            include: [
                [db.sequelize.col('glassesShapeId'), 'glassShapeId']
            ],
            exclude: ['glassesShapeId']
        },
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
        order: [[sortBy || 'price', sortOrder || 'ASC']],
        distinct: true // Tránh đếm trùng khi join many-to-many
    });
};


module.exports = {
    findAllGlasses
};
