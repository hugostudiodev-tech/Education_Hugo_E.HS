// Step 36 — CLI nhập bộ dữ liệu có kiểm tra
import { createStep } from "../createStep.js";

export default createStep(35, {
    fact: "argparse chuyển tham số CLI thành giá trị có tên và giúp lệnh nhập dữ liệu được lặp lại.",
    trap: "Lệnh CLI nên tự chạy khi import module để người dùng không cần biết tham số.",
    scenario: "Nhập CSV bằng python -m lablog import-data --file data/sample.csv.",
    apply: "Khai báo subcommand, tham số bắt buộc và thông báo --help.",
    output: "Người dùng chạy lệnh có cấu trúc và nhận lỗi tham số rõ ràng.",
    wrongOutput: "argparse tự xác minh nội dung từng hàng CSV.",
    verify: "Chạy --help, file hợp lệ, file thiếu và đường dẫn sai.",
    debug: "Đặt điểm vào main() và dùng if __name__ == '__main__'.",
    limit: "CLI giúp thao tác lặp lại nhưng không tự bảo vệ endpoint API.",
    test: "Gọi main(argv) với lệnh hợp lệ, thiếu --study, sai đuôi tệp và đường dẫn không tồn tại; không sửa sys.argv thật.",
    demo1: "import argparse\n\nparser = argparse.ArgumentParser(prog='lablog', description='Công cụ nhập dữ liệu nghiên cứu')\nprint(parser.prog)\nprint(parser.description)",
    demo2: "import argparse\n\nparser = argparse.ArgumentParser(prog='lablog')\ncommands = parser.add_subparsers(dest='command', required=True)\nimport_data = commands.add_parser('import-data')\nimport_data.add_argument('--file', required=True)\nargs = parser.parse_args(['import-data', '--file', 'data/sample.csv'])\nprint(args.command)\nprint(args.file)",
    starter: "import argparse\n\ndef build_parser():\n    parser = argparse.ArgumentParser(prog='lablog')\n    commands = parser.add_subparsers(dest='command', required=True)\n    import_data = commands.add_parser('import-data')\n    import_data.add_argument('--file', required=True)\n    return parser\n\nargs = build_parser().parse_args(['import-data', '--file', 'data/sample.csv'])\nprint(args.command, args.file)",
    guidedSteps: [
      {
        title: "Bước 1 — tạo parser và xem hướng dẫn",
        body: "Tạo một parser có tên `lablog`. `argparse` tự sinh hướng dẫn `--help`; ở bước này chỉ chạy code để kiểm tra tên và mô tả công cụ trước khi nhận tham số.",
        code: "import argparse\n\nparser = argparse.ArgumentParser(\n    prog='lablog',\n    description='Công cụ nhập dữ liệu nghiên cứu',\n)\nprint(parser.prog)\nprint(parser.description)",
      },
      {
        title: "Bước 2 — thêm lệnh con và đường dẫn CSV",
        body: "Dùng `add_subparsers` để tạo lệnh `import-data`, sau đó khai báo `--file` là bắt buộc. Danh sách truyền vào `parse_args` mô phỏng chính xác nội dung người dùng gõ trên terminal; thử xoá `--file` để quan sát lỗi.",
        code: "import argparse\n\nparser = argparse.ArgumentParser(prog='lablog')\ncommands = parser.add_subparsers(dest='command', required=True)\nimport_data = commands.add_parser('import-data')\nimport_data.add_argument('--file', required=True)\nargs = parser.parse_args(['import-data', '--file', 'data/sample.csv'])\nprint('command:', args.command)\nprint('file:', args.file)",
      },
      {
        title: "Bước 3 — thêm nghiên cứu và kiểm tra kết quả",
        body: "Mở rộng cùng parser, không tạo parser thứ hai: thêm `--study`, parse cả hai tuỳ chọn và kiểm tra giá trị sau khi phân tích. Đây là phiên bản chạy trong trình duyệt; phần bên dưới hướng dẫn kiểm tra tệp CSV thật trên máy.",
        code: "import argparse\n\nparser = argparse.ArgumentParser(prog='lablog')\ncommands = parser.add_subparsers(dest='command', required=True)\nimport_data = commands.add_parser('import-data')\nimport_data.add_argument('--file', required=True)\nimport_data.add_argument('--study', required=True)\nargs = parser.parse_args([\n    'import-data', '--file', 'data/sample.csv', '--study', 'sleep-focus'\n])\nassert args.command == 'import-data'\nassert args.file.endswith('.csv')\nprint(f'{args.study}: {args.file}')",
      },
    ],
    practice: "Mở rộng parser trong ô code: thêm tham số bắt buộc --study, parse lệnh import-data với cả --file và --study, rồi in mã nghiên cứu cùng đường dẫn CSV.",
    solution: "import argparse\n\ndef build_parser():\n    parser = argparse.ArgumentParser(prog='lablog')\n    commands = parser.add_subparsers(dest='command', required=True)\n    import_data = commands.add_parser('import-data')\n    import_data.add_argument('--file', required=True)\n    import_data.add_argument('--study', required=True)\n    return parser\n\nargs = build_parser().parse_args([\n    'import-data', '--file', 'data/sample.csv', '--study', 'sleep-focus'\n])\nprint(f'{args.study}: {args.file}')",
    source: "argparse",
  });
