// Kênh trực tiếp cho admin: MongoDB change stream → Server-Sent Events.
// Mọi thay đổi ở Learner/Activity (từ bất kỳ đường ghi nào, kể cả máy chủ khác) đều tới admin ngay.
// Chỉ mở change stream khi có ít nhất một admin đang xem; admin cuối rời đi thì đóng.
import { Activity, Learner } from '../models.js';

const clients = new Set();
let streams = [];
let decorate = (a) => a;
// Trường ghi nền, không đổi gì admin cần xem.
const NOISE = new Set(['remindedDay', 'lastCallDay', 'frozenNoticeDay', 'streakRev']);

function send(event, data) {
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) res.write(msg);
}

function close() {
  for (const s of streams) s.close().catch(() => {});
  streams = [];
}

function open() {
  const learners = Learner.watch([{ $match: { operationType: { $in: ['insert', 'update', 'replace', 'delete'] } } }]);
  learners.on('change', (c) => {
    const fields = Object.keys(c.updateDescription?.updatedFields || {}).concat(c.updateDescription?.removedFields || []);
    if (c.operationType === 'update' && fields.length && fields.every((f) => NOISE.has(f.split('.')[0]))) return;
    send('learner', { id: String(c.documentKey._id), op: c.operationType, fields: [...new Set(fields.map((f) => f.split('.')[0]))] });
  });
  const activity = Activity.watch([{ $match: { operationType: 'insert' } }]);
  activity.on('change', (c) => send('activity', decorate(c.fullDocument)));
  streams = [learners, activity];
  // ponytail: lỗi stream (mất kết nối DB, failover) → đóng hết, báo client tải lại, mở lại sau 5 giây.
  for (const s of streams) {
    s.on('error', (error) => {
      console.error('[live]', error.message);
      close();
      send('resync', {});
      setTimeout(() => { if (clients.size && !streams.length) open(); }, 5000);
    });
  }
}

/** Gắn một response SSE; trả hàm huỷ. `fmt` thêm nhãn step cho dòng hoạt động. */
export function subscribe(res, fmt) {
  decorate = fmt;
  clients.add(res);
  if (!streams.length) open();
  return () => {
    clients.delete(res);
    if (!clients.size) close();
  };
}
