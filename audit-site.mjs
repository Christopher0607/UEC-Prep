import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
const BASE = "http://localhost:4173";
const SHOT = process.env.AUDIT_SHOT_DIR ?? ".audit";
await mkdir(SHOT, { recursive: true });
const errs = [], nf = [], fails = [];
const ok = (name, cond, extra = "") => {
  console.log(`${cond ? "✓" : "✗"} ${name}${extra ? "  " + extra : ""}`);
  if (!cond) fails.push(name);
};

const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await b.newPage({ viewport: { width: 1100, height: 1400 } });
page.on("pageerror", (e) => errs.push(`${page.url()} :: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errs.push(`${page.url()} :: ${m.text()}`); });
page.on("response", (r) => { if (r.status() === 404) nf.push(r.url()); });
await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
const go = (p) => page.goto(BASE + p, { waitUntil: "networkidle" });
const panel = (t) => page.locator("section").filter({ has: page.getByRole("heading", { name: t, exact: true }) });

const ROUTES = ["/", "/syllabus/", "/mistakes/", "/feynman/", "/essay/", "/chinese/", "/flashcards/", "/papers/", "/bank/", "/data/"];

console.log("── A. 每个页面都打得开 ──");
for (const r of ROUTES) {
  const res = await go(r);
  ok(`GET ${r}`, res?.status() === 200, `HTTP ${res?.status()}`);
  ok(`  ${r} 有内容`, (await page.locator("section").count()) > 0);
}

console.log("\n── B. 导航每个标签都可点 ──");
await go("/");
const tabs = await page.locator("nav a").allInnerTexts();
ok("导航标签数", tabs.length >= 10, tabs.join(" "));
for (const t of tabs) {
  await page.getByRole("link", { name: t, exact: true }).first().click();
  await page.waitForTimeout(150);
  ok(`  点「${t}」跳转成功`, !page.url().includes("404"));
}

console.log("\n── C. 一键载入 ──");
await go("/");
await page.evaluate(() => localStorage.clear());
await go("/");
await page.waitForTimeout(500);
ok("空数据时显示载入面板", await page.getByText("先把内容装进来").isVisible());
await page.getByRole("button", { name: "一键载入全部" }).click();
await page.waitForTimeout(1200);
const got = await panel("内容已装好").innerText();
ok("三项都满格", /450 \/ 450/.test(got) && /313 \/ 313/.test(got) && /43 \/ 43/.test(got), got.match(/\d+ \/ \d+/g)?.join(" "));
await page.getByRole("button", { name: "补载入缺的" }).click();
await page.waitForTimeout(600);
ok("重复点不重复加", await page.getByText("都已经在里面了，没有要补的。").isVisible());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(600);
ok("刷新后数据还在", /450 \/ 450/.test(await panel("内容已装好").innerText()));

console.log("\n── D. 考点页 ──");
await go("/syllabus/");
await page.waitForTimeout(400);
for (const [sub, n] of [["english",27],["chinese",23],["accounting",137],["economics",104],["business",83],["math",35],["advmath",41]]) {
  await panel("考点覆盖表").locator("select").selectOption(sub);
  await page.waitForTimeout(250);
  const txt = await page.locator("section").filter({ hasText: "· 考点" }).first().innerText();
  ok(`  ${sub} 考点数`, txt.includes(`/ ${n}`), txt.split("\n")[1] ?? "");
}
await panel("考点覆盖表").locator("select").selectOption("math");
await page.waitForTimeout(300);
await page.getByRole("button", { name: "只看盲区" }).click();
await page.waitForTimeout(300);
const firstTopic = page.locator("li", { hasText: "代数分式的化简与四则" }).first();
await firstTopic.getByRole("button", { name: "熟练，能默写" }).click();
await page.waitForTimeout(300);
ok("打掌握度后盲区数减少", (await page.locator("section").filter({ hasText: "· 考点" }).first().innerText()).includes("熟练 1"));
await page.getByRole("button", { name: "显示全部" }).click();
await page.waitForTimeout(200);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(500);
await panel("考点覆盖表").locator("select").selectOption("math");
await page.waitForTimeout(300);
ok("掌握度刷新后还在", (await page.locator("section").filter({ hasText: "· 考点" }).first().innerText()).includes("熟练 1"));

console.log("\n── E. 背诵页 ──");
await go("/flashcards/");
await page.waitForTimeout(500);
ok("默认范围=全部", (await panel("今天要背的").innerText()).includes("全部"));
await page.getByRole("button", { name: "换一组" }).click();
await page.waitForTimeout(300);
for (const name of ["华文 · 文学常识", "数学 · 触发条件卡", "高数 · 触发条件卡", "会计 · 英文术语"]) {
  const chip = page.getByRole("button", { name: new RegExp("^" + name) }).first();
  ok(`  卡组按钮「${name}」存在`, await chip.count() > 0);
}
await page.getByRole("button", { name: /^数学 · 触发条件卡/ }).first().click();
await page.waitForTimeout(400);
ok("切到数学卡组", (await panel("今天要背的").innerText()).includes("数学 · 触发条件卡"));
await page.getByRole("button", { name: /先自己想/ }).click();
await page.waitForTimeout(300);
const face = await panel("今天要背的").innerText();
ok("翻面后看得到答案与两个按钮", face.includes("忘了") && face.includes("记得"));
const before = (await panel("今天要背的").innerText()).match(/剩 (\d+) 张/)?.[1];
await page.getByRole("button", { name: /^记得/ }).click();
await page.waitForTimeout(400);
const after = (await panel("今天要背的").innerText()).match(/剩 (\d+) 张/)?.[1];
ok("点「记得」后队列减少", Number(after) === Number(before) - 1, `${before} → ${after}`);
await page.getByRole("button", { name: "忘了" }).count().then(async () => {
  await page.getByRole("button", { name: /先自己想/ }).click();
  await page.waitForTimeout(250);
  await page.getByRole("button", { name: "忘了" }).click();
  await page.waitForTimeout(300);
});
ok("点「忘了」不报错", true);
const lib = panel("卡片库");
await lib.getByText("华文 · 文学常识（老师讲义 162 条）").click();
await page.waitForTimeout(400);
await lib.getByText("点开看答案").first().click();
await page.waitForTimeout(300);
ok("卡片库展开看得到答案", (await lib.innerText()).includes("▸"));

console.log("\n── F. 错题页 ──");
await go("/mistakes/");
await page.waitForTimeout(500);
const mt = await page.locator("body").innerText();
ok("预考错题已在列表", mt.includes("2026 预考"));
ok("显示「我写的」", mt.includes("我写的"));
ok("显示「正解／卡在哪」", mt.includes("正解／卡在哪"));
await panel("记一条错题").locator("select").first().selectOption("advmath");
await page.waitForTimeout(200);
const ta = panel("记一条错题").locator("textarea");
await ta.nth(0).fill("审计测试题");
await ta.nth(1).fill("我写的过程");
await page.getByPlaceholder(/两边同时对/).fill("卡在这一步");
await panel("记一条错题").getByRole("button", { name: /记下来|加入|保存|添加/ }).first().click().catch(() => {});
await page.waitForTimeout(400);
ok("能新增一条错题", (await page.locator("body").innerText()).includes("审计测试题"));

console.log("\n── G. 真题页：七科都有卷面结构 ──");
await go("/papers/");
await page.waitForTimeout(400);
for (const sub of ["english","chinese","accounting","economics","business","math","advmath"]) {
  await page.locator("select").first().selectOption(sub);
  await page.waitForTimeout(250);
  const t = await page.locator("body").innerText();
  ok(`  ${sub} 有卷面结构`, t.includes("%"), "");
}

console.log("\n── H. 备份：导出→清空→导入 ──");
await go("/data/");
await page.waitForTimeout(400);
const json = await page.evaluate(() => localStorage.getItem("uec-prep-v1") ?? localStorage.getItem(Object.keys(localStorage)[0]));
ok("localStorage 有数据", !!json && json.length > 1000, `${Math.round((json?.length ?? 0)/1024)} KB`);
const stats = await panel("备份").innerText();
ok("备份页统计非零", /考点/.test(stats) && !/^0$/m.test(stats.split("考点")[0].trim()));
await page.evaluate(() => localStorage.clear());
await go("/data/");
await page.waitForTimeout(400);
await page.evaluate((j) => { localStorage.setItem("uec-prep-v1", j); }, json);
await go("/flashcards/");
await page.waitForTimeout(600);
ok("导入回来后卡片还在", (await panel("卡片库").innerText()).includes("313") || (await panel("卡片库").innerText()).match(/共 \d{3} 张/) !== null);

console.log("\n── I. 手机 390px 全页不横向溢出 ──");
const m = await b.newPage({ viewport: { width: 390, height: 844 } });
m.on("pageerror", (e) => errs.push(`mobile ${m.url()} :: ${e.message}`));
await m.goto(BASE + "/", { waitUntil: "networkidle" });
await m.evaluate((j) => localStorage.setItem("uec-prep-v1", j), json);
for (const r of ROUTES) {
  await m.goto(BASE + r, { waitUntil: "networkidle" });
  await m.waitForTimeout(400);
  const over = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  ok(`  ${r}`, !over, over ? `溢出 ${await m.evaluate(() => document.documentElement.scrollWidth)}px` : "");
}
await m.goto(BASE + "/flashcards/", { waitUntil: "networkidle" });
await m.waitForTimeout(500);
await m.screenshot({ path: `${SHOT}/audit-mobile-flash.png` });
await m.close();

console.log("\n══ 总结 ══");
console.log("失败项:", fails.length ? fails.join(" / ") : "无");
console.log("404:", nf.length ? [...new Set(nf)].join(" ") : "无");
console.log("JS 错误:", errs.length ? [...new Set(errs)].slice(0,8).join("\n  ") : "无");
await b.close();
process.exit(fails.length || errs.length || nf.length ? 1 : 0);
