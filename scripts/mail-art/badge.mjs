// Badge thanh trạng thái Android: chỉ dùng kênh alpha → bóng đen của mascot trên nền trong suốt.
import { chromium } from "playwright-core";
import fs from "fs";
const root = process.argv[2];
const svg = fs.readFileSync(`${root}/public/edu/buddy-learn.svg`).toString("base64");
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ viewport: { width: 96, height: 96 } });
await page.setContent(`<html><body style="margin:0;background:transparent"><img src="data:image/svg+xml;base64,${svg}" style="width:96px;height:96px;filter:brightness(0)"></body></html>`);
await page.screenshot({ path: `${root}/public/edu/badge-96.png`, omitBackground: true });
await browser.close();
