'use strict';

// Cập nhật danh sách items cho phép để khớp với yêu cầu lưới 3x3
const ALLOWED_ITEMS = [9, 18, 27];

/**
 * Bước 1: Xử lý và làm sạch tham số đầu vào từ Request Query
 * @param {string|number} page - Trang hiện tại từ req.query
 * @param {string|number} items - Số item/trang từ req.query
 * @returns {object} { limit, offset, currentPage }
 */
const getPagination = (page, items) => {
    let limit = parseInt(items);
    if (isNaN(limit) || !ALLOWED_ITEMS.includes(limit)) {
        limit = 9; // Đổi mặc định thành 9 để khớp với yêu cầu
    }

    let currentPage = parseInt(page);
    if (isNaN(currentPage) || currentPage < 1) {
        currentPage = 1; // Default start is from page 1
    }

    const offset = (currentPage - 1) * limit;

    return { limit, offset, currentPage };
};


/**
 * Bước 2: Đóng gói dữ liệu truy vấn từ DB thành format JSON chuẩn
 * @param {object} dbResult - Object { count, rows } trả về từ findAndCountAll
 * @param {number} currentPage - Trang hiện tại đã qua xử lý
 * @param {number} limit - Limit đã qua xử lý
 * @returns {object} Cấu trúc Response cho Frontend
 */
const getPagingData = (dbResult, currentPage, limit) => {
    const totalItems = dbResult?.count || 0;
    const list = dbResult?.rows || [];
    const totalPages = Math.ceil(totalItems / limit);

    return {
        totalItems,
        data: list,
        totalPages,
        currentPage
    };
};


module.exports = { getPagination, getPagingData };
