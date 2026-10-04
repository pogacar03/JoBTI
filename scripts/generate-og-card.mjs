import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const portrait = await readFile(new URL('../public/personalities/malo.jpg', import.meta.url));
const outputPath = new URL('../public/og-card.png', import.meta.url).pathname;
const browser = await chromium.launch({ headless: true });

try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(`
    <!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><style>
      *{box-sizing:border-box}body{margin:0;color:#18221f;font-family:Arial,"PingFang SC","Hiragino Sans GB",sans-serif}
      .card{position:relative;width:1200px;height:630px;padding:39px 58px;background-color:#f4efe5;background-image:linear-gradient(rgba(24,34,31,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(24,34,31,.05) 1px,transparent 1px);background-size:24px 24px;overflow:hidden}
      .head{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #18221f;padding-bottom:15px}
      .brand{font-size:34px;font-weight:900;letter-spacing:-3px}.dot{color:#c85136}
      .micro{font-family:monospace;font-size:14px;letter-spacing:2px;color:#5e6a63}
      .main{display:flex;gap:36px;padding-top:39px}
      .copy{width:590px;flex-shrink:0}
      .stamp{display:inline-block;border:2px solid #c85136;padding:8px 13px;font-family:monospace;font-size:15px;font-weight:bold;letter-spacing:2px;color:#c85136;transform:rotate(-2deg)}
      h1{font-size:62px;line-height:1.12;letter-spacing:-5px;margin:26px 0 0;font-weight:900}h1 em{font-style:normal;color:#184b3c}
      .sub{font-size:23px;line-height:1.5;margin:28px 0 0;color:#394641}
      .facts{display:inline-block;margin-top:29px;padding:11px 15px;background:#c85136;color:#f4efe5;font-size:18px;font-weight:bold;letter-spacing:1px;box-shadow:5px 5px 0 rgba(24,34,31,.16)}
      .poster{position:relative;flex:1;min-width:0;height:430px;margin-top:-5px;padding:12px;border:3px solid #18221f;background:#f4efe5;box-shadow:10px 10px 0 rgba(24,34,31,.18);transform:rotate(3deg)}
      .poster img{display:block;width:100%;height:100%;object-fit:contain;background:#fff}
      .ribbon{position:absolute;z-index:1;right:230px;top:92px;transform:rotate(-8deg);background:#d5a33d;padding:10px 13px;font:bold 13px monospace;box-shadow:3px 3px 0 rgba(24,34,31,.15)}
      .foot{position:absolute;bottom:27px;left:58px;right:58px;display:flex;justify-content:space-between;border-top:1px solid rgba(24,34,31,.28);padding-top:12px;font:12px monospace;letter-spacing:2px;color:#64716a}
    </style></head><body><div class="card">
      <div class="head"><div class="brand">JOBTI<span class="dot">.</span></div><div class="micro">CANDIDATE INTAKE / 2027</div></div>
      <div class="main"><div class="copy"><div class="stamp">秋招人格鉴定 / REPORT 01</div><h1>测测秋招<br><em>把你变成了</em><br>什么人格<span class="dot">。</span></h1><p class="sub">投了几百份简历以后，你还是原来的你吗？</p><div class="facts">30 道题　·　约 3 分钟　·　无需登录</div></div><div class="poster"><img src="data:image/jpeg;base64,${portrait.toString('base64')}" alt="秋招吗喽人物卡"></div></div>
      <div class="ribbon">SAMPLE FILE / PREVIEW</div><div class="foot"><span>JOBTI · AUTUMN RECRUITMENT PERSONALITY TEST</span><span>QIUZHAO.SITE</span></div>
    </div></body></html>
  `);
  await page.locator('.poster img').evaluate((image) => image.decode());
  await page.locator('.card').screenshot({ path: outputPath });
} finally {
  await browser.close();
}
