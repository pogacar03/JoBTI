# JOBTI 独立验收报告 — Round 5（Round 4 最终复验）

验收日期：2026-09-15  
验收对象：`/Users/yu/Documents/ChatGPT/jobti`  
复验范围：Round 4 两项 P2、双存储冲突、结果校验前闪屏、正常完整流程回归  
验收方式：只读代码审查、Playwright Chromium 与系统 Google Chrome 实际浏览器检查、存储边界构造、针对测试及全量测试/检查/构建；未修改产品代码

## 结论：PASS

Round 5 finding 总数：**0**（P0 × 0，P1 × 0，P2 × 0，P3 × 0）。最高严重级别：**无**。

Round 4 的两项 P2 均已关闭：首页 CTA 的 start intent 在普通点击、Enter、Meta+新标签和真实中键新标签中均能把语义完整的旧记录转换为全新 Q0；残缺或非法记录不能 Reveal/生成报告，并续到首个缺失或非法项。双存储按 `updatedAt` 选择较新结构合法记录，相等/缺失时间的行为确定；ResultView 校验前只显示中性读取屏。完整 32 项流程、最后一题后的 1.5 秒结算和 Reveal 均无回归。

## Findings

本轮无 P0、P1、P2 或 P3 finding。

## Round 4 两项 P2 关闭证据

### P2-1：新标签页绕过首页 `onClick` 后跳旧结果 — 已关闭

- `components/HomeHero.tsx:42` 的 CTA 现在指向 `/quiz?start=1`。普通路径仍同步调用完成态清理；即使中键不触发 `onClick`，目的页也能识别 start intent。
- `components/QuizFlow.tsx:33-47` 在目的页读取 start intent，使用统一语义完成校验；只有旧记录语义完整时才清空并创建新状态，随后移除查询参数。未完成状态不清空，仍按首个未答题续答。
- 独立 390×844 浏览器结果：

| 旧记录 / 输入方式 | 最终状态 | 双存储 |
|---|---|---|
| 完整 32 项 / 普通点击 | `/quiz`、新 Q0、0 answers logged | 两份均 0 答案、`complete=false` |
| 完整 32 项 / Enter | `/quiz`、新 Q0、0 answers logged | 两份均 0 答案、`complete=false` |
| 完整 32 项 / Meta+点击新标签 | `/quiz`、新 Q0、0 answers logged | 两份均 0 答案、`complete=false` |
| 完整 32 项 / 中键新标签 | `/quiz`、新 Q0、0 answers logged | 新标签两份均 0 答案、`complete=false` |
| 未完成 `{q0,start,q01}` / 普通点击 | `/quiz`、q02、3 answers logged | 三项答案均保留 |
| 同一未完成记录 / 中键新标签 | `/quiz`、q02、3 answers logged | 三项答案均保留 |

- 系统 Google Chrome 通道对真实中键后台新标签追加复查：3 秒后 URL 为干净 `/quiz`，文档标题为 `JOBTI · 秋招人格测试`，`readyState=complete`，Q0 可见。
- `tests/e2e/round4.spec.ts:22-52` 已覆盖新标签直达 start intent 对完整/未完成状态的区别；本轮另外使用真实 Meta/中键事件独立验证，不只复述测试。

### P2-2：`/result` 只信任 `complete` 布尔值 — 已关闭

- `lib/storage.ts:41-46` 的 `isQuizComplete()` 同时要求：`complete===true`、Q0 是真实进度选项、开始时间是真实选项、q01～q30 每项都属于对应题目的四个合法 option。
- `components/ResultView.tsx:36-45` 在解析/生成结果前调用该统一校验；不完整状态直接转入未完成提示。
- `components/QuizFlow.tsx:14-18,35-47` 使用相同的合法 option 判定定位首个无效项，并把标志冲突规范化为实际语义完成值。
- 独立浏览器构造结果：

