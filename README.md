# JOBTI · 秋招人格测试

JOBTI 是一个面向 2027 届秋招人群的娱乐型人格测试：30 道秋招场景题，生成四字母人格代码、主画像与可分享的 9:16 人格档案。

视觉方向是“秋招档案袋 × HR 系统 × 人格鉴定报告”。项目只在浏览器运行，不需要登录、后端、数据库或 AI。

## 本地运行

```bash
npm install
npm run dev
```

打开 <http://localhost:3000>。

生产构建：

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

如果本机尚未安装 Playwright 浏览器：

```bash
npx playwright install chromium
```

## 产品流程

首页 → Q0 当前秋招进度 → 开始秋招时间 → 30 道一屏一题问卷 → 结算动画 → Reveal → 完整人格报告 → 1080×1920 PNG 海报。

每次选择会立即进入下一题；“返回”可以修改答案。问卷状态以版本化 Zod schema 同时写入 `sessionStorage` 与 `localStorage`，刷新后可以继续。

## 评分实现

隐藏维度为 `P / A / C / I / D / S / W / M / F / O`。实际 raw score 按每题该维度可达最大值标准化为 0–100；Q0 直接设置 `O`（当前战果）。人格先过 hard gates，再按：

```text
vectorSimilarity × 0.70 + tagMatch × 0.30 + bonus
```

选择最高的 eligible 人格为主画像。结果页把数值称为“人格匹配度”，不会冒充人群百分位。

## 数据层说明

规格引用的“此前确认评分表”以及 24 人格完整向量/文案没有随 v1.0 提供。本仓库在 `data/questions.ts` 与 `data/personalities.ts` 中提供了完整、确定性、类型安全的默认实现：

- 30 道真实、有梗的四选一秋招题；每个选项都带 0–3 维度增量与可选 tag 增量。
- 24 个可命中的人格；每个都有 `targetVector`、`dimensionWeights`、`gates`、`bonusRules`、tag profile 及完整报告文案。
- 这些是依据 v1.0 补齐的默认实现。替换题目、向量或文案时，只需替换 `data/` 层，不需要改算法或 UI。

## 分享海报

结果页使用 React DOM 生成固定 1080×1920（9:16）档案海报，再由 `html-to-image` 转为 PNG。二维码默认指向当前访问域名，也可通过 `NEXT_PUBLIC_SITE_URL` 指定正式域名。分享按钮包括保存人格卡、复制文案和重新测试。

## 人格图片

24 张用户提供的“魔性人物”原图只读保存在工作区外的 `/Users/yu/Desktop/jobti-photo/`，应用不会外链或修改它们。发布资源是 `public/personalities/` 下保持原始像素尺寸和长宽比的 JPEG 压缩副本（质量约 88，24 张合计约 9.6 MB；原始 PNG 合计约 40 MB）。

图片代码映射集中定义在 `lib/personality-images.ts`，每个代码严格对应一个小写文件名：

```text
POOL pool.jpg    MALO malo.jpg    HITO hito.jpg    COMP comp.jpg
KING king.jpg    HUMN humn.jpg    PEND pend.jpg    OCER ocer.jpg
SAFE safe.jpg    LOVE love.jpg    WISH wish.jpg    GAPY gapy.jpg
NOTE note.jpg    EXAM exam.jpg    WAIT wait.jpg    CALM calm.jpg
REFR refr.jpg    LATE late.jpg    RTRY rtry.jpg    FLEX flex.jpg
JUMP jump.jpg    HOLD hold.jpg    BARG barg.jpg    SPIN spin.jpg
```

首页只在 `POOL / KING / HUMN` 预览卡轮播对应图片；结果页把主画像图作为首屏主视觉；分享海报会等待图片完成加载和解码后再导出，人物图使用 `object-fit: contain` 保留完整画面。

## 范围边界

MVP 不包含登录、排行榜、学校/专业榜、好友 PK、多人测试、AI 分析、动态人格、数据库、付费、微信小程序、小红书 API 或后台管理系统。
