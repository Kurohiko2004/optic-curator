const db = require('../models/index.js');
const asyncHandler = require('../utils/asyncHandlerUtil.js');
const { getPagination, getPagingData } = require('../utils/paginationUtil.js');
const { Op } = require('sequelize');

const getAllGlasses = asyncHandler(async (req, res, next) => {
    const { page, items, glassesShapeId, minPrice, maxPrice, search, sortBy, sortOrder } = req.query;

    // 1. Xử lý phân trang
    const { limit, offset, currentPage } = getPagination(page, items);

    // 2. Xây dựng điều kiện lọc (Where Clause)
    const whereCondition = {};
    if (search) {
        whereCondition.name = {
            [Op.like]: `%${search}%`
        };
    }

    if (glassesShapeId) {
        whereCondition.glassesShapeId = glassesShapeId;
    }

    if (minPrice || maxPrice) {
        whereCondition.price = {
            [Op.between]: [parseFloat(minPrice) || 0, parseFloat(maxPrice) || 999999999]
        };
    }

    // 3. Truy vấn Database
    const dbResult = await db.Glasses.findAndCountAll({
        where: whereCondition,
        limit,
        offset,
        include: [
            {
                model: db.GlassesShape,
                as: 'shape',
                attributes: ['id', 'name']
            }
        ],
        order: [[sortBy || 'price', sortOrder || 'ASC']]
    });

    // 4. Đóng gói dữ liệu trả về 
    const response = getPagingData(dbResult, currentPage, limit);
    res.status(200).json(response);
});

module.exports = { getAllGlasses };