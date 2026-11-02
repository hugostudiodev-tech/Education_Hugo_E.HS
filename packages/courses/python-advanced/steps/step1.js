// Step 1 — LabLog and the Python foundations entry test.
import { STEP_IDS } from "../stages.js";

const q = (question, options, why) => ({ q: question, o: options, a: 0, why });
const ADMISSION_QUIZ = [
  q("print(4 + 3) in ra gì?", ["7", "43", "4 + 3", "Lỗi"], "Không có dấu ngoặc kép nên Python tính phép cộng trước khi in."),
  q("Sau lệnh diem = 8, diem là gì?", ["Tên biến đang giữ số 8", "Một câu lệnh in", "Một danh sách", "Tên hàm có sẵn"], "Dấu = gán giá trị bên phải vào tên biến bên trái."),
  q("Giá trị nào có kiểu str?", ['"12"', "12", "12.0", "True"], "Chữ đặt trong dấu nháy là xâu, dù bên trong nhìn giống số."),
  q("Hàm input() trả về kiểu dữ liệu nào?", ["str", "int", "float", "bool"], "input() đọc chữ; muốn tính số cần đổi kiểu phù hợp."),
  q("Đổi chuỗi chuoi = '15' thành số nguyên bằng cách nào?", ["int(chuoi)", "str(chuoi)", "bool(chuoi)", "len(chuoi)"], "int() chuyển chuỗi số hợp lệ thành số nguyên."),
  q("Kết quả của 17 // 5 là gì?", ["3", "3.4", "2", "5"], "// là phép chia lấy phần nguyên."),
  q("Kết quả của 17 % 5 là gì?", ["2", "3", "3.4", "0"], "% trả về phần dư của phép chia."),
  q("Kết quả của 2 ** 3 là gì?", ["8", "6", "5", "23"], "** là phép luỹ thừa: 2 nhân với chính nó 3 lần."),
  q("Biểu thức 6 <= 6 trả về gì?", ["True", "False", "6", "Lỗi"], "Toán tử <= kiểm tra nhỏ hơn hoặc bằng."),
  q("Khi x = 4, nhánh nào chạy trong if x > 5: ... else: ...?", ["else", "if", "cả hai", "không nhánh nào"], "4 không lớn hơn 5 nên điều kiện sai và else chạy."),
  q("Trong cấu trúc if / elif / else, khi nhiều điều kiện đúng thì sao?", ["Chạy nhánh đúng đầu tiên", "Chạy tất cả nhánh đúng", "Chỉ chạy else", "Python chọn ngẫu nhiên"], "Python kiểm tra lần lượt và chỉ chạy nhánh đầu tiên có điều kiện đúng."),
  q("Biểu thức True and False cho kết quả nào?", ["False", "True", "0", "Lỗi"], "and chỉ đúng khi cả hai vế đều đúng."),
  q("list(range(2, 5)) tạo ra danh sách nào?", ["[2, 3, 4]", "[2, 3, 4, 5]", "[1, 2, 3, 4]", "[5, 4, 3]"], "Điểm cuối của range không được lấy."),
  q("Trong while n > 0, vì sao thường cần thay đổi n?", ["Để điều kiện cuối cùng có thể sai", "Để đổi n thành chuỗi", "Để bỏ thụt lề", "Để lặp nhanh hơn"], "Nếu n không đổi và điều kiện luôn đúng, vòng lặp có thể chạy mãi."),
  q("Lệnh break trong vòng lặp làm gì?", ["Thoát khỏi vòng lặp gần nhất", "Bỏ qua một lần lặp rồi tiếp tục", "Khởi động lại chương trình", "Xoá biến vòng lặp"], "break kết thúc vòng lặp đang chứa nó."),
  q("Sau a = [5, 8], a.append(10), a có giá trị nào?", ["[5, 8, 10]", "[10, 5, 8]", "[5, 8]", "10"], "append thêm phần tử vào cuối list."),
  q("Với a = ['A', 'B', 'C'], a[0] là gì?", ["'A'", "'B'", "'C'", "Lỗi"], "Chỉ số của list bắt đầu từ 0."),
  q("Với a = [2, 4, 6, 8], a[1:3] là gì?", ["[4, 6]", "[2, 4, 6]", "[4, 6, 8]", "[1, 2, 3]"], "Cắt lát lấy từ chỉ số đầu và dừng trước chỉ số cuối."),
  q("diem = {'An': 9}; diem['An'] trả về gì?", ["9", "'An'", "{'An': 9}", "None"], "dict tra cứu giá trị bằng khoá 'An'."),
  q("Khi thêm phần tử trùng vào set, điều gì xảy ra?", ["Set chỉ giữ một bản của phần tử", "Set tự sắp xếp theo chữ cái", "Chương trình luôn báo lỗi", "Phần tử cũ bị đổi kiểu"], "set lưu các giá trị duy nhất, không giữ bản trùng."),
  q("Đặc điểm nào đúng với tuple?", ["Không thể gán lại từng phần tử sau khi tạo", "Luôn chứa đúng một phần tử", "Tự loại bỏ giá trị trùng", "Chỉ chứa số"], "tuple là dãy có thứ tự nhưng không thể thay phần tử tại chỗ."),
  q("Một hàm muốn gửi kết quả về nơi gọi dùng từ khoá nào?", ["return", "print", "input", "break"], "return trả một giá trị; print chỉ hiển thị ra màn hình."),
  q("def chao(ten='Bạn'): khai báo gì?", ["Tham số ten có giá trị mặc định", "Biến ten luôn là số", "Hàm không nhận tham số", "Một vòng lặp"], "Giá trị mặc định được dùng khi lời gọi không truyền đối số ten."),
  q("Biến tạo bên trong hàm thường có phạm vi nào?", ["Trong hàm đó", "Tự động ở mọi tệp", "Chỉ dùng trong vòng lặp", "Không thể đọc trong hàm"], "Tên biến cục bộ thuộc phạm vi lời gọi hàm."),
  q("int('tám') gây lỗi nào thường cần bắt?", ["ValueError", "IndexError", "KeyError", "NameError"], "Chuỗi không biểu diễn số nguyên nên int() phát sinh ValueError."),
  q("Với open('diem.csv', newline='', encoding='utf-8'), newline='' giúp gì?", ["Để csv xử lý dòng mới đúng cách", "Mã hoá tệp thành số", "Xoá dòng trống trong dữ liệu", "Tự tạo tiêu đề cột"], "Tài liệu csv khuyến nghị mở tệp văn bản với newline='' để module quản lý xuống dòng."),
  q("Lợi ích của with open(...) là gì?", ["Tệp được đóng tự động khi rời khối", "Tệp được nén tự động", "Dữ liệu tự chuyển thành số", "Không cần quyền đọc"], "Context manager đóng tệp cả khi khối lệnh kết thúc do lỗi."),
  q("[x * 2 for x in [1, 3]] tạo ra gì?", ["[2, 6]", "[1, 3, 2, 6]", "[2, 4, 6]", "2"], "List comprehension tính biểu thức x * 2 cho từng phần tử."),
  q("Sau class HocSinh: pass và ban = HocSinh(), ban là gì?", ["Một đối tượng được tạo từ lớp HocSinh", "Một tên module", "Một hàm dựng sẵn", "Một kiểu dữ liệu số"], "Gọi tên lớp với ngoặc tạo một đối tượng."),
  q("Lỗi IndentationError thường chỉ ra điều gì?", ["Thụt lề không hợp lệ", "Sai tên tệp CSV", "Chia một số cho 0", "Thiếu kết nối Internet"], "Thụt lề xác định khối lệnh trong Python và phải nhất quán."),
];
function makeAdmissionStep() {
  const id = STEP_IDS[0];
  return {
    id,
    lang: "python",
    file: "lablog/README.md",
    duration: "60 phút",
    summary: "Tìm hiểu dự án nghiên cứu LabLog và làm bài kiểm tra Python cơ bản gồm 30 câu. Đạt ít nhất 60% (18/30) để mở bài tiếp theo; được thi lại không giới hạn.",
    slides: [
      {
        section: "intro",
        title: "Chào mừng tới Python nâng cao",
        body: `Khoá học gồm **40 bài, 8 chặng**. Dự án xuyên suốt là **LabLog**: nhập CSV giả lập → kiểm tra dữ liệu → lưu SQLite → mở API → phân tích → xuất báo cáo có giới hạn kết luận.\n\nDành cho người đã học Python cơ bản. Bài này gồm giới thiệu dự án và bài kiểm tra đầu vào **30 câu**, chấm trên 100%. Cần đạt **từ 60% (18/30 câu)**; được thi lại không giới hạn.`,
      },
      {
        section: "visual",
        title: "Sản phẩm cần hoàn thành",
        body: `Cuối khoá, bạn bàn giao một dự án chạy được trên máy cá nhân:\n\n1. CSV mẫu giả lập có từ điển dữ liệu.\n2. SQLite có schema, ràng buộc và truy vấn.\n3. API có kiểm tra đầu vào, phân trang và test.\n4. Báo cáo tái lập được, trích dẫn nguồn và nêu giới hạn.\n\nPyPlayground chạy ví dụ Python nhỏ. FastAPI và database tệp sẽ chạy trên máy tính theo hướng dẫn của từng bài, không chạy trong ô trình duyệt.`,
        py: {
          code: "observations = [\n    {'code': 'S01', 'focus': 8},\n    {'code': 'S02', 'focus': 6},\n    {'code': 'S03', 'focus': 9},\n]\nmean_focus = sum(row['focus'] for row in observations) / len(observations)\nprint(f'{len(observations)} dòng giả lập; điểm tập trung trung bình = {mean_focus:.1f}')",
        },
      },
      {
        section: "research",
        title: "Nghiên cứu có trách nhiệm",
        body: `Câu hỏi minh hoạ: “Trong **bộ dữ liệu mô phỏng**, giờ ngủ có đi cùng điểm tập trung không?” Các dòng được tạo để luyện kỹ thuật, không đại diện học sinh thật và không thể chứng minh quan hệ nhân quả.\n\nMỗi lần chạy cần ghi nguồn dữ liệu, cách kiểm tra, số hàng và giới hạn diễn giải.\n\n> Python Software Foundation (n.d.) *The Python Tutorial*. Available at: https://docs.python.org/3/tutorial/`,
      },
      {
        section: "ideate",
        title: "Cách làm bài kiểm tra",
        body: `Bài kiểm tra lấy kiến thức Python cơ bản: kiểu dữ liệu, điều kiện, vòng lặp, list/dict, hàm, lỗi, tệp CSV và class.\n\n- 30 câu, mỗi câu có trọng số bằng nhau; điểm hiển thị theo phần trăm.\n- Đạt khi điểm từ 60% trở lên; với 30 câu là **ít nhất 18 câu đúng**.\n- Thi lại không giới hạn. Kết quả được lưu vào tài khoản để mở bài 2.\n- Cần đăng nhập để lưu kết quả và bảo vệ thứ tự bài học.`,
      },
      {
        section: "core",
        title: "Sẵn sàng cho LabLog?",
        body: `Trước khi nộp, hãy chắc bạn hiểu: dữ liệu đầu vào từ \`input()\` là chuỗi; chỉ số list bắt đầu ở 0; hàm dùng \`return\` để trả kết quả; tệp nên được đóng an toàn; lỗi cần đọc từ traceback.\n\nKhông cần đoán mẹo. Đọc kỹ từng câu; sau khi nộp, hệ thống cho xem giải thích để bạn biết phần nào cần ôn.`,
      },
    ],
    quiz: ADMISSION_QUIZ,
  };
}

export default makeAdmissionStep();
