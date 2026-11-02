// Ngọc — điểm tiêu được của Education Hugo. Mọi cộng/trừ đi qua đây: một lệnh
// có điều kiện (không bao giờ âm) + một dòng sổ GemTxn để đối soát.
import { GemTxn, Learner } from '../models.js';
import { fail } from '../lib/limits.js';

export const GEMS_PER_CORRECT = 5; // qua step lần đầu: 5 Ngọc mỗi câu đúng

export async function addGems(email, amount, reason, { note = '', refId } = {}) {
  const n = Math.trunc(Number(amount));
  if (!n) return { balance: (await Learner.findOne({ email }).select('gems').lean())?.gems || 0 };
  const doc = await Learner.findOneAndUpdate(
    n < 0 ? { email, gems: { $gte: -n } } : { email },
    { $inc: { gems: n } },
    { new: true, upsert: n > 0, setDefaultsOnInsert: true, projection: { gems: 1 } },
  ).lean();
  if (!doc) throw fail(400, 'INSUFFICIENT_GEMS', 'Số Ngọc chưa đủ.');
  await GemTxn.create({ email, amount: n, balance: doc.gems, reason, note, refId }).catch((error) => console.error('[gems ledger]', error.message));
  return { balance: doc.gems };
}
