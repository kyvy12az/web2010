# Web quà tặng 20/10

Trang web một file với hộp quà 3D, bản đồ sao kỷ niệm, vòng ảnh xoay, căn phòng kỷ niệm 3D có thể kéo để đổi góc nhìn, ba đồ vật bí mật, dòng thời gian, lá thư và khu vườn kết. Không cần cài đặt: mở `index.html` bằng trình duyệt hoặc bật GitHub Pages để gửi link.

## Cá nhân hóa trước khi tặng

1. Tạo thư mục `images/`, thêm sáu ảnh (ví dụ `01.jpg` đến `06.jpg`). Không nên commit ảnh riêng tư vào repo công khai nếu chưa được người trong ảnh đồng ý.
2. Trong `index.html`, tìm `const memories = [` và thay lần lượt `src:""` bằng `src:"images/01.jpg"`, `src:"images/02.jpg"`... Sửa `caption` thành kỷ niệm thật. Nếu dùng ít hơn sáu ảnh, có thể giữ các khung minh họa còn lại.
3. Mỗi ngôi sao lấy tiêu đề từ một ảnh trong album. Hai khung ảnh trong căn phòng tự lấy ảnh số 1 và 2. Chạm vào khung để xem ảnh, vào phong bì để tới lá thư, vào bông hoa để nhận lời chúc.
4. Trong `index.html`, tìm `const personal = {`: đổi `name` thành tên người yêu, `songTitle` thành tên bài hát, `voiceNote` thành lời nhắn, và mười dòng trong `reasons` thành những điều thật riêng của hai bạn. Đặt nhạc và ghi âm vào thư mục `media/` rồi điền `song:"media/nhac.mp3"` và `voice:"media/loi-nhan.mp3"`. Không có file thì web sẽ hiện nội dung mẫu và thông báo chưa thêm âm thanh, không tự phát nhạc.
5. Sửa ba cột mốc trong phần `id="story"`, nội dung thư trong `id="letter"`, và lời chúc ở `id="ending"` cho đúng câu chuyện của hai bạn. Khi khám phá máy nghe nhạc, điện thoại và hộp bí mật, khu vườn cuối sẽ mở ra.
6. Nút **Chọn ảnh từ máy** chỉ để xem thử trên máy đang mở web. Ảnh được giữ trong phiên trình duyệt và không lưu lên GitHub; muốn người yêu thấy ảnh qua link phải thêm ảnh vào repo hoặc dùng URL ảnh bạn kiểm soát.

## Gửi link bằng GitHub Pages

Vào **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, nhánh **main**, thư mục **/(root)** rồi Save. Đợi Pages triển khai và lấy địa chỉ được hiển thị tại đó. Repo hiện công khai nên ảnh commit vào repo cũng công khai.

Trang hỗ trợ điện thoại, thao tác vuốt, phím mũi tên, nút xoay căn phòng và tùy chọn giảm chuyển động của hệ điều hành. Các cảnh 3D dùng CSS nên không cần tải thư viện đồ họa bên ngoài.
