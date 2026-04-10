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

const getGlassById = asyncHandler(async (req, res, next) => {
    const glass = await glassesService.findById(req.params.id);
    if (!glass) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm' });
    }
    res.status(200).json({ success: true, data: glass });
});

const getAllShapes = asyncHandler(async (req, res, next) => {
    const shapes = await glassesService.findAllShapes();
    res.status(200).json({ success: true, data: shapes });
});

const getAllColors = asyncHandler(async (req, res, next) => {
    const colors = await glassesService.findAllColors();
    res.status(200).json({ success: true, data: colors });
});

module.exports = { getAllGlasses, getGlassById, getAllShapes, getAllColors };
