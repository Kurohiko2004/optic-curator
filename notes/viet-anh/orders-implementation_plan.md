# Kế hoạch triển khai tính năng Mua Hàng (Checkout)

Tính năng Mua hàng (Checkout) là bước cốt lõi chuyển đổi các sản phẩm từ Giỏ hàng sang Đơn hàng, đồng thời khấu trừ tồn kho và ghi nhận lịch sử mua sắm.

## 1. Cập nhật Database Schema (Bảng Orders)

Hiện tại bảng `Orders` đang thiếu thông tin về người nhận và địa chỉ giao hàng.
- **Tạo migration mới** để thêm các cột vào bảng `Orders`:
  - `recipientName` (Tên người nhận - STRING)
  - `phoneNumber` (Số điện thoại - STRING)
  - `shippingAddress` (Địa chỉ giao hàng - STRING)
- **Cập nhật Model `Order`**: Thêm các thuộc tính trên vào file `models/order.js`.

## 2. Xây dựng Logic Backend (Services & Controllers)

### 2.1. Service: `orderService.js`
Tạo ra `orderService` để xử lý nghiệp vụ đơn hàng trong một **Database Transaction** (Giao dịch DB) nhằm đảm bảo tính toàn vẹn dữ liệu:
  1. Lấy thông tin Giỏ hàng (Cart) của người dùng.
  2. Kiểm tra nếu giỏ hàng rỗng thì báo lỗi.
  3. Kiểm tra lại một lần nữa số lượng tồn kho (stock) của từng Kính (Glasses) xem có đủ đáp ứng hay không.
  4. Tạo bản ghi `Order` mới (trạng thái 'PENDING', tổng tiền, phương thức thanh toán, địa chỉ...).
  5. Tạo các bản ghi `OrderItem` tương ứng với mỗi CartItem.
  6. Trừ đi số lượng `stock` trong bảng `Glasses`.
  7. Xóa sạch giỏ hàng của người dùng (Clear Cart).
  8. Nếu có bất kỳ lỗi nào xảy ra trong quá trình trên, rollback toàn bộ (không tạo đơn, không lấy tiền, không trừ kho).

Thêm hàm phụ: `getUserOrders(userId)` để lấy lịch sử mua hàng.

### 2.2. Controller: `orderController.js`
Trực tiếp nhận Request, chuyển validate, gọi `orderService` và trả về JSON cho Frontend.
- `createOrder`: Tạo đơn hàng.
- `getMyOrders`: Lấy danh sách đơn lịch sử.

## 3. Xác thực dữ liệu & Route (Backend)
- **Tạo `validations/orderValidation.js`** (dùng Joi): 
  - Yêu cầu `recipientName`, `phoneNumber`, `shippingAddress`, `paymentMethod`.
- **Tạo `routes/orderRoutes.js`**:
  - `POST /` (Tạo đơn hàng)
  - `GET /me` (Lịch sử đơn hàng)
- Kích hoạt route này trong `server.js` (`app.use('/api/orders', orderRoutes)`).

## 4. Tích hợp phía Frontend
Đồng bộ tương tự như kiến trúc Giỏ hàng để Teammate dễ thực hiện UI:
- **`constants.js`**: Bổ sung `API_ENDPOINTS.ORDER`.
- **`services/orderApi.js`**: Tạo các lời gọi `fetch()` sử dụng Authentication token.
- **`hooks/useOrder.js`**: Xây dựng Custom Hook xuất ra:
  - Hàm `checkout(orderData)` chạy ngầm trả về success/error.
  - Hàm `loadMyOrders()` lấy lịch sử đơn.
- Cập nhật thêm tài liệu API cho Frontend Teammate.

---

> [!IMPORTANT]
> **User Review Required**:
> 1. Bạn có đồng ý với việc bổ sung 3 trường Thông tin giao hàng (`recipientName`, `phoneNumber`, `shippingAddress`) vào Đơn hàng hay không?
> 2. Theo mặc định, phương thức thanh toán (paymentMethod) sẽ hỗ trợ trước giá trị `COD` (Thanh toán khi nhận hàng). Nếu có thêm các cổng như VNPay/Stripe, ta sẽ thêm sau. Bạn đồng ý chứ?
> 
> Xin hãy xem bản phác thảo này và phản hồi để tôi bắt tay vào thực hiện!
