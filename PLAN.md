# Kế Hoạch Phát Triển Ứng Dụng Quản Lý Chi Tiêu Cá Nhân (PWA cho iPhone)

> **Mục tiêu**: Xây dựng một ứng dụng chi tiêu cá nhân cài đặt trực tiếp trên iPhone qua PWA (Thêm vào MH chính), nhập liệu thủ công siêu nhanh, có biểu đồ cột trực quan theo tháng, dữ liệu lưu trữ offline an toàn trên máy và giao diện mang phong cách tự nhiên, ấm áp, tinh tế (không bị cứng nhắc hay rập khuôn kiểu AI).

---

## 1. Định Hướng Thiết Kế: "Tự nhiên, Tinh tế & Chuẩn iPhone" (Human-crafted iOS)
Để ứng dụng không bị cảm giác "công nghiệp, cứng nhắc kiểu AI":
* **Bảng màu ấm áp & tự nhiên (Warm Minimal / Organic)**:
  * Nền sáng: Tông màu giấy tự nhiên (Warm Paper `#FBF9F5`), các thẻ card màu trắng kem ngọc trai với đổ bóng cực nhẹ mềm mại.
  * Chế độ tối: Tông than ấm (Warm Charcoal `#1A1918` / `#232220`), dịu mắt cho ban đêm.
  * Màu nhấn danh mục: Dùng các tông màu mộc tự nhiên (Xanh matcha, cam đất terracotta, vàng cát, xanh xám slate, tím hoa cà lavender) thay vì các màu neon chói gắt.
* **Tối ưu thao tác 1 tay (One-handed Ergonomics)**:
  * Nút thêm chi tiêu `+` và thanh điều hướng nằm ở đáy màn hình, vừa vặn với ngón tay cái.
  * Form nhập xuất hiện dưới dạng **Bottom Sheet** (kéo trượt từ dưới lên) với hiệu ứng chuyển động lò xo nảy nhẹ (iOS Spring physics).
* **Chuẩn PWA iPhone (iOS Standalone)**:
  * Xử lý `viewport-fit=cover`, tương thích hoàn hảo với Dynamic Island / Tai thỏ và thanh gạt Home Bar ở đáy (`safe-area-inset`).
  * Có file `manifest.json`, `apple-touch-icon`, màn hình splash, mở ra full-screen không hiện thanh Safari.

---

## 2. Các Tính Năng Cốt Lõi

### A. Nhập Liệu Nhanh & Trực Quan (Quick Expense Input)
* Nút bấm to, rõ ràng, mở ra Bottom Sheet ngay lập tức.
* Ô nhập tiền trực quan tự format dấu phẩy (vd: `45,000 đ`) với các gợi ý nhanh (+10k, +50k, +100k...).
* Danh mục chi tiêu 1 chạm: *Ăn uống, Cà phê, Mua sắm, Di chuyển, Nhà cửa, Sức khỏe, Giải trí, Khác*.
* Mặc định chọn ngày "Hôm nay", có thể lùi ngày dễ dàng nếu ghi bù.
* Ô ghi chú ngắn gọn (ví dụ: "Phở bò", "Grab đi làm").

### B. Biểu Đồ Cột Trực Quan Theo Tháng (Monthly Bar Chart)
* **Bộ chọn tháng mượt mà**: Nút chuyển tháng `< Tháng 10, 2026 >` tiện lợi.
* **Biểu đồ cột tùy biến (Custom Handcrafted Chart - nhẹ, mượt, không giật lag)**:
  * **Chế độ 1: Cột theo ngày trong tháng**: Giúp nhìn ra ngày nào tiêu nhiều nhất (đỉnh điểm chi tiêu), ngày nào tiết kiệm.
  * **Chế độ 2: Cột theo từng danh mục**: So sánh trực tiếp xem tháng này "Ăn uống" hay "Mua sắm" chiếm bao nhiêu cột.
  * Cột bo góc mượt mà, hiệu ứng tăng chiều cao uyển chuyển khi đổi tháng, chạm vào từng cột sẽ hiện số tiền chi tiết.
* **Thẻ tóm tắt thông minh**:
  * Tổng tiền đã tiêu trong tháng.
  * Mức trung bình chi tiêu mỗi ngày.

### C. Danh Sách Giao Dịch & Quản Lý Dữ Liệu
* Phân nhóm theo ngày ("Hôm nay", "Hôm qua", "25 Tháng 10...").
* Xóa / Chỉnh sửa nhanh bằng thao tác chạm.
* **Bảo toàn dữ liệu 100%**: Lưu trữ trên `LocalStorage` của iPhone, không bao giờ mất dữ liệu khi đóng app.
* **Tính năng Sao lưu & Phục hồi (Export/Import JSON)**: Tải file dữ liệu về máy để dự phòng hoặc chuyển sang máy khác bất cứ lúc nào.

---

## 3. Cấu Trúc Kỹ Thuật (Architecture)

```
app/
├── index.html          # Khung giao diện semantic, chuẩn iOS Safe Areas
├── styles.css          # Design system, hiệu ứng spring animation, màu sắc ấm áp
├── app.js              # State management, logic tính toán, render biểu đồ cột
├── manifest.json       # Cấu hình PWA cài đặt vào màn hình chính iPhone
├── sw.js               # Service Worker hỗ trợ chạy offline 100% không cần mạng
└── icons/              # Icon app chuẩn retina cho iPhone (apple-touch-icon)
```

---

## 4. Các Bước Thực Hiện Cụ Thể

1. **Bước 1**: Thiết lập cấu trúc nền tảng `index.html` và hệ thống token thiết kế `styles.css` (Typography, Safe Area, bảng màu tự nhiên, responsive).
2. **Bước 2**: Xây dựng module Biểu đồ cột tương tác (hỗ trợ chuyển đổi giữa xem theo ngày và xem theo danh mục, chạm xem chi tiết).
3. **Bước 3**: Xây dựng Bottom Sheet nhập giao dịch, bàn phím số/nhập liệu mượt mà, hệ thống danh mục.
4. **Bước 4**: Xây dựng danh sách lịch sử chi tiêu, phân nhóm ngày, bộ lọc tháng và chức năng Sao lưu/Xuất dữ liệu.
5. **Bước 5**: Tích hợp PWA (Manifest, Service Worker, Apple Touch Icon) và chạy thử nghiệm trên môi trường giả lập iPhone để kiểm tra cảm giác vuốt chạm.
