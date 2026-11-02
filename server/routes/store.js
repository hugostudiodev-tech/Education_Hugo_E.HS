// /api/store — vật phẩm mua bằng Ngọc.
import express from 'express';
import { requireUser } from '../lib/auth.js';
import { fail, handle, limit } from '../lib/limits.js';
import { buyProduct, equipBadge, listProducts, perks } from '../services/store.js';

const router = express.Router();
router.use(requireUser);
const id = (req) => { if (!/^[a-f0-9]{24}$/.test(req.params.id)) throw fail(400, 'BAD_ID', 'Sản phẩm không hợp lệ.'); return req.params.id; };

router.get('/', handle(async (req) => { const [items, mine] = await Promise.all([listProducts(req.email), perks(req.email)]); return { items, perks: mine }; }));
router.post('/:id/buy', limit(10), handle(async (req) => ({ success: true, ...(await buyProduct(req.email, id(req))) })));
router.post('/:id/equip', limit(20), handle(async (req) => ({ success: true, ...(await equipBadge(req.email, id(req))) })));

export default router;