| 状态 | 直接 `/result` | `/quiz?start=1` 恢复 |
|---|---|---|
| Q0 非法、其余齐全、`complete=true` | 档案未完成；无生成/Reveal | Q0 |
| 开始时间非法、其余齐全、`complete=true` | 档案未完成；无生成/Reveal | Q-START |
| 缺 q15、`complete=true` | 档案未完成；无生成/Reveal | 15 / 30 |
| q15 非法、`complete=true` | 档案未完成；无生成/Reveal | 15 / 30 |
| 32 项全合法、`complete=false` | 档案未完成；无生成/Reveal | 30 / 30，需重新提交最后一题 |
| 32 项全合法、`complete=true` | 读取 → 结算 → 检测完成 | 合法结果可 Reveal |

- `tests/storage.test.ts:67-75` 覆盖全合法、标志 false、缺最后一题和非法 option；`tests/e2e/round4.spec.ts:54-75` 覆盖残缺/非法完成记录不能 Reveal。

## 同层风险复验

### 双存储冲突仲裁 — 通过

`lib/storage.ts:50-57` 先丢弃无法通过 schema 的记录；两份均可解析时，把缺失 `updatedAt` 视为 0，仅当 local 严格更新时选择 local，否则选择 session。因此相等时间和双方都缺时间时稳定选择 session，不依赖对象枚举或随机顺序。

独立浏览器用不同 Q0 值验证八组冲突，实际恢复结果均与规则一致：

| 冲突 | 实际选择 |
|---|---|
| local=20，session=10 | local |
| session=30，local=20 | session |
| 两者均 40 | session |
| 两者均缺时间 | session |
| session=1，local 缺时间 | session |
| local=1，session 缺时间 | local |
| local 较新但结构损坏，session 可解析 | session |
| local 较新且结构可解析、但答案语义非法 | local；规范化为未完成并续到 Q0 |

最后一项是合理的数据恢复策略：较新的未完成/待修复进度不会被更老记录覆盖，同时 `isQuizComplete` 阻止其生成报告。初始化后 `writeQuizState()` 会将选中的权威状态同步回两份存储。`tests/storage.test.ts:77-91` 也覆盖了 local 较新分支。

### ResultView 校验前闪“正在生成” — 已关闭

- `components/ResultView.tsx:24-25,87-95` 把首次 SSR/客户端校验前画面改为“正在读取候选档案…”。只有 `isQuizComplete()` 通过并已生成 result 后才显示“正在生成秋招人格档案…”。
- 对上述五类不完整/冲突状态逐一检查原始 SSR HTML：均包含“正在读取”，均不包含“正在生成”。
- 安装 DOM MutationObserver 记录从导航开始至“档案未完成”的全部文本变化：五类状态的 `everGenerating=false`，Reveal 均不可见。
- 合法完整状态的原始 SSR 同样先显示读取；校验通过后才进入结算，约 1.5 秒后显示“检测完成”。

## 正常完整流程回归

- 全量 smoke 从首页空状态依次完成 Q0、开始时间和 30 道题。
- 提交最后一题前仍位于 `/quiz`；提交后才进入 `/result` 并显示“正在生成秋招人格档案…”。
- 约 1.5 秒后出现“检测完成”和可见 Reveal；点击后完整结果及分享入口正常。
- 刷新续答、键盘焦点、反馈持久化、海报下载、桌面 CTA、首页随机首帧等此前回归用例全部继续通过。

## 测试实跑证据

以下均为 Round 5 当前工作树的独立实跑：

| 命令 | 结果 | 摘要 |
|---|---:|---|
| `npm test -- tests/storage.test.ts` | exit 0 | storage 5/5 通过；约 0.70s |
| `npm run test:e2e -- tests/e2e/round4.spec.ts` | exit 0 | Round 4 针对 E2E 2/2 通过；约 2.46s |
| `npm test` | exit 0 | Vitest 8 个文件、21/21 通过；约 0.63s |
| `npm run lint` | exit 0 | `No ESLint warnings or errors`；约 3.49s |
| `npx tsc --noEmit` | exit 0 | 无输出、无类型错误；约 1.29s |
| `npm run build` | exit 0 | Next.js 14.2.35 编译、lint/type check、页面生成和 trace 完成；约 8.95s |
| `npm run test:e2e` | exit 0 | mobile-chromium 13/13 通过；约 17.99s |

