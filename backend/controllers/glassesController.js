const glassesService = require('../services/glassesService.js');
const asyncHandler = require('../utils/asyncHandlerUtil.js');
const { getPagination, getPagingData } = require('../utils/paginationUtil.js');

const getAllGlasses = asyncHandler(async (req, res, next) => {
    // 1. Xử lý phân trang
    const { limit, offset, currentPage } = getPagination(req.query.page, req.query.items);

    // 2. Gọi service để lấy dữ liệu
    const dbResult = await glassesService.findAllGlasses(req.query, { limit, offset });

    // 3. Đóng gói dữ liệu trả về 
    const response = getPagingData(dbResult, currentPage, limit);
    res.status(200).json(response);
});

module.exports = { getAllGlasses };
