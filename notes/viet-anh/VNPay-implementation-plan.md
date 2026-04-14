# Kế hoạch Tích hợp Cổng Thanh Toán VNPay

Đây là bản thiết kế hệ thống chi tiết cho việc tích hợp cổng thanh toán Sandbox VNPay, bao gồm cả Frontend và Backend, chia làm các giai đoạn rõ ràng.

## 1. Cài đặt Dependency & Cấu hình Hệ thống
*   **Backend Packages**: Cài đặt thêm thư viện `moment` (xử lý format chuỗi thời gian cứng `YYYYMMDDHHmmss` của VNPay) và `qs` (xử lý parse và sort tham số chuẩn xác nhất để làm chuỗi ký).
*   **Môi trường (.env)**:
    *   `VNP_TMN_CODE`: Mã website tại VNPay.
    *   `VNP_HASH_SECRET`: Chuỗi bí mật tạo checksum (bảo mật dữ liệu đường truyền).
    *   `VNP_URL`: `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html`
    *   `VNP_RETURN_URL`: Endpoint sẽ hứng user khi User chuyển về từ VNPay.

## 2. Phát triển Logic Backend (Payment Module)
Thêm file chuyên trách `controllers/paymentController.js` và `routes/paymentRoutes.js` chứa 2 endpoints cốt lõi liên quan đến thuật toán chữ ký VNPay:

1.  **VNPAY RETURN (`GET /vnpay_return`)**: 
    *   Endpoint dành cho "Trình Duyệt Khách". Sau khi người dùng nhập thẻ ở VNPay, VNPay sẽ đẩy trình duyệt khách bay về đường dẫn này.
    *   **Nhiệm vụ**: Xác minh chữ ký số (Checksum) sơ bộ, dịch mã lỗi và `res.redirect` chuyển hướng người dùng sang giao diện trang web React (Ví dụ `http://localhost:5173/payment-result?success=true/false`).
2.  **VNPAY IPN (`GET /vnpay_ipn`)**: 
    *   Endpoint Server-to-Server. VNPay Server sẽ ngầm gọi đến đường dẫn này của Backend bạn. (Rất quan trọng trong trường hợp người dùng lỡ tắt tab trình duyệt trước khi về Return).
    *   **Nhiệm vụ**: Xác thực toàn vẹn chữ ký. Tìm đúng ID đơn hàng, cập nhật `paymentStatus = 'PAID'`. Trả lời lại biến `{"RspCode": "00", "Message": "Confirm Success"}` cho VNPay Server.

## 3. Cập nhật Order Workflow
Thay vì tách riêng 2 bước (Tạo đơn -> Bấm nút thanh toán), ta sẽ gộp chung:
*   Trong `orderController.createOrder`:
    *   Cứ tạo Đơn (`PENDING`) như bình thường.
    *   Kiểm tra nếu `paymentMethod === 'VNPAY'`, lập tức chạy mã tạo URL của VNPay với số tiền (`totalPrice`).
    *   Trả về cho Frontend: `{ success: true, paymentUrl: 'https://sandbox.vnpayment.../' }`.

## 4. Cập nhật Frontend React
*   **`useOrder.js`**: Khi `checkout()` trả về có chứa thuộc tính `paymentUrl`, Frontend sẽ dùng lệnh `window.location.href = result.paymentUrl` để đẩy người dùng sang VNPay.
*   **Tạo Router/Page mới**: Tạo trang `PaymentResult.jsx` để hứng kết quả từ việc Backend đánh văng (*redirect*) người dùng về. Giao diện trang này sẽ tuỳ vào query parameter (vd: `?success=true`) để vẽ dấu tích xanh hoặc dấu X đỏ.

## Open Questions (Dành cho bạn)
1. **Mã TmnCode và HashSecret của bạn**: Tôi sẽ xài một bộ Key Test Sandbox của VNPay. Bạn có ok dùng key test không hay bạn đã tạo tài khoản Merchant VNPay rồi?
2. Trong quá trình Local Development, IPN Hook (Bắn từ Server VNPay -> Về Máy tính của bạn) sẽ bị chặn vì nó là `localhost`. Để test được IPN, ta bắt buộc phải cấu hình ngrok để expose Localhost ra Public (VNPay mới ping tới cấp nhật `paymentStatus = PAID` được). Tuy nhiên nếu chỉ Test cơ bản thì Return URL cũng đủ demo cấu trúc rồi. Bạn có muốn đi kèm cấu hình Ngrok không?

Xin phản hồi để bắt tay vào code!
