// Mọi collection của Education Hugo. Một file vì mỗi model chỉ vài dòng.
import mongoose from 'mongoose';
import { EDU_DEFAULT_PREFS } from '../packages/shared/eduPrefs.js';

const { Schema, model } = mongoose;
const Mixed = Schema.Types.Mixed;

/**
 * Người học: tiến độ, điểm, chuỗi lửa, cài đặt, persona, bạn bè — gộp hết vào
 * một tài liệu theo email (trước đây rải ở Bio + EduLearner + Persona của Hugo Studio).
 */
const learnerSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  image: { type: String, default: '' },
  // Tiến độ
  completed: { type: [String], default: [] },
  scores: { type: Mixed, default: () => ({}) },
  lessonsDone: { type: Mixed, default: () => ({}) },
  reviewedOn: { type: Mixed, default: () => ({}) },
  // Ngọc — điểm tiêu được của Edu (thay JOY). Chỉ đổi qua services/gems.js.
  gems: { type: Number, default: 0, min: 0 },
  // Cài đặt + mục tiêu ngày
  prefs: { type: Mixed, default: () => ({ ...EDU_DEFAULT_PREFS }) },
  lastActiveAt: { type: Date, index: true },
  day: { type: String, default: '' },
  dayDone: { type: Number, default: 0 },
  remindedDay: { type: String, default: '' },
  welcomedAt: Date,
  // Chuỗi lửa (packages/shared/eduStreak.js); streakRev chặn hai máy ghi đè nhau.
  streak: { type: Mixed, default: () => ({}) },
  streakRev: { type: Number, default: 0 },
  lastCallDay: { type: String, default: '' },
  frozenNoticeDay: { type: String, default: '' },
  // Cửa hàng
  shields: { type: Number, default: 0, min: 0 },
  xpBoostUntil: Date,
  badge: String,
  // Persona công khai (không tên thật)
  nickname: { type: String, default: '' },
  avatar: { type: Mixed, default: null },
  intro: { type: String, default: '' },
  // Bạn bè + thi đua tuần
  friendCode: String,
  // Tài khoản chính thức Education Hugo (tick vàng): theo dõi là thành bạn ngay, nhận thông báo admin gửi.
  official: Boolean,
  friends: { type: [String], default: [] },
  requestsIn: { type: [String], default: [] },
  requestsOut: { type: [String], default: [] },
  xpWeek: { type: String, default: '' },
  xpWeekly: { type: Number, default: 0 },
  // Khoá bởi admin (báo cáo vi phạm)
  bannedAt: Date,
  // Lời đồng ý điều khoản + nhóm tuổi; người 14–15 có xác nhận và SĐT người giám hộ.
  consent: { type: Mixed, default: undefined },
}, { timestamps: true, minimize: false });
learnerSchema.index({ 'prefs.reminder': 1, 'prefs.reminderHour': 1 });
learnerSchema.index({ friendCode: 1 }, { unique: true, partialFilterExpression: { friendCode: { $type: 'string' } } });
learnerSchema.index({ xpWeek: 1, xpWeekly: -1 });
learnerSchema.index({ nickname: 1 });
export const Learner = model('Learner', learnerSchema);

// Sổ Ngọc: mọi lần cộng/trừ, để đối soát và hiện lịch sử.
export const GemTxn = model('GemTxn', new Schema({
  email: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  balance: Number,
  reason: { type: String, required: true },
  note: String,
  refId: { type: String, index: true },
}, { timestamps: true }));

export const Product = model('Product', new Schema({
  slug: { type: String, required: true, unique: true },
  kind: { type: String, enum: ['badge', 'xp_boost', 'streak_shield'], default: 'badge' },
  value: { type: Number, default: 1 },
  name: { vi: String, en: String, zh: String },
  description: { vi: String, en: String, zh: String },
  image: String,
  price: { type: Number, required: true, min: 1 },
  stock: { type: Number, default: null },
  sold: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  sort: { type: Number, default: 0 },
}, { timestamps: true }));

const purchaseSchema = new Schema({ email: String, productId: Schema.Types.ObjectId, price: Number }, { timestamps: true });
purchaseSchema.index({ email: 1, productId: 1 }, { unique: true });
export const Purchase = model('Purchase', purchaseSchema);

