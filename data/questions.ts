import type { DimensionScores, Question, QuestionOption } from '@/lib/scoring/types';

const zeroDelta: Partial<DimensionScores> = {};

export interface ProgressOption extends QuestionOption {
  fixedScores: Partial<DimensionScores>;
}

export const PROGRESS_OPTIONS: ProgressOption[] = [
  { id: 'progress-0', label: '基本还没流程', note: '简历还在草稿箱里', fixedScores: { O: 5 }, delta: zeroDelta, tagDelta: { NO_PIPELINE: 2 } },
  { id: 'progress-1', label: '有测评 / 笔试', note: '验证码已经背熟了', fixedScores: { O: 20 }, delta: zeroDelta, tagDelta: { EXAM_HELL: 1 } },
  { id: 'progress-2', label: '已经有面试', note: '开始研究反问环节', fixedScores: { O: 40 }, delta: zeroDelta, tagDelta: { STATUS_CHECK: 1 } },
  { id: 'progress-3', label: '有意向 / 口头 OC', note: '但还不敢庆祝', fixedScores: { O: 65 }, delta: zeroDelta, tagDelta: { PREMATURE_OC: 2, OC_HYPERVIGILANCE: 1 } },
  { id: 'progress-4', label: '已有 1 个正式 Offer', note: '手里终于有一张牌', fixedScores: { O: 80 }, delta: zeroDelta, tagDelta: { HOLD_OFFER: 1 } },
  { id: 'progress-5', label: '2 个及以上 Offer', note: '招聘软件开始像投资账户', fixedScores: { O: 95 }, delta: zeroDelta, tagDelta: { OFFER_RICH: 2, HOLD_OFFER: 1 } },
  { id: 'progress-6', label: '已经签约，不找了', note: '恭喜你暂时恢复人类身份', fixedScores: { O: 100 }, delta: zeroDelta, tagDelta: { OFFER_RICH: 2, SIGNED: 3 } },
];

export const START_OPTIONS: ProgressOption[] = [
  { id: 'month-early', label: '7 月及以前', note: '提前布局派', fixedScores: {}, delta: zeroDelta },
  { id: 'month-8', label: '8 月', note: '暑期冲刺派', fixedScores: {}, delta: zeroDelta },
  { id: 'month-9', label: '9 月', note: '开学才进入战斗', fixedScores: {}, delta: zeroDelta, tagDelta: { LATE_START: 2 } },
  { id: 'month-10', label: '10 月及以后', note: '主打一个来都来了', fixedScores: {}, delta: zeroDelta, tagDelta: { LATE_START: 3 } },
];

function option(id: string, label: string, delta: Partial<DimensionScores>, tagDelta?: ProgressOption['tagDelta'], note?: string): QuestionOption {
  return { id, label, note, delta, tagDelta };
}

