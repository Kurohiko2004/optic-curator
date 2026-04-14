# Tài liệu bàn giao API Giỏ hàng (Cart)

## 1. Thông tin chung
- **Base URL**: `http://localhost:8082/api`
- **Headers**: Với tất cả API thuộc route giỏ hàng, bạn yêu cầu phải đính kèm Token đăng nhập vào Header.
  `Authorization: Bearer <TOKEN_CỦA_USER>`

## 2. Cấu trúc Response chung
**Thành công (200 OK | 201 Created)**:
```json
{
  "success": true,
  "message": "Thông báo trạng thái (Ví dụ: Đã thêm vào giỏ hàng)",
  "data": { ... } 
}
```

**Thất bại do Client (400 Bad Request | 401 Unauthorized | 404 Not Found)**:
```json
{
  "success": false,
  "message": "Lỗi do người dùng nhập sai, hết hàng, sai ID, hoặc gửi thiếu Authorization Header..."
}
```

## 3. Danh sách API (Cart)

### 3.1. Lấy thông tin Giỏ hàng (`GET /api/cart`)
Sử dụng để render giỏ hàng. API sẽ tự tính toán **tổng tiền (`totalPrice`)** và **số lượng item (`totalItems`)**.
**Response (200 OK)**:
```json
{
    "success": true,
    "data": {
        "id": 1,
        "userId": 5,
        "cartItems": [
            {
                "id": 12,            // (1) ĐÂY LÀ CART-ITEM ID (Dùng id này để API update / delete)
                "cartId": 1,
                "glassesId": 2,      // (2) ĐÂY CHỈ LÀ THÔNG TIN SẢN PHẨM KHÔNG DÙNG ĐỂ GỌI API DELETE 
                "quantity": 2,
                "glasses": {
                    "id": 2,
                    "name": "Kính râm mát mẻ",
                    "price": "500000",
                    "image": "..."
                }
            }
        ],
        "totalPrice": 1000000,   // Đã được backend tính tự động = sum(price * quantity)
        "totalItems": 1
    }
}
```

### 3.2. Thêm vào giỏ hàng (`POST /api/cart/add`)
API xử lý cả logic: Nếu chưa có thì thêm mới. Nếu đã có thì cộng dồn số lượng. Đồng thời **Tự Động Bắt Lỗi Hết Hàng (Stock Validation)**.
**Body (Thịnh dạng JSON)**:
```json
{
  "glassesId": 2,
  "quantity": 1 // Phải là số >= 1.
}
```
**Response (200 OK)**: Thành công sẽ trả về thông tin cartItem đó. 
**Ngoại lệ (400 Bad Request)**: Sẽ gặp lỗi có chứa message cụ thể `"Số lượng vượt quá hàng tồn kho (X sản phẩm có sẵn)"` nếu mua vượt quá trong kho.

### 3.3. Cập nhật số lượng (`PATCH /api/cart/:id`)
**⚠️ QUAN TRỌNG**: `:id` trên URL là **id của cartItem** (Lấy từ trường số (1) ở mục 3.1), KHÔNG PHẢI là `glassesId`.
**Body (JSON)**:
```json
{
  "quantity": 3  // Phải là số >= 1. (Đây là set trực tiếp số lượng bằng 3, không phải cộng dồn)
}
```
Cũng tích hợp Bắt lỗi Hàng Tồn Kho (Stock Validation).

### 3.4. Xóa một sản phẩm lẻ (`DELETE /api/cart/:id`)
**⚠️ QUAN TRỌNG**: `:id` trên URL là **id của cartItem**. 
**Response (200 OK)**:
```json
{
    "success": true,
    "message": "Đã xóa sản phẩm khỏi giỏ hàng"
}
```

### 3.5. Xóa/Làm rỗng toàn bộ giỏ hàng (`DELETE /api/cart/clear`)
Thường dùng khi bấm nút "Làm rỗng" hoặc Backend Controller gọi sau khi **Thanh toán (Checkout) thành công**.
**Lưu ý**: Endpoint này không cần thiết truyền ID và không cần body.
**Response (200 OK)**:
```json
{
    "success": true,
    "message": "Đã xóa toàn bộ sản phẩm khỏi giỏ hàng"
}
```