export const Receipt = model('Receipt', new Schema({
  code: { type: String, required: true, unique: true },
  email: { type: String, required: true, index: true },
  productId: Schema.Types.ObjectId,
  slug: String,
  name: { vi: String, en: String, zh: String },
  kind: String,
  value: Number,
  price: Number,
  balanceBefore: Number,
  balanceAfter: Number,
}, { timestamps: true }));

const notificationSchema = new Schema({
  email: { type: String, required: true },
  key: String,
  params: { type: Mixed, default: undefined },
  category: { type: String, default: 'general' },
  title: String,
  message: String,
  actionUrl: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });
notificationSchema.index({ email: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 86400 });
export const Notification = model('Notification', notificationSchema);

export const PushSub = model('PushSub', new Schema({
  email: { type: String, required: true, index: true },
  endpoint: { type: String, required: true, unique: true },
  subscription: { type: Mixed, required: true },
  device: { type: Mixed, default: {} },
}, { timestamps: true }));

const postSchema = new Schema({
  authorEmail: { type: String, required: true, index: true },
  text: { type: String, default: '' },
  translations: { type: Map, of: String, default: undefined },
  poll: {
    type: new Schema({ options: [{ _id: false, text: String, votes: { type: [String], default: [] } }], endsAt: Date }, { _id: false }),
    default: undefined,
  },
  audience: { type: String, enum: ['private'], default: undefined },
  parentKey: { type: String, default: null },
  ancestors: { type: [String], default: undefined, index: true },
  likes: { type: [String], default: undefined },
  likeCount: { type: Number, default: 0 },
  replyCount: { type: Number, default: 0 },
  editedAt: Date,
  // Bài của admin (chia sẻ kinh nghiệm): chỉ admin đăng bài gốc; thành viên chỉ thích + bình luận.
  byAdmin: { type: Boolean, default: undefined },
  title: { type: String, default: undefined },
  mascot: { type: String, default: undefined },
  // Admin ẩn bài: chỉ tác giả còn thấy, kèm nhãn; không xoá để khôi phục được.
  removed: { type: new Schema({ category: String, at: Date, by: String }, { _id: false }), default: undefined },
}, { timestamps: true });
postSchema.index({ parentKey: 1, createdAt: -1 });
export const Post = model('Post', postSchema);

export const Feedback = model('Feedback', new Schema({
  email: { type: String, required: true, index: true },
  ratings: Mixed,
  comment: String,
  lang: String,
  source: String,
}, { timestamps: true }));

export const LessonFeedback = model('LessonFeedback', new Schema({
  email: { type: String, required: true, index: true },
  lessonId: String,
  stepIndex: Number,
  message: String,
  status: { type: String, enum: ['new', 'seen', 'fixed'], default: 'new' },
}, { timestamps: true }));

export const Report = model('Report', new Schema({
  reporterEmail: { type: String, required: true, index: true },
  targetEmail: { type: String, required: true, index: true },
  targetCode: String,
  reason: String,
  note: String,
  snapshot: Mixed,
  status: { type: String, enum: ['pending', 'dismissed', 'actioned'], default: 'pending' },
}, { timestamps: true }));

export const PartnerKey = model('PartnerKey', new Schema({
  email: { type: String, required: true, lowercase: true, trim: true, index: true },
  keyHash: { type: String, required: true, unique: true },
  last4: { type: String, required: true },
  origins: { type: [String], default: [] },
  note: { type: String, default: '', maxlength: 200 },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date, default: null },
  createdBy: String,
  lastUsedAt: Date,
  uses: { type: Number, default: 0 },
}, { timestamps: true }));

// Nhật ký thao tác admin.
export const AdminLog = model('AdminLog', new Schema({
  admin: String, action: String, target: String, detail: Mixed,
}, { timestamps: true }));

// Đăng ký chương trình Hugo Developer (mỗi người học một lần; hội đồng xét sau).
export const DevSignup = model('DevSignup', new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: String,
  status: { type: String, enum: ['new', 'contacted', 'accepted', 'declined'], default: 'new' },
}, { timestamps: true }));

// Quảng cáo trong app (vd. thẻ Hugo Developer ở Hồ sơ). Admin sửa chữ (vi/en/zh), ảnh, link, bật/tắt.
export const Promo = model('Promo', new Schema({
  key: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  image: String,
  href: String,
  text: Mixed, // { vi: { badge, title, body, cta }, en: {…}, zh: {…} }
}, { timestamps: true }));
