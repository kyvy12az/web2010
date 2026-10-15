# Web quà tặng 20/10

Trang web với hộp quà 3D, vũ trụ kỷ niệm tương tác, vòng ảnh xoay, căn phòng kỷ niệm 3D có thể kéo để đổi góc nhìn, ba đồ vật bí mật, dòng thời gian, lá thư và khu vườn kết. Không cần cài đặt: bật GitHub Pages để gửi link hoặc dùng máy chủ HTTP cục bộ (ví dụ `python -m http.server`). Cảnh Three.js cần được mở qua HTTP/HTTPS.

## Cá nhân hóa trước khi tặng

1. Tạo thư mục `images/`, thêm sáu ảnh (ví dụ `01.jpg` đến `06.jpg`). Không nên commit ảnh riêng tư vào repo công khai nếu chưa được người trong ảnh đồng ý.
2. Trong `index.html`, tìm `const memories = [` để sửa `caption` thành kỷ niệm thật. Sáu đường dẫn ảnh hiện là `images/01.jpg` đến `images/06.jpg`; thay file ảnh tại các đường dẫn ấy nếu muốn.
3. Mỗi hành tinh mở một ảnh tương ứng trong album. Hai khung ảnh trong căn phòng tự lấy ảnh số 1 và 2. Chạm vào khung để xem ảnh, vào phong bì để tới lá thư, vào bông hoa để nhận lời chúc.
4. Trong `index.html`, tìm `const personal = {` để sửa tên, tên bài hát, lời nhắn và mười điều yêu thích. File nhạc và lời ghi âm hiện được khai báo tại `personals/song.mp3` và `personals/voice.mp3`. Nhạc bắt đầu khi bấm **Mở món quà**, tiếp tục khi đóng máy đĩa, và có nút nhỏ để tạm dừng. Một số trình duyệt có thể chặn phát tự động; khi đó chạm nút nhạc để bật. Lời ghi âm phát khi chạm điện thoại và tạm dừng nhạc nền trong lúc nghe.
5. Sửa ba cột mốc trong phần `id="story"`, nội dung thư trong `id="letter"`, và lời chúc ở `id="ending"` cho đúng câu chuyện của hai bạn. Khi khám phá máy nghe nhạc, điện thoại và hộp bí mật, khu vườn cuối sẽ mở ra.
6. Nút **Chọn ảnh từ máy** chỉ để xem thử trên máy đang mở web. Ảnh được giữ trong phiên trình duyệt và không lưu lên GitHub; muốn người yêu thấy ảnh qua link phải thêm ảnh vào repo hoặc dùng URL ảnh bạn kiểm soát.

## Gửi link bằng GitHub Pages

Vào **Settings → Pages → Build and deployment**, chọn **Deploy from a branch**, nhánh **main**, thư mục **/(root)** rồi Save. Đợi Pages triển khai và lấy địa chỉ được hiển thị tại đó. Repo hiện công khai nên ảnh commit vào repo cũng công khai.

Trang hỗ trợ điện thoại, thao tác vuốt, phím mũi tên, nút xoay căn phòng và tùy chọn giảm chuyển động của hệ điều hành. Căn phòng và các đồ vật dùng CSS 3D. Cảnh vũ trụ dựng tọa độ không gian, chiếu phối cảnh lên Canvas 2D; không cần tải thư viện đồ họa bên ngoài.

## Vũ trụ kỷ niệm

- Kéo ngang để xoay; trên máy tính có thể kéo dọc để đổi độ nghiêng.
- Chọn hành tinh hoặc nút kỷ niệm để đưa góc nhìn lại gần, rồi bấm **Mở ảnh kỷ niệm**.
- Dùng **+ / −** để thu phóng, **Toàn cảnh** để trở về và **Tạm dừng** để dừng chuyển động.
- Khi đặt tiêu điểm trên cảnh, dùng phím mũi tên, dấu cộng/trừ, Home và phím cách.
- `universe.js` xử lý cảnh và tương tác; `universe.css` xử lý giao diện. Giữ cả hai cạnh `index.html` khi đưa web lên máy chủ.
- Cảnh giới hạn mật độ điểm ảnh, dừng khi ra khỏi màn hình hoặc chuyển tab, và mặc định đứng yên nếu hệ điều hành bật giảm chuyển động.

## Hai thế giới bên trong hành tinh

Chọn **Nụ cười (01)** hoặc **Bình yên (05)** để bay vào thế giới tương ứng. Nút **Về vũ trụ** hoặc phím Escape đưa người xem trở lại cảnh cũ.

- **Nụ cười:** vườn trên mây, sáu bông hoa nở khi chạm. Mỗi hoa mở ảnh cùng thứ tự trong album và một lời nhắn.
- **Bình yên:** biển hoàng hôn, ba chai thủy tinh chứa lời động viên.
- Các nút dưới cảnh giúp chọn đồ vật thuận tiện bằng bàn phím hoặc điện thoại. Tiến trình khám phá được lưu trên trình duyệt đang dùng (localStorage), không gửi lên máy chủ.
- Sửa lời nhắn trong `messages` và `letters` của `planet-worlds.js`; sửa diện mạo trong `planet-worlds.css`. Vườn Nụ cười dùng CSS 3D; Bình yên dùng Three.js/WebGL, hỗ trợ giảm chuyển động và nút dừng.

## Bãi biển Three.js

- `beach-three.js` dựng địa hình cát, sóng và bọt biển bằng shader, trời hoàng hôn, bóng cây, đá và ba chai thủy tinh 3D. `beach-ui.css` bố trí giao diện toàn màn hình và lá thư trên điện thoại.
- Kéo để nhìn quanh, chạm chai hoặc dùng nút chọn chai để mở thư; chọn **Tiếp tục ngắm biển** để trở lại góc nhìn ban đầu. Bàn phím hỗ trợ mũi tên và Home khi canvas được chọn.
- Three.js 0.170.0 tải từ jsDelivr khi vào Bình yên lần đầu; cần kết nối mạng và WebGL. Nếu không tải được cảnh, các nút đọc thư vẫn dùng được.
- Giới hạn độ phân giải trên điện thoại, gom lá cây bằng instancing, dừng khi ẩn tab và giải phóng tài nguyên khi rời cảnh.
- Đây là cảnh 3D dựng bằng hình học và shader, không phải ảnh/video bãi biển hay mô hình quét thực tế.
