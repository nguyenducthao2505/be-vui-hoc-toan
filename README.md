# 🦉 Bé Vui Học Toán

Ứng dụng học toán cho bé 5 tuổi chuẩn bị vào lớp 1. Chạy trên trình duyệt Chrome của máy tính bảng Android, cài ra màn hình chính như một ứng dụng thật (PWA), chạy toàn màn hình, không quảng cáo và không cần tài khoản.

## Nội dung

| Nhóm | Nội dung |
|---|---|
| 🎮 Trò chơi (9) | Bảng số 100 · Tiên cá bắt ngọc · Tô màu theo số · Tiệc trà công chúa · Nối sao thần kỳ · Kỳ lân nhảy số · Bắt bóng bay · Lật thẻ · Xếp hình · Thử thách giọng nói (phạm vi 100) |
| 📚 Bài học (phạm vi 100) | Học số 0–100 (bảng 100 ô) · Chục & đơn vị · Đếm · So sánh · Cộng, trừ không nhớ trong phạm vi 100 · Hình học · Quy luật (đếm thêm 2, 5, 10) · Vị trí |
| 👑 Chủ đề | Công chúa – Nàng tiên – Tiên cá (mặc định) hoặc Thú cưng – Hoa quả; nhân vật dẫn dắt Tiên Nhỏ hoặc Cú Tí Hon |
| 🎤 Giọng nói | Đọc câu hỏi, khen bé; bé bấm micro và nói đáp án |
| 👨‍👩‍👧 Góc bố mẹ | Chủ đề, phạm vi số 10 / 20 / 100 (mặc định 100), tốc độ đọc, tiến độ |

## Bản APK (cài thẳng lên Android, chạy offline)

Mỗi lần có thay đổi trên nhánh `main`, GitHub Actions (tệp `.github/workflows/build-apk.yml`) tự dựng APK và đăng vào mục **Releases** của repository.

1. Trên máy tính bảng, mở trang Releases của repository → bản mới nhất → tải **BeVuiHocToan.apk**.
2. Mở tệp vừa tải; nếu máy hỏi, cho phép Chrome/Trình quản lý tệp **cài ứng dụng không rõ nguồn gốc**.
3. Bản APK dùng giọng đọc và nhận giọng nói của Android. Để bé nói đáp án khi không có mạng: ứng dụng Google → Cài đặt → Giọng nói → Nhận dạng lời nói ngoại tuyến → tải Tiếng Việt (nếu máy hỗ trợ).

Ghi chú: APK được ký bằng khoá gỡ lỗi `debug.keystore` để mỗi bản mới cài đè được lên bản cũ; khoá này chỉ phù hợp dùng trong gia đình, không dùng để đưa lên Google Play.

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

- Bản web: bài học và trò chơi **vẫn chạy khi không có mạng** sau lần mở đầu tiên; riêng **nhận giọng nói** cần Internet. Bản APK chạy offline ngay từ đầu.
- Tiến độ của bé được lưu ngay trên máy (trong trình duyệt).
- Khi sửa mã nguồn, hãy tăng số phiên bản `CACHE` trong `sw.js` (ví dụ `bvht-v2`) để máy tính bảng tải bản mới.

## Cấu trúc mã (tất cả tệp nằm cùng thư mục gốc)

```
index.html            khung trang
style.css             giao diện, hoạt ảnh
core.js               giọng đọc, micro, âm thanh, linh vật, tiện ích
lessons.js            7 dạng bài + học số + màn hoàn thành
games.js              bóng bay, lật thẻ, xếp hình
cartoons.js           (để trống – phần hoạt hình đã gỡ)
app.js                trang chủ, góc bố mẹ, điều hướng
sw.js                 chạy offline (bản web)
games2.js             5 trò chơi chủ đề công chúa + Bảng số 100
package.json, capacitor.config.json, android-setup.sh, android-icon-*.png, debug.keystore   dựng APK
manifest.webmanifest  thông tin cài đặt ứng dụng
icon-*.png            biểu tượng
```
