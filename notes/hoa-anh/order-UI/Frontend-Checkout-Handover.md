# Tài liệu bàn giao API Đặt Hàng (Order / Checkout)

## 1. Thông tin chung
- **Base URL**: `http://localhost:8082/api/orders`
- **Headers**: Với tất cả API Đặt Hàng, yêu cầu bắt buộc phải có Token đăng nhập.
  `Authorization: Bearer <TOKEN_CỦA_USER>`

## 2. Danh sách API Đặt Hàng (Order)

### 2.1. Đặt Hàng (Checkout từ Giỏ hàng) (`POST /api/orders`)
API sẽ rà soát lại giỏ hàng của người dùng, kiểm tra lại tồn kho. Nếu hợp lệ, trừ tiền (nếu có), trừ kho, tạo đơn hàng và làm rỗng giỏ hàng.
- **Body (JSON)**:
```json
{
  "recipientName": "Vũ Anh Nam", // Bắt buộc
  "phoneNumber": "0987654321", // Bắt buộc (10-11 số)
  "shippingAddress": "Đường Xuân Thủy, Cầu Giấy, Hà Nội", // Bắt buộc
  "paymentMethod": "COD" // Tùy chọn, mặc định là COD. Tương lai hỗ trợ "VNPAY".
}
```
**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Đặt hàng thành công",
  "data": {
    "id": 1,
    "userId": 5,
    "totalPrice": "1000000",
    "status": "PENDING",
    "paymentMethod": "COD",
    "paymentStatus": "PENDING",
    "recipientName": "Vũ Anh Nam",
    "phoneNumber": "0987654321",
    "shippingAddress": "Đường Xuân Thủy, Cầu Giấy, Hà Nội",
    "updatedAt": "...",
    "createdAt": "..."
  }
}
```

### 2.2. Lấy Lịch sử đơn hàng (`GET /api/orders/me`)
Lấy danh sách các đơn hàng đã đặt của người dùng, xếp theo mới nhất. Dùng làm màn hình "Đơn mua của tôi".
**Response (200 OK)**:
```json
{
  "success": true,
  "data": [
    {
       "id": 1,
       "totalPrice": "1000000",
       "status": "PENDING", 
       // ... thông tin người nhận
       "createdAt": "2026-04-14T01:00:00Z",
       "orderItems": [
         {
           "id": 1,
           "quantity": 2,
           "priceAtPurchase": "500000",
           "glasses": {
              "id": 2,
              "name": "Kính râm mát mẻ",
              "image": "/img.png"
           }
         }
       ]
    }
  ]
}
```

---

## 3. Kiến trúc Cổng thanh toán VNPay (Tham khảo Dành Cho Tương Lai)

Nếu sau này mở rộng thêm lựa chọn thanh toán bằng cổng **VNPay** (`VNPAY`), quy trình nghiệp vụ (Flow) sẽ thay đổi như sau:

1. **Giao diện Giỏ hàng (Frontend)**: Người dùng chọn thanh toán bằng `"VNPAY"` và nhấn "Thanh toán".
2. **Backend Mở Đơn (Init Order)**: Gọi API `POST /api/orders`. Backend tạo Đơn hàng với `status = 'PENDING'` và `paymentStatus = 'PENDING'`. 
3. **Backend Tạo Link (VNPAY IPN)**: Thay vì trả về `"Đặt hàng thành công"` ngay lập tức, Backend sinh ra một chuỗi mã hóa bảo mật (MAC/Checksum) và trả về Frontend một **URL Chuyển Hướng** (Redirect URL) về trang thanh toán của VNPAY. Ví dụ: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=...` 
4. **Frontend Redirect**: Frontend nhận URL này và chuyển (redirect) người dùng qua trang web của VNPay. Người dùng quẹt thẻ ở đó.
5. **VNPAY Return**: Thanh toán xong, VNPay điều hướng người dùng (Redirect) về lại trang Frontend (VD: `http://localhost:5173/payment/result?vnp_ResponseCode=00`). Ở trạng thái này, Front-end đọc `ResponseCode=00` và hiển thị "Giao dịch thành công", nhưng đó chỉ là hiển thị tạm tính.
6. **Webhooks (IPN)**: Cùng lúc với bước 5, server VNPAY sẽ ngầm gửi một gói dữ liệu HTTP Request qua Back-end ở một đường liên kết (Webhooks). Back-end sẽ dùng SecretKey để xác minh độ tin cậy của thông báo, đổi `paymentStatus = 'PAID'` (Đã Thanh Toán) cho Đơn hàng đó trong Database để hoàn tất chu trình kín! Mọi gian lận URL phía Frontend đều vô nghĩa vì DB chỉ chờ Webhooks.



## 4. Hướng dẫn dành cho Frontend (Sử dụng Hook useOrder)

Thay vì gọi API thủ công, bạn hãy sử dụng Hook `useOrder` có sẵn. Hook này đã xử lý việc đính kèm Token, quản lý trạng thái loading và cập nhật lại giỏ hàng sau khi mua thành công.

### 4.1. Cách nhúng vào Component
 ```jsx
 import { useOrder } from '../hooks/useOrder';

 const CheckoutPage = () => {
   const { checkout, loading, error } = useOrder();
 
   const handleCheckout = async (formData) => {
     const result = await checkout(formData);
     if (result.success) {
       alert("Đặt hàng thành công!");
       // Chuyển hướng hoặc đóng modal...
     } else {
       alert("Lỗi: "  result.message);
     }
   };
 
   return (
     // Giao diện HTML/CSS của bạn ở đây
     <button disabled={loading} onClick={() => handleCheckout(data)}>
       {loading ? 'Đang xử lý...' : 'Thanh toán'}
     </button>
   );
 };
 ```
 
 ### 4.2. Các dữ liệu và hàm có sẵn trong useOrder
 | Tên | Loại | Mô tả |
 | :--- | :--- | :--- |
 | `orders` | Array | Chứa danh sách đơn hàng (Dùng để render trang Lịch sử đơn hàng). |
 | `loading` | Boolean | Trạng thái đang gọi API (Dùng để hiện Spinner hoặc disable nút bấm). |
 | `error` | String | Thông báo lỗi nếu có. |
 | `loadMyOrders()` | Function | Cần gọi hàm này trong `useEffect` để lấy dữ liệu nạp vào biến `orders`. |
 | `checkout(data)` | Function | Hàm chính để đặt hàng. Nhận vào object chứa: `recipientName`, `phoneNumber`, `shippingAddress`. |
