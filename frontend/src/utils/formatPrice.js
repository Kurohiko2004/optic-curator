export const formatPrice = (price) => {
    // 1. Chuyển đổi bất kể là String hay Number về kiểu số
    const number = parseFloat(price);

    // 2. Kiểm tra nếu không phải số (ví dụ truyền vào một chữ cái)
    if (isNaN(number)) return price;

    // 3. Định dạng theo chuẩn Việt Nam
    return number.toLocaleString('vi-VN') + ' VND';
};