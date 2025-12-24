# Báo cáo Kiểm tra Toàn diện Dự án Nerd Society v2

Chào anh, em đã hoàn thành việc kiểm tra toàn bộ mã nguồn và cấu trúc dữ liệu của dự án. Dưới đây là các phát hiện quan trọng, những phần chưa hoàn thiện và các đề xuất cải tiến để dự án chuyên nghiệp và ổn định hơn.

## 1. Vấn đề Kỹ thuật Cốt lõi (Nghiêm trọng)

### ⚠️ Xung đột mô hình dữ liệu: **Combo vs Service**
- **Vấn đề**: File `schema.prisma` đánh dấu `Combo` là **Deprecated** (lỗi thời) và thay thế bằng `Service`. Tuy nhiên:
    - Trang chủ (`landing page`) vẫn đang lấy dữ liệu từ bảng `Combo`.
    - Hệ thống đặt phòng (`BookingWizardV2`) lại đang dùng bảng `Service`.
- **Hệ quả**: Nếu Admin cập nhật giá dịch vụ ở mục "Services" trong Admin, thông tin trên trang chủ (mục Combo) sẽ không thay đổi, gây hiểu lầm cho khách hàng.
- **Đề xuất**: Chuyển toàn bộ trang chủ sang dùng mô hình `Service` và xóa bỏ `Combo` để đồng bộ.

## 2. Các chức năng chưa hoàn thiện (Gaps)

### 💰 Hệ thống Tích điểm (Nerd Coin)
- **Tình trạng**: Đã có database (`NerdCoinTransaction`, `nerdCoinBalance`) và logic cộng điểm khi gửi email.
- **Phần thiếu**: 
    - Chưa có giao diện "Lịch sử tích/tiêu điểm" cho khách hàng.
    - Chưa có logic "Đổi điểm" (Redeem) trong API và giao diện để khách có thể dùng điểm trừ vào tiền đặt phòng.
    - Admin chưa có công cụ quản lý tỷ lệ quy đổi điểm linh hoạt.

### 💬 Hệ thống Chat trực tuyến
- **Tình trạng**: Đã có `ChatWidget`, `api/chat` và database.
- **Phần thiếu**:
    - Hiện tại đang chạy trên HTTP truyền thống, chưa có WebSockets (Socket.io) nên tin nhắn không hiển thị "thời gian thực" ngay lập tức mà phải reload hoặc polling.
    - Cần thêm thông báo (Push hoặc Browser Notification) cho nhân viên khi có khách chat mới.

### 📊 Báo cáo và Thống kê (Analytics)
- **Tình trạng**: Hệ thống đã có rất nhiều dữ liệu Booking, Doanh thu, Khách hàng.
- **Phần thiếu**: Chưa có module "Báo cáo doanh thu" (theo ngày/tháng/cơ sở) và "Thống kê mật độ sử dụng phòng" để Admin có cái nhìn tổng quan.

## 3. Đề xuất Cải tiến (UI/UX & Maintainability)

### 🎨 Đồng bộ giao diện (Consistency)
- **Vấn đề**: Dự án đang dùng song song 2 bộ UI (Header/Footer của Landing và Header/Footer của Template app).
- **Hệ quả**: Tạo cảm giác "chắp vá" khi chuyển từ trang chủ sang trang đặt phòng hoặc profile.
- **Đề xuất**: Thống nhất dùng chung các component cơ bản như `Logo`, `Button`, `Header` trên toàn bộ hệ thống.

### 🔐 Bảo mật và Nhật ký hệ thống (Audit Logs)
- **Vấn đề**: Đã có `AuditLog` nhưng mới chỉ ghi lại một số hành động nhỏ.
- **Đề xuất**: Bắt buộc ghi log cho các hành động quan trọng như: **Xác nhận thanh toán thủ công**, **Hủy đơn đặt phòng**, **Thay đổi quyền nhân viên**.

### 📧 Mở rộng Cổng thanh toán
- **Vấn đề**: Schema có đề cập đến MoMo, ZaloPay nhưng hiện tại mới thấy VNPay được implement sâu.
- **Đề xuất**: Hoàn thiện các cổng thanh toán này để đa dạng hóa lựa chọn cho khách hàng.

---

**Kết luận**: Dự án đã có nền tảng rất vững chắc về cấu trúc và logic nghiệp vụ. Tuy nhiên, việc **đồng bộ mô hình Service** và **hoàn thiện hệ thống Nerd Coin** là hai ưu tiên hàng đầu để đưa hệ thống vào vận hành thực tế một cách trơn tru nhất.

Anh có muốn em ưu tiên xử lý vấn đề nào trong danh sách trên trước không ạ?
