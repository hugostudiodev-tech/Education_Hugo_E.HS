// Step 32 — Mẫu, sai lệch và bất định
import { createStep } from "../createStep.js";

export default createStep(31, {
    fact: "Sai lệch chọn mẫu và cỡ mẫu ảnh hưởng cách diễn giải; mô tả bất định thay vì khẳng định quá mức.",
    trap: "Mẫu lớn tự động đại diện cho mọi nhóm và loại bỏ mọi sai lệch.",
    scenario: "Dữ liệu chỉ gồm người tự nguyện trả lời khảo sát trực tuyến.",
    apply: "Nêu cách chọn mẫu, nhóm có thể bị thiếu và giới hạn khái quát.",
    output: "Báo cáo nêu cỡ mẫu và cách lấy mẫu trước khi diễn giải.",
    wrongOutput: "Mối liên hệ quan sát được chứng minh biến A gây ra biến B.",
    verify: "Kiểm tra ai được mời, ai vắng mặt và dữ liệu nào bị loại.",
    debug: "Phân tích lại theo nhóm/giả định hợp lý và ghi rõ thay đổi.",
    limit: "Mẫu tự chọn không đại diện nếu xác suất tham gia khác nhau có hệ thống.",
    test: "Người đọc có thể tìm trong báo cáo cỡ mẫu, tuyển chọn và giới hạn.",
    demo1: "responses = 24\neligible = 100\nprint(f'{responses}/{eligible} responded')",
    demo2: "limitations = ['synthetic data', 'small sample', 'no causal design']\nprint('; '.join(limitations))",
    practice: "Tính tỷ lệ phản hồi và in kèm số người phản hồi.",
    solution: "responses, invited = 24, 80\nrate = responses / invited\nprint(f'response rate: {rate:.0%} ({responses}/{invited})')",
    source: "python",
  });
