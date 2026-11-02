/**
 * Chuyển dữ liệu Education Hugo từ DB Hugo Studio sang DB riêng của Edu.
 * Chạy lại bao nhiêu lần cũng được (mọi bước là upsert theo khoá tự nhiên).
 *
 *   FROM_URI="mongodb+srv://…/hugo_wishpax" TO_URI="mongodb+srv://…/education_hugo" \
 *     node server/scripts/migrate-from-hugo.mjs --dry-run      # chỉ đếm, không ghi
 *   … node server/scripts/migrate-from-hugo.mjs                # chạy thật
 *
 * Người học = có hồ sơ EduLearner HOẶC đã qua ít nhất một step (Bio.completedLessons).
 * JOY → Ngọc: chỉ phần JOY kiếm/tiêu TRONG Edu (qua step, mốc chuỗi lửa, cửa hàng Edu,
 * phá băng) được quy đổi 1:1, tối thiểu 0. JOY ở Hugo Studio giữ nguyên bên đó.
 */
import mongoose from 'mongoose';

const DRY = process.argv.includes('--dry-run');
const { FROM_URI, TO_URI } = process.env;
if (!FROM_URI || !TO_URI) { console.error('Cần FROM_URI và TO_URI.'); process.exit(1); }
if (FROM_URI === TO_URI) { console.error('FROM_URI và TO_URI trùng nhau.'); process.exit(1); }

const from = (await mongoose.createConnection(FROM_URI).asPromise()).db;
const to = (await mongoose.createConnection(TO_URI).asPromise()).db;
const STEP = /^(step|sql)\d+$/;
const stats = {};
const count = (name, n) => { stats[name] = (stats[name] || 0) + n; };

async function upsertAll(collection, docs, keyOf) {
  count(collection, docs.length);
  if (DRY || !docs.length) return;
  for (let i = 0; i < docs.length; i += 500) {
    await to.collection(collection).bulkWrite(docs.slice(i, i + 500).map((doc) => ({ replaceOne: { filter: keyOf(doc), replacement: doc, upsert: true } })), { ordered: false });
  }
}

// ── Ai là người học ─────────────────────────────────────────────────────────
const eduDocs = await from.collection('edulearners').find().toArray();
const bios = await from.collection('bios').find({ $or: [{ completedLessons: { $elemMatch: { $regex: STEP } } }, { email: { $in: eduDocs.map((d) => d.email) } }] })
  .project({ email: 1, displayName: 1, avatarUrl: 1, completedLessons: 1, hugoCoderExamScores: 1, createdAt: 1 }).toArray();
const emails = [...new Set([...eduDocs.map((d) => d.email), ...bios.map((b) => b.email)].filter(Boolean).map((e) => e.toLowerCase()))];
const byEmail = (list) => new Map(list.map((d) => [String(d.email).toLowerCase(), d]));
const eduOf = byEmail(eduDocs);
const bioOf = byEmail(bios);
const personaOf = byEmail(await from.collection('personas').find({ email: { $in: emails } }).toArray());

// ── JOY của Edu → Ngọc ──────────────────────────────────────────────────────
const ledger = await from.collection('joyledgers').find({
  email: { $in: emails },
  $or: [
    { source: 'ide_learning', refId: { $regex: STEP } },
    { refId: { $regex: /^(edu-streak-|HD-)/ } },
    { description: { $regex: /Education Hugo|Cửa hàng Edu|phá băng|chưa áp dụng được/i } },
  ],
}).project({ email: 1, amount: 1, description: 1, refId: 1, createdAt: 1 }).toArray();
const gemsOf = new Map();
for (const row of ledger) gemsOf.set(row.email.toLowerCase(), (gemsOf.get(row.email.toLowerCase()) || 0) + Number(row.amount || 0));

// ── Learner ─────────────────────────────────────────────────────────────────
const learners = emails.map((email) => {
  const edu = eduOf.get(email) || {};
  const bio = bioOf.get(email) || {};
  const persona = personaOf.get(email) || {};
  const completed = (bio.completedLessons || []).filter((id) => STEP.test(id));
  const scores = Object.fromEntries(Object.entries(bio.hugoCoderExamScores || {}).filter(([id]) => STEP.test(id)));
  return {
    email,
    name: bio.displayName || '',
    image: bio.avatarUrl || '',
    completed, scores,
    lessonsDone: edu.lessonsDone || {},
    reviewedOn: edu.reviewedOn || {},
    gems: Math.max(0, Math.round(gemsOf.get(email) || 0)),
    prefs: edu.prefs || {},
    lastActiveAt: edu.lastActiveAt || null,
    day: edu.day || '', dayDone: edu.dayDone || 0, remindedDay: edu.remindedDay || '',
    welcomedAt: edu.welcomedAt || null,
    streak: edu.streak || {}, streakRev: edu.streakRev || 0,
    lastCallDay: edu.lastCallDay || '', frozenNoticeDay: edu.frozenNoticeDay || '',
    shields: edu.shields || 0, xpBoostUntil: edu.xpBoostUntil || null, badge: edu.badge || null,
    nickname: persona.nickname || edu.nickname || '', avatar: persona.avatar || null, intro: persona.intro || '',
    friendCode: edu.friendCode || undefined,
    friends: edu.friends || [], requestsIn: edu.requestsIn || [], requestsOut: edu.requestsOut || [],
    xpWeek: edu.xpWeek || '', xpWeekly: edu.xpWeekly || 0,
    createdAt: edu.createdAt || bio.createdAt || new Date(), updatedAt: new Date(),
  };
});
await upsertAll('learners', learners, (d) => ({ email: d.email }));
await upsertAll('gemtxns', learners.filter((l) => l.gems > 0).map((l) => ({ email: l.email, amount: l.gems, balance: l.gems, reason: 'migration', note: 'Quy đổi JOY kiếm ở Education Hugo', refId: 'migration-joy', createdAt: new Date() })), (d) => ({ email: d.email, refId: 'migration-joy' }));

