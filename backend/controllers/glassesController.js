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

const createGlass = asyncHandler(async (req, res, next) => {
    const newGlass = await glassesService.create(req.body);
    res.status(201).json({ success: true, message: 'Sản phẩm kính đã được tạo thành công', data: newGlass });
});

const updateGlass = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const updatedGlass = await glassesService.update(id, req.body);
    if (!updatedGlass) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để cập nhật' });
    }
    res.status(200).json({ success: true, message: 'Sản phẩm kính đã được cập nhật thành công', data: updatedGlass });
});

const getAllShapes = asyncHandler(async (req, res, next) => {
    const shapes = await glassesService.findAllShapes();
    res.status(200).json({ success: true, data: shapes });
});

const getAllColors = asyncHandler(async (req, res, next) => {
    const colors = await glassesService.findAllColors();
    res.status(200).json({ success: true, data: colors });
});

const deleteGlass = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const result = await glassesService.remove(id);
    if (!result) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy sản phẩm để xóa' });
    }
    res.status(200).json({ success: true, message: 'Sản phẩm kính đã được xóa thành công' });
});

module.exports = { getAllGlasses, getGlassById, createGlass, updateGlass, getAllShapes, getAllColors, deleteGlass };
