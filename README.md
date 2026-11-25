# 🦉 Bé Vui Học Toán

Ứng dụng học toán cho bé 5 tuổi chuẩn bị vào lớp 1. Chạy trên trình duyệt Chrome của máy tính bảng Android, cài ra màn hình chính như một ứng dụng thật (PWA), chạy toàn màn hình, không quảng cáo và không cần tài khoản.

## Nội dung

| Nhóm | Nội dung |
|---|---|
| 🎬 Phim hoạt hình (7 phim) | Các bạn thú đến chơi (đếm 1–10) · Chim non về tổ (phép cộng) · Bóng bay bay mất (phép trừ) · Ngôi nhà hình học · Cá sấu tham ăn (lớn hơn/bé hơn) · Mèo con trốn tìm (vị trí) · Tên lửa đếm ngược. Mỗi lần xem, số liệu đổi ngẫu nhiên nên câu chuyện cũng khác đi. |
| 📚 Bài học | Học số 0–10 / 0–20 · Đếm số · So sánh (>, <, =) · Phép cộng · Phép trừ · Hình học (tròn, vuông, tam giác, chữ nhật) · Quy luật · Vị trí (trên, dưới, trái, phải) |
| 🎮 Trò chơi | Bắt bóng bay · Lật thẻ ghép đôi · Kéo thả xếp hình · Thử thách giọng nói |
| 🎤 Giọng nói | Cú Tí Hon đọc câu hỏi và khen bé bằng tiếng Việt. Bé bấm micro rồi nói đáp án (“năm”, “lớn hơn”, “hình tròn”, “bên trái”…). |
| 🏆 Khích lệ | Sao, pháo giấy, hình dán sưu tập, linh vật nhảy múa khi bé làm đúng |
| 👨‍👩‍👧 Góc bố mẹ | Có câu hỏi khoá dành cho người lớn. Trong đó có: phạm vi số 10/20, tốc độ đọc, bật/tắt âm thanh, tự bật micro, xem tiến độ từng bài, thêm video YouTube do bố mẹ tự chọn. |

## Đưa lên GitHub và chạy (khoảng 5 phút)

1. Đăng nhập https://github.com, bấm **New repository** và đặt tên, ví dụ `be-vui-hoc-toan`. Chọn **Public**, rồi bấm **Create repository**.
2. Bấm **uploading an existing file**, kéo tất cả các tệp vào, rồi bấm **Commit changes**.
3. Vào **Settings → Pages**. Ở mục *Source*, chọn **Deploy from a branch**, chọn branch **main** và thư mục **/(root)**, rồi bấm **Save**.
4. Chờ 1–2 phút. Địa chỉ ứng dụng sẽ là: `https://<tên-tài-khoản>.github.io/be-vui-hoc-toan/`

## Cài lên máy tính bảng Android

1. Mở địa chỉ trên bằng **Google Chrome**.
2. Bấm menu ⋮, chọn **Thêm vào màn hình chính** (hoặc **Cài đặt ứng dụng**). Biểu tượng chú cú sẽ hiện trên màn hình chính.
3. Lần đầu bé dùng micro, chọn **Cho phép**.

**Cài giọng đọc tiếng Việt** (nếu máy chưa có): vào *Cài đặt → Quản lý chung / Hệ thống → Ngôn ngữ và nhập liệu → Đầu ra chuyển văn bản thành giọng nói*. Chọn **Dịch vụ lời nói của Google**, bấm ⚙️, vào **Cài đặt dữ liệu giọng nói**, chọn **Tiếng Việt** rồi tải về.

## Lưu ý

- Bài học, trò chơi và phim hoạt hình **vẫn chạy khi không có mạng**, sau lần mở đầu tiên. Riêng tính năng **nhận giọng nói** và video YouTube thì cần Internet.
- Tiến độ của bé được lưu ngay trên máy (trong trình duyệt).
- Khi sửa mã nguồn, hãy tăng số phiên bản `CACHE` trong `sw.js` (ví dụ `bvht-v2`) để máy tính bảng tải bản mới.

## Cấu trúc mã (tất cả tệp nằm cùng thư mục gốc)

```
index.html            khung trang
style.css             giao diện, hoạt ảnh
core.js               giọng đọc, micro, âm thanh, linh vật, tiện ích
lessons.js            7 dạng bài + học số + màn hoàn thành
games.js              bóng bay, lật thẻ, xếp hình
cartoons.js           7 phim hoạt hình + video YouTube
app.js                trang chủ, góc bố mẹ, điều hướng
sw.js                 chạy offline
manifest.webmanifest  thông tin cài đặt ứng dụng
icon-*.png            biểu tượng
```