// ── Tài khoản đăng nhập (Better Auth): user, account, passkey ───────────────
const users = await from.collection('user').find({ email: { $in: emails } }).toArray();
const userIds = users.map((u) => u._id);
await upsertAll('user', users, (d) => ({ _id: d._id }));
await upsertAll('account', await from.collection('account').find({ userId: { $in: userIds } }).toArray(), (d) => ({ _id: d._id }));
await upsertAll('passkey', await from.collection('passkey').find({ userId: { $in: userIds } }).toArray(), (d) => ({ _id: d._id }));

// ── Cửa hàng ────────────────────────────────────────────────────────────────
const products = await from.collection('eduproducts').find().toArray();
await upsertAll('products', products.map(({ priceJoy, ...p }) => ({ ...p, kind: p.kind === 'collectible' ? 'badge' : p.kind, price: priceJoy })), (d) => ({ slug: d.slug }));
await upsertAll('purchases', (await from.collection('edupurchases').find().toArray()).map(({ priceJoy, ...p }) => ({ ...p, price: priceJoy })), (d) => ({ email: d.email, productId: d.productId }));
await upsertAll('receipts', (await from.collection('edureceipts').find().toArray()).map(({ priceJoy, ...r }) => ({ ...r, price: priceJoy })), (d) => ({ code: d.code }));

// ── Cộng đồng: bài gốc board=edu và cả nhánh hồi đáp ────────────────────────
const roots = await from.collection('todayposts').find({ board: 'edu' }).toArray();
const rootIds = roots.map((p) => String(p._id));
const replies = await from.collection('todayposts').find({ ancestors: { $in: rootIds } }).toArray();
await upsertAll('posts', [...roots, ...replies].filter((p) => p.authorEmail).map(({ board, articleKey, reviewedAt, ...p }) => ({ ...p, removed: p.removed ? { category: p.removed.category, at: p.removed.at } : undefined })), (d) => ({ _id: d._id }));

// ── Thông báo, push, góp ý, báo cáo, key đối tác ────────────────────────────
await upsertAll('notifications', (await from.collection('inappnotifications').find({ appId: 'edu', email: { $in: emails } }).toArray())
  .map((n) => ({ _id: n._id, email: n.email, key: String(n.i18nKey || '').replace(/^edu\./, '') || undefined, params: n.i18nParams, category: n.category, title: n.title, message: n.message, actionUrl: n.actionUrl, read: n.read, createdAt: n.createdAt, updatedAt: n.createdAt })), (d) => ({ _id: d._id }));
await upsertAll('pushsubs', (await from.collection('notificationsubscriptions').find({ site: 'edu' }).toArray())
  .map((s) => ({ email: s.email, endpoint: s.subscription.endpoint, subscription: s.subscription, device: s.device || {}, createdAt: s.createdAt || new Date(), updatedAt: new Date() })), (d) => ({ endpoint: d.endpoint }));
await upsertAll('feedbacks', await from.collection('edufeedbacks').find().toArray(), (d) => ({ _id: d._id }));
await upsertAll('lessonfeedbacks', (await from.collection('lessonfeedbacks').find({ lessonId: { $regex: STEP } }).toArray())
  .map((f) => ({ _id: f._id, email: f.memberEmail, lessonId: f.lessonId, stepIndex: f.stepIndex, message: f.message, status: f.status === 'handled' ? 'fixed' : 'new', createdAt: f.createdAt, updatedAt: f.updatedAt })), (d) => ({ _id: d._id }));
await upsertAll('reports', (await from.collection('userreports').find({ targetCode: { $gt: '' } }).toArray())
  .map((r) => ({ ...r, status: r.status === 'resolved' ? 'actioned' : r.status })), (d) => ({ _id: d._id }));
await upsertAll('partnerkeys', await from.collection('edupartnerkeys').find().toArray(), (d) => ({ keyHash: d.keyHash }));

console.log(DRY ? 'CHẠY THỬ — chưa ghi gì:' : 'Đã chuyển:');
console.table(stats);
console.log(`Ngọc quy đổi: ${learners.reduce((s, l) => s + l.gems, 0)} cho ${learners.filter((l) => l.gems > 0).length} người học.`);
await mongoose.disconnect();
