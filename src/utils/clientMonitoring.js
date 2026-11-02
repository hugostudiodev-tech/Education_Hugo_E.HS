// Ghi sự cố phía trình duyệt ra console (mã sự cố hiện trên màn lỗi để người học báo lại).
// ponytail: chưa gửi về máy chủ; thêm route /api/client-events khi cần thống kê lỗi.
export function reportClientEvent(event) {
  console.error("[Education Hugo]", event);
}