非阻断输出仍包括 Vite CJS API deprecation、webpack cache snapshot、`NO_COLOR`/`FORCE_COLOR` 及 Next.js 未来 `allowedDevOrigins` 提示；没有测试失败或页面 console/page error。

## Round 5 覆盖矩阵

| 验收要求 | 状态 | 独立证据 |
|---|---|---|
| 完整旧记录：普通/Enter/Meta/中键均启动新 Q0 | 满足 | 四种真实输入均到 `/quiz`，两份状态均 0 答案 |
| 未完成记录仍续答 | 满足 | 普通/中键均续到 q02，三项原答案保留 |
| 完成语义校验 32 项与合法 option | 满足 | 源码统一校验；Q0/start/q15 缺失与非法边界实测 |
| 残缺、非法、标志冲突不能生成/Reveal | 满足 | 五类状态均显示未完成，全过程未出现生成，Reveal 不存在 |
| 不合法状态可合理续答 | 满足 | 分别定位 Q0、Q-START、q15 或 q30 |
| 双存储选择较新结构合法记录 | 满足 | 新旧双向与结构损坏分支实测 |
| 时间缺失/相等行为确定 | 满足 | 缺失按 0；相等稳定选 session；浏览器实测一致 |
| ResultView 验证前无生成闪屏 | 满足 | SSR + DOM 全时序双重验证 |
| 最后一题 → 结算 → Reveal | 满足 | 完整 smoke 与独立合法状态路径均通过 |
| 全量回归 | 满足 | unit、lint、tsc、build、13 项 E2E 全绿 |

## Round 6 图片接入与线上复验（2026-09-15）

本轮针对用户提供的 24 张人物图进行独立复验，未发现 P0–P3 问题。

- 24 个代码（POOL、MALO、HITO、COMP、KING、HUMN、PEND、OCER、SAFE、LOVE、WISH、GAPY、NOTE、EXAM、WAIT、CALM、REFR、LATE、RTRY、FLEX、JUMP、HOLD、BARG、SPIN）均有唯一 JPEG 资源，原始 PNG 保留在 `/Users/yu/Desktop/jobti-photo/`。
- 首页预览、结果主/次人格和分享海报均使用统一图片清单；主图实际加载像素通过，海报导出仍为 1080×1920。
- 当前工作树实跑：Vitest 9 个文件 / 23 项通过，Playwright 16 项通过，lint、TypeScript 检查、生产构建均通过。
- Vercel 临时预览线上复验：主页返回 200，24 个 `/personalities/*.jpg` 资源均返回 200，线上结果页可加载主图与次人格图。

公开预览：<https://temporary-nimble-hawthorn-4ziv4te.vercel.app>

该链接由未登录的 Vercel 临时部署生成，有效期约 60 分钟。要长期保留，需要打开部署认领链接并登录 Vercel；认领后可以继续绑定正式域名和自动发布。

## 剩余风险

- 相等 `updatedAt` 和双方都缺时间时“session 优先”目前由一行比较自然产生，行为确定但没有专门的持久测试锁定；本轮已独立实测，建议补单测防止未来无意改变。
- 持久 E2E 使用 `context.newPage().goto('/quiz?start=1')` 模拟绕过来源页，尚未直接触发 Meta/中键事件；本轮已用 Playwright 真实输入和系统 Chrome 独立验证，建议把中键回归加入测试套件。
- start intent 在客户端 mount 后消费，首次进入会短暂显示中性的 `retrieving candidate file…`，随后才出现 Q0/续答题；没有旧结果或生成报告闪屏。纯 JavaScript 被禁用时问卷本身不可用，这是当前客户端应用的既有运行前提。
- `updatedAt` 基于设备 `Date.now()`，若系统时钟大幅回拨，“较新”不能代表真实写入先后；单设备本地应用中概率低，当前不构成 finding。