export const QUESTIONS: Question[] = [
  {
    id: 'q01', number: 1, eyebrow: '投递档案 / 01', prompt: '投递第一晚，你的状态更接近哪一种？',
    options: [
      option('q01-a', '先投 3 家试试水', { P: 1, A: 1 }),
      option('q01-b', '认真改完简历再投', { P: 1, I: 2 }),
      option('q01-c', '看到合适的就全投一遍', { P: 3, F: 1 }, { HIGH_VOLUME: 2 }),
      option('q01-d', '先收藏，等一个天时地利', { A: 2, W: 2 }, { NO_PIPELINE: 1 }),
    ],
  },
  {
    id: 'q02', number: 2, eyebrow: '岗位扫描 / 02', prompt: '打开一份岗位 JD，你第一眼会看什么？',
    options: [
      option('q02-a', '薪资和城市', { S: 2, D: 1 }),
      option('q02-b', '业务关键词，顺便开搜索', { I: 3 }, { INFO_HUNT: 2 }),
      option('q02-c', '任职要求里有没有隐藏门槛', { I: 2, A: 1 }),
      option('q02-d', '公司名，我只认梦司', { D: 3 }, { DREAM_COMPANY: 2 }),
    ],
  },
  {
    id: 'q03', number: 3, eyebrow: '群聊现场 / 03', prompt: '同学突然在群里说“我拿到 offer 了”，你会？',
    options: [
      option('q03-a', '真诚恭喜，然后继续改简历', { S: 1, F: 1 }),
      option('q03-b', '点开他的公司和岗位查一圈', { C: 2, I: 2 }, { COMPARISON: 2, INFO_HUNT: 1 }),
      option('q03-c', '退出群聊，假装没看到', { A: 2, F: 2 }, { COMPARISON: 2 }),
      option('q03-d', '立刻打开招聘软件投同款', { P: 3, C: 2 }, { COMPARISON: 3, HIGH_VOLUME: 1 }),
    ],
  },
  {
    id: 'q04', number: 4, eyebrow: '测评通知 / 04', prompt: '晚上 11 点收到性格测评，你的第一反应是？',
    options: [
      option('q04-a', '明早精神好再做', { W: 2, S: 1 }),
      option('q04-b', '今晚做完，免得夜长梦多', { A: 1, F: 2 }, { EXAM_HELL: 2 }),
      option('q04-c', '先搜索这家公司测评题库', { I: 3, A: 1 }, { EXAM_HELL: 3, INFO_HUNT: 1 }),
      option('q04-d', '选最像“高潜”的答案', { M: 1, D: 2 }, { SUPERSTITION: 1, EXAM_HELL: 2 }),
    ],
  },
  {
    id: 'q05', number: 5, eyebrow: '流程状态 / 05', prompt: '简历投出后七天没消息，你会怎么解释？',
    options: [
      option('q05-a', '正常，HR 也有自己的节奏', { W: 3, A: 0 }, { HR_KEEP_WARM: 1 }),
      option('q05-b', '大概率挂了，再投两家', { A: 2, P: 2 }, { NO_PIPELINE: 1, POOLING: 3 }),
      option('q05-c', '每天查一次官网状态', { A: 3, I: 2 }, { STATUS_CHECK: 2, OC_HYPERVIGILANCE: 1 }),
      option('q05-d', '去搜“流程中七天正常吗”', { I: 3, A: 2 }, { INFO_HUNT: 2, STATUS_CHECK: 1 }),
    ],
  },
  {
    id: 'q06', number: 6, eyebrow: '内推入口 / 06', prompt: '学长发来一个内推码，你最可能的动作是？',
    options: [
      option('q06-a', '说声谢谢，认真填完', { I: 1, S: 1 }, { REFERRAL: 1 }),
      option('q06-b', '问清部门、流程和面试轮次', { I: 3, A: 1 }, { REFERRAL: 2, INFO_HUNT: 1 }),
      option('q06-c', '把码转发给半个年级', { P: 3, I: 1 }, { REFERRAL: 3, HIGH_VOLUME: 2 }),
      option('q06-d', '先收藏，等岗位更匹配', { S: 2, W: 2 }, { REFERRAL: 1 }),
    ],
  },
  {
    id: 'q07', number: 7, eyebrow: '梦司剧本 / 07', prompt: '梦中公司约面，你会把准备时间花在？',
    options: [
      option('q07-a', '业务、竞品、行业报告', { D: 3, I: 2 }, { DREAM_COMPANY: 3, INFO_HUNT: 1 }),
      option('q07-b', '把每个项目讲到 90 秒', { D: 2, A: 1 }),
      option('q07-c', '研究面试官的公开信息', { I: 3, C: 1 }, { DREAM_COMPANY: 2, INFO_HUNT: 2 }),
      option('q07-d', '先祈祷别问八股', { M: 2, A: 2 }, { DREAM_COMPANY: 1, SUPERSTITION: 2 }),
    ],
  },
  {
    id: 'q08', number: 8, eyebrow: 'HR 保温 / 08', prompt: 'HR 说“流程还在推进，有消息联系你”，之后呢？',
    options: [
      option('q08-a', '那就继续过自己的生活', { W: 3, A: 0 }, { HR_KEEP_WARM: 2, POOLING: 3 }),
      option('q08-b', '隔几天礼貌 follow up', { W: 2, A: 1 }, { HR_KEEP_WARM: 3, STATUS_CHECK: 1 }),
      option('q08-c', '每天确认邮箱有没有新邮件', { A: 3, I: 1 }, { OC_HYPERVIGILANCE: 3, STATUS_CHECK: 2 }),
      option('q08-d', '默认是婉拒，只是不想说破', { A: 2, F: 2 }, { HR_KEEP_WARM: 1 }),
    ],
  },
  {
    id: 'q09', number: 9, eyebrow: '城市选择 / 09', prompt: '如果岗位不错但城市陌生，你会？',
    options: [
      option('q09-a', '只考虑熟悉的城市', { S: 3, W: 1 }),
      option('q09-b', '先面了再说', { P: 2, S: 1 }, { LOCATION_FLEX: 1 }),
      option('q09-c', '只要机会好，全国皆可', { P: 2, W: 2 }, { LOCATION_FLEX: 3 }),
      option('q09-d', '先查房租、通勤和落户政策', { I: 3, S: 2 }, { LOCATION_FLEX: 2, INFO_HUNT: 1 }),
    ],
  },
  {
    id: 'q10', number: 10, eyebrow: '岗位边界 / 10', prompt: '你发现一个岗位和专业完全不一样，第一念头是？',
    options: [
      option('q10-a', '不匹配就不浪费时间', { S: 2, D: 1 }),
      option('q10-b', '能讲清迁移能力就试试', { P: 2, D: 2 }, { ROLE_JUMP: 2 }),
      option('q10-c', '先投了再说，面上再解释', { P: 3, A: 1 }, { ROLE_JUMP: 3, HIGH_VOLUME: 1 }),
      option('q10-d', '开一张表研究转岗路径', { I: 3, D: 2 }, { ROLE_JUMP: 2, INFO_HUNT: 1 }),
    ],
  },
  {
    id: 'q11', number: 11, eyebrow: '投递计数 / 11', prompt: '朋友问你“这周投了几家”，你会？',
    options: [
      option('q11-a', '几家合适的，不报数字', { S: 1, I: 1 }),
      option('q11-b', '十几家，正在慢慢加速', { P: 2, F: 1 }, { HIGH_VOLUME: 1 }),
      option('q11-c', '每天投到平台弹出验证码', { P: 3, F: 2 }, { HIGH_VOLUME: 3 }),
      option('q11-d', '没投，正在准备一份完美简历', { A: 2, F: 1 }, { NO_PIPELINE: 2 }),
    ],
  },
  {
    id: 'q12', number: 12, eyebrow: '面经雷达 / 12', prompt: '面试前夜，你最可能打开哪个页面？',
    options: [
      option('q12-a', '自己的项目复盘', { D: 2, S: 1 }),
      option('q12-b', '公司官网和业务新闻', { I: 3, D: 1 }, { INFO_HUNT: 2 }),
      option('q12-c', '牛客面经翻到凌晨', { I: 3, A: 2 }, { INFO_HUNT: 3, EXAM_HELL: 1 }),
      option('q12-d', '面试官主页和校友路径', { I: 2, C: 2 }, { INFO_HUNT: 2, COMPARISON: 1 }),
    ],
  },
  {
    id: 'q13', number: 13, eyebrow: '玄学工位 / 13', prompt: '面试前发现自己今天穿了“上次被挂”的衣服，你会？',
    options: [
      option('q13-a', '衣服而已，照常出门', { S: 2, A: 0 }),
      option('q13-b', '换一件更像职场人的', { A: 1, S: 1 }),
      option('q13-c', '立刻换成上次拿到好消息的那件', { M: 3, A: 1 }, { SUPERSTITION: 3 }),
      option('q13-d', '查一下今天适合面试的颜色', { M: 2, I: 1 }, { SUPERSTITION: 2, INFO_HUNT: 1 }),
    ],
  },
  {
    id: 'q14', number: 14, eyebrow: '笔试战场 / 14', prompt: '笔试倒计时 24 小时，你的备战方式是？',
    options: [
      option('q14-a', '看一眼题型，早点睡', { W: 2, S: 1 }),
      option('q14-b', '刷高频题，能多会一道是一道', { I: 2, F: 2 }, { EXAM_HELL: 2 }),
      option('q14-c', '从题库、面经到群聊全部扫完', { I: 3, A: 2, F: 1 }, { EXAM_HELL: 3, INFO_HUNT: 2 }),
      option('q14-d', '相信手感，临场发挥', { M: 2, S: 1 }, { SUPERSTITION: 1, EXAM_HELL: 1 }),
    ],
  },
  {
    id: 'q15', number: 15, eyebrow: '复活赛 / 15', prompt: '一家公司拒绝后隔月又开放同岗，你会？',
    options: [
      option('q15-a', '不回头，继续看新机会', { S: 1, P: 1 }),
      option('q15-b', '换份简历再试一次', { P: 2, A: 1 }, { RETRY: 2 }),
      option('q15-c', '研究拒信，定制一版复仇简历', { I: 2, P: 2, A: 1 }, { RETRY: 3, INFO_HUNT: 1 }),
      option('q15-d', '先问问有没有其他岗位', { P: 2, D: 2 }, { RETRY: 2, ROLE_JUMP: 1 }),
    ],
  },
  {
    id: 'q16', number: 16, eyebrow: '进度比较 / 16', prompt: '同届同学晒薪资，你最可能想知道？',
    options: [
      option('q16-a', '替他开心，关掉手机', { S: 2, C: 0 }),
      option('q16-b', '大概问问城市和岗位', { C: 2, I: 1 }, { COMPARISON: 1 }),
      option('q16-c', '算出自己还差几档', { C: 3, A: 2 }, { COMPARISON: 3 }),
      option('q16-d', '顺便问他还有没有内推', { C: 2, P: 1 }, { COMPARISON: 2, REFERRAL: 1 }),
    ],
  },
  {
    id: 'q17', number: 17, eyebrow: '口头 OC / 17', prompt: 'HR 说“基本没问题”，你会把它理解成？',
    options: [
      option('q17-a', '没书面就不算数', { A: 2, S: 2 }, { OC_HYPERVIGILANCE: 1 }),
      option('q17-b', '值得开心，但继续投', { S: 1, P: 2 }, { PREMATURE_OC: 1 }),
      option('q17-c', '开始想象入职第一天', { D: 3, A: 1 }, { PREMATURE_OC: 3, DREAM_COMPANY: 1 }),
      option('q17-d', '马上查公司违约和背调流程', { I: 3, A: 2 }, { PREMATURE_OC: 2, INFO_HUNT: 2 }),
    ],
  },
  {
    id: 'q18', number: 18, eyebrow: '开奖页面 / 18', prompt: '面试结束后，你查看流程状态的频率是？',
    options: [
      option('q18-a', '等通知，先做下一件事', { W: 3, S: 1 }, { POOLING: 2 }),
      option('q18-b', '每天早晚各看一次', { A: 2, I: 1 }, { STATUS_CHECK: 2 }),
      option('q18-c', '刷到页面更新才安心', { A: 3, I: 2 }, { STATUS_CHECK: 3, OC_HYPERVIGILANCE: 2 }),
      option('q18-d', '搜全网看看别人几天开奖', { I: 3, A: 2 }, { STATUS_CHECK: 2, INFO_HUNT: 2 }),
    ],
  },
  {
    id: 'q19', number: 19, eyebrow: '薪资卡牌 / 19', prompt: '谈薪时对方问“期望薪资”，你会？',
    options: [
      option('q19-a', '按市场价给一个区间', { S: 2, D: 1 }),
      option('q19-b', '先问预算，再给范围', { I: 2, D: 2 }, { SALARY_NEGOTIATION: 2 }),
      option('q19-c', '把总包、股票、签字费都算一遍', { I: 3, D: 2, A: 1 }, { SALARY_NEGOTIATION: 3, OFFER_RICH: 1 }),
      option('q19-d', '能拿 offer 就先答应', { S: 3, A: 1 }, { HOLD_OFFER: 1 }),
    ],
  },
  {
    id: 'q20', number: 20, eyebrow: '反向面试 / 20', prompt: '面试最后“你还有什么问题”，你最想问？',
    options: [
      option('q20-a', '团队日常协作方式', { I: 2, S: 1 }),
      option('q20-b', '岗位成功标准和成长路径', { D: 2, I: 2 }, { REVERSE_INTERVIEW: 2 }),
      option('q20-c', '加班、汇报和真实离职率', { D: 2, A: 1 }, { REVERSE_INTERVIEW: 3 }),
      option('q20-d', '如果我入职，第一周会做什么', { D: 3, S: 1 }, { REVERSE_INTERVIEW: 2, PREMATURE_OC: 1 }),
    ],
  },
  {
    id: 'q21', number: 21, eyebrow: 'Offer 桌面 / 21', prompt: '手里已有一份保底 offer，梦司还在流程中，你会？',
    options: [
      option('q21-a', '接受保底，先把心放下', { S: 3, W: 2 }, { HOLD_OFFER: 2 }),
      option('q21-b', '继续比较，不急着签', { C: 2, W: 2 }, { HOLD_OFFER: 3, COMPARISON: 1 }),
      option('q21-c', '拿保底去谈更好的条件', { D: 2, I: 2 }, { HOLD_OFFER: 3, SALARY_NEGOTIATION: 2 }),
      option('q21-d', '每天祈祷梦司给个结果', { M: 3, A: 2 }, { HOLD_OFFER: 1, SUPERSTITION: 3, DREAM_COMPANY: 1 }),
    ],
  },
  {
    id: 'q22', number: 22, eyebrow: '拒信回收 / 22', prompt: '收到一封“很遗憾”的邮件，你一般多久恢复？',
    options: [
      option('q22-a', '当天就继续下一家', { P: 2, S: 1 }, { RETRY: 1 }),
      option('q22-b', '复盘一晚上，明天再投', { I: 2, F: 1 }, { RETRY: 2 }),
      option('q22-c', '保存拒信，研究哪里能改', { I: 3, A: 1 }, { RETRY: 3, INFO_HUNT: 1 }),
      option('q22-d', '先去算一卦下家方向', { M: 3, A: 2 }, { RETRY: 2, SUPERSTITION: 2 }),
    ],
  },
  {
    id: 'q23', number: 23, eyebrow: '信息流 / 23', prompt: '校园宣讲会结束后，你会带走什么？',
    options: [
      option('q23-a', '一张海报和一瓶水', { S: 1, W: 1 }),
      option('q23-b', '岗位表和投递链接', { P: 2, I: 2 }, { INFO_HUNT: 1 }),
      option('q23-c', '加 HR、加学长、加群聊', { P: 2, I: 3 }, { INFO_HUNT: 2, REFERRAL: 2 }),
      option('q23-d', '现场问到业务细节再走', { I: 3, D: 2 }, { INFO_HUNT: 3, REVERSE_INTERVIEW: 1 }),
    ],
  },
  {
    id: 'q24', number: 24, eyebrow: '职业剧本 / 24', prompt: '面试官问“你三年后的规划”，你会？',
    options: [
      option('q24-a', '踏实做好眼前的岗位', { S: 2, W: 2 }),
      option('q24-b', '说一条能落地的专业路线', { D: 2, S: 1 }),
      option('q24-c', '展示跨岗位、跨行业的可能性', { D: 3, P: 1 }, { ROLE_JUMP: 3 }),
      option('q24-d', '先看公司给不给成长机会', { I: 2, D: 2 }, { ROLE_JUMP: 2, REVERSE_INTERVIEW: 1 }),
    ],
  },
  {
    id: 'q25', number: 25, eyebrow: '迟到档案 / 25', prompt: '九月中旬才开始认真投递，你会对自己说？',
    options: [
      option('q25-a', '还来得及，稳住', { S: 2, W: 1 }),
      option('q25-b', '把简历和目标快速收敛', { P: 2, I: 2 }, { LATE_START: 1 }),
      option('q25-c', '打开所有平台先投一轮', { P: 3, A: 1 }, { LATE_START: 3, HIGH_VOLUME: 2 }),
      option('q25-d', '先搜“秋招十月开始晚不晚”', { I: 3, A: 2 }, { LATE_START: 2, INFO_HUNT: 2 }),
    ],
  },
  {
    id: 'q26', number: 26, eyebrow: '保底策略 / 26', prompt: '你如何定义“值得去的保底岗”？',
    options: [
      option('q26-a', '能让我不焦虑就够了', { S: 3, A: 1 }),
      option('q26-b', '薪资、城市、发展至少两项过线', { S: 2, I: 2 }),
      option('q26-c', '先拿到手，再慢慢比较', { P: 2, W: 2 }, { HOLD_OFFER: 2 }),
      option('q26-d', '保底也要能反向筛选公司', { D: 2, I: 2 }, { REVERSE_INTERVIEW: 2 }),
    ],
  },
  {
    id: 'q27', number: 27, eyebrow: '同届雷达 / 27', prompt: '朋友问“你现在到哪一步了”，你会？',
    options: [
      option('q27-a', '如实说，互相打气', { S: 1, W: 2 }),
      option('q27-b', '先问他进度，再回答', { C: 2, I: 1 }, { COMPARISON: 2 }),
      option('q27-c', '回家后复盘自己是不是落后', { C: 3, A: 3 }, { COMPARISON: 3 }),
      option('q27-d', '顺手交换面经和内推', { I: 2, P: 1 }, { COMPARISON: 1, REFERRAL: 2 }),
    ],
  },
  {
    id: 'q28', number: 28, eyebrow: '邮件监听 / 28', prompt: '你如何处理“邮件通知”这件事？',
    options: [
      option('q28-a', '每天固定时间看一次', { W: 2, S: 1 }, { STATUS_CHECK: 1 }),
      option('q28-b', '只开重要公司的提醒', { I: 2, S: 1 }, { OC_HYPERVIGILANCE: 1 }),
      option('q28-c', '所有招聘邮件都开推送', { A: 3, I: 1 }, { OC_HYPERVIGILANCE: 3, STATUS_CHECK: 2 }),
      option('q28-d', '邮件一响就立刻点开', { A: 2, F: 1 }, { OC_HYPERVIGILANCE: 2, STATUS_CHECK: 2 }),
    ],
  },
  {
    id: 'q29', number: 29, eyebrow: '签字时刻 / 29', prompt: '如果今天拿到正式 offer，你第一件事是？',
    options: [
      option('q29-a', '签字，去吃顿好的', { S: 2, F: 0 }, { SIGNED: 2 }),
      option('q29-b', '对比合同和福利细节', { I: 3, S: 1 }, { SIGNED: 1, HOLD_OFFER: 2 }),
      option('q29-c', '发群里，然后继续看看', { C: 1, P: 1 }, { SIGNED: 1, OFFER_RICH: 1 }),
      option('q29-d', '先问清楚能不能延迟签约', { W: 2, D: 1 }, { SIGNED: 1, HOLD_OFFER: 3 }),
    ],
  },
  {
    id: 'q30', number: 30, eyebrow: '最后一题 / 30', prompt: '如果秋招是一种天气，今天的你是什么？',
    options: [
      option('q30-a', '晴天：按计划走就行', { S: 3, W: 3 }, { SUPERSTITION: 0 }),
      option('q30-b', '阴天：先等等看', { W: 2, A: 1 }, { HR_KEEP_WARM: 1, POOLING: 1 }),
      option('q30-c', '雷暴：每个通知都像开奖', { A: 3, F: 2 }, { OC_HYPERVIGILANCE: 2, STATUS_CHECK: 2 }),
      option('q30-d', '玄学彩虹：总会轮到我', { M: 3, A: 1 }, { SUPERSTITION: 3 }),
    ],
  },
];

export const TOTAL_QUIZ_QUESTIONS = QUESTIONS.length;
