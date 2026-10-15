# Web quà tặng 20/10

## Cây điều ước · Hành tinh Ngày mai

Chọn **Ngày mai (06)** để vào ngọn đồi dưới ánh trăng. Cây xanh tím dùng bộ sinh thân/cành/lá của [EZ Tree](https://github.com/dgreenheck/ez-tree), giữ giấy phép MIT và nguồn tại `vendor/ez-tree/`. Sáu đèn lồng treo ở các vị trí lấy từ cành thật; chạm đèn hoặc nút tương ứng để camera tiến gần và mở lời nhắn. Mở đủ sáu đèn, các sao nối thành trái tim; chọn **Ngắm bầu trời** để xem toàn cảnh.

- **Viết điều ước** tạo đèn lồng bay lên. Giữ tối đa 30 điều ước, mỗi điều 240 ký tự, trong localStorage `linh-wishing-tree-v1` của trình duyệt đang dùng. Có thể đọc lại trong khung viết điều ước. Không có backend, không đồng bộ hoặc gửi điều ước sang máy khác. Nếu lưu thất bại, giao diện báo rõ chỉ giữ được trong phiên.
- `wish-tree-world.js`: nội dung sáu lời nhắn, giao diện và lưu tiến trình. `wish-tree-three.js`: cây, đèn, đom đóm, sao băng và trái tim. `wish-tree.css`: bố trí điện thoại/máy tính.
- Nút dừng và chế độ giảm chuyển động dừng chuyển động nền; đèn mới xuất hiện ở vị trí trên cao nếu đang dừng. Chạm vẫn mở lời nhắn và hoàn tất hiệu ứng trái tim. Cảnh dừng khi ẩn tab, giải phóng tài nguyên khi đóng; chỉ tải mã 3D khi vào hành tinh. Khi 3D không tải được, vẫn đọc lời nhắn và lưu điều ước.


## Rạp kỷ niệm · Hành tinh Ngày đẹp

Chọn **Ngày đẹp (02)** để vào rạp, rồi chạm **Mời Linh vào rạp**: camera đến hàng D, rèm mở và màn chiếu phát slideshow từ album hiện có, cùng `personals/voice.mp3`. Có thể tạm dừng, tắt lời nhắn, chiếu lại, chọn ghế hoặc kéo để nhìn quanh. Nhạc nền tạm dừng khi vào rạp và khôi phục khi thoát nếu trước đó đang phát. Chuyển tab sẽ tạm dừng suất chiếu.

- `cinema-world.js`: cửa vào rạp, vé, âm thanh và điều khiển.
- `cinema-three.js`: cảnh Three.js, rèm và màn chiếu CanvasTexture; đây là slideshow, chưa dùng video MP4.
- `vantage-geometry.js`: phần dựng ghế và bố trí hàng ghế được trích/adapt từ [Vantage](https://github.com/thebuggeddev/vantage), file `index.html` blob `613ce6518cd2f99da410de003b89ba24d15a3172`. Thay đổi: tách ES module, Three.js r170, cấu hình rạp riêng; không dùng giao diện đặt vé, trailer hoặc analytics của bản gốc.
- Phần mã Vantage theo **PolyForm Noncommercial 1.0.0**; giữ giấy phép và Required Notice tại `vendor/vantage/LICENSE.md`, cùng thông báo thư viện tại `vendor/vantage/THIRD-PARTY-NOTICES.md`. Dự án quà tặng này sử dụng phi thương mại. Three.js tải từ jsDelivr khi mở rạp.


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

## Các thế giới bên trong hành tinh

Chọn **Nụ cười (01)** hoặc **Bình yên (05)** để bay vào thế giới tương ứng. Nút **Về vũ trụ** hoặc phím Escape đưa người xem trở lại cảnh cũ.

- **Nụ cười:** vườn trên mây, sáu bông hoa nở khi chạm. Mỗi hoa mở ảnh cùng thứ tự trong album và một lời nhắn.
- **Bình yên:** biển hoàng hôn, ba chai thủy tinh chứa lời động viên.
- Các nút dưới cảnh giúp chọn đồ vật thuận tiện bằng bàn phím hoặc điện thoại. Tiến trình khám phá được lưu trên trình duyệt đang dùng (localStorage), không gửi lên máy chủ.
- Sửa lời nhắn trong `messages` và `letters` của `planet-worlds.js`. Vườn Nụ cười và Bình yên dùng Three.js/WebGL, hỗ trợ giảm chuyển động và nút dừng.

## Khu vườn trên mây · Nụ cười

- Đảo vườn 3D với địa hình cỏ và chân đá lơ lửng trên biển mây chuyển động; cây hoa hồng phấn ở giữa có cánh hoa rơi, xích đu đôi, lối đá và bướm bay.
- Chạm một trong sáu bông hoa (hoặc sáu nút dưới màn hình) để hoa nở và mở đúng ảnh/lời nhắn trong album. Mở đủ sáu hoa sẽ làm cây phát sáng và hiện lời nhắn hoàn thành. Tiến trình cũ được giữ trong `linh-planet-worlds-v1`; danh sách được loại trùng khi đọc.
- Kéo để xoay, phím mũi tên để đổi góc, Home hoặc **Tiếp tục ngắm vườn** để về toàn cảnh. Nút dừng và chế độ giảm chuyển động dừng mây, bướm, cánh hoa và xích đu; hoa vẫn mở khi được chọn.
- `garden-three.js` dựng cảnh, `garden-ui.css` bố trí ảnh và lời nhắn trên điện thoại. Module chỉ tải khi vào Nụ cười; nếu WebGL/CDN lỗi vẫn dùng được sáu nút để xem ảnh. Cảnh dừng khi ẩn tab và giải phóng tài nguyên khi đóng.
- `small-world-garden.js` tích hợp trực tiếp các hàm `smoothstep`, `islandFalloff`, `makeHeightFn` từ `src/terrain.js` và `makeButterfly` từ `src/fauna/butterfly.js` của [Small World](https://github.com/paulrobello/small-world), snapshot tree `0416bbcf7dbc58b2782f13698c74ac1dde459613`. Adaptation: bỏ catalog/global state, dùng Three.js r170 CDN, height sampler riêng, đường bay bướm riêng. Không nhúng toàn bộ ứng dụng Small World.
- Copyright © 2026 Paul Robello, giấy phép MIT được giữ tại `vendor/small-world/LICENSE`. Cây, hoa tương tác, xích đu, mây và phần thưởng là phần tùy biến của web này.

## Bãi biển Three.js

- `beach-three.js` dựng địa hình cát, sóng và bọt biển bằng shader, trời hoàng hôn, bóng cây, đá và ba chai thủy tinh 3D. `beach-ui.css` bố trí giao diện toàn màn hình và lá thư trên điện thoại.
- Kéo để nhìn quanh, chạm chai hoặc dùng nút chọn chai để mở thư; chọn **Tiếp tục ngắm biển** để trở lại góc nhìn ban đầu. Bàn phím hỗ trợ mũi tên và Home khi canvas được chọn.
- Three.js 0.170.0 tải từ jsDelivr khi vào Bình yên lần đầu; cần kết nối mạng và WebGL. Nếu không tải được cảnh, các nút đọc thư vẫn dùng được.
- Giới hạn độ phân giải trên điện thoại, gom lá cây bằng instancing, dừng khi ẩn tab và giải phóng tài nguyên khi rời cảnh.
- Đây là cảnh 3D dựng bằng hình học và shader, không phải ảnh/video bãi biển hay mô hình quét thực tế.

