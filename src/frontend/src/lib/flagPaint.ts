/**
 * Canvas country flags. Stripe and canton layouts — no emoji, no CDN.
 * Good enough to read at range on aircraft and poles.
 */

type Spec =
  | { k: "h"; c: string[] }
  | { k: "v"; c: string[] }
  | { k: "nordic"; bg: string; cross: string; inner?: string }
  | { k: "special"; id: string };

const W = "#ffffff";
const K = "#000000";

const SPECS: Record<string, Spec> = {
  ad: { k: "v", c: ["#10069f", "#fedd00", "#d0103a"] },
  ae: { k: "special", id: "ae" },
  af: { k: "v", c: ["#000000", "#d32011", "#007a3d"] },
  ag: { k: "special", id: "ag" },
  ai: { k: "special", id: "ukcanton" },
  al: { k: "h", c: ["#e41e20", "#e41e20", "#e41e20"] },
  am: { k: "h", c: ["#d90012", "#0033a0", "#f2a800"] },
  ao: { k: "h", c: ["#c8102e", "#000000"] },
  ar: { k: "h", c: ["#74acdf", W, "#74acdf"] },
  at: { k: "h", c: ["#ed2939", W, "#ed2939"] },
  au: { k: "special", id: "au" },
  aw: { k: "special", id: "aw" },
  az: { k: "h", c: ["#00b5e2", "#ef3340", "#509e2f"] },
  ba: { k: "special", id: "ba" },
  bb: { k: "v", c: ["#00267f", "#ffc726", "#00267f"] },
  bd: { k: "special", id: "bd" },
  be: { k: "v", c: [K, "#fadc0d", "#c8102e"] },
  bf: { k: "h", c: ["#ef2b2d", "#009e49"] },
  bg: { k: "h", c: [W, "#00966e", "#d62612"] },
  bh: { k: "special", id: "bh" },
  bi: { k: "special", id: "saltire" },
  bj: { k: "special", id: "bj" },
  bn: { k: "special", id: "bn" },
  bo: { k: "h", c: ["#d52b1e", "#f9e300", "#007934"] },
  br: { k: "special", id: "br" },
  bs: { k: "special", id: "bs" },
  bt: { k: "h", c: ["#ffda44", "#ff4e12"] },
  bw: { k: "special", id: "bw" },
  by: { k: "h", c: ["#c8313e", "#c8313e", "#4aa657"] },
  bz: { k: "h", c: ["#003f87", "#ce1126", "#003f87"] },
  ca: { k: "special", id: "ca" },
  cd: { k: "special", id: "cd" },
  cf: { k: "h", c: ["#003082", W, "#289728", "#ffce00"] },
  cg: { k: "special", id: "cg" },
  ch: { k: "special", id: "ch" },
  ci: { k: "v", c: ["#f77f00", W, "#009e60"] },
  cl: { k: "special", id: "cl" },
  cm: { k: "v", c: ["#007a5e", "#ce1126", "#fcd116"] },
  cn: { k: "special", id: "cn" },
  co: { k: "h", c: ["#fcd116", "#003893", "#ce1126"] },
  cr: { k: "h", c: ["#002b7f", W, "#ce1126", W, "#002b7f"] },
  cu: { k: "special", id: "cu" },
  cv: { k: "h", c: ["#003893", W, "#cf2027", W, "#003893"] },
  cy: { k: "h", c: [W, W, W] },
  cz: { k: "special", id: "cz" },
  de: { k: "h", c: [K, "#dd0000", "#ffce00"] },
  dj: { k: "special", id: "dj" },
  dk: { k: "nordic", bg: "#c8102e", cross: W },
  dm: { k: "special", id: "dm" },
  do: { k: "special", id: "do" },
  dz: { k: "v", c: ["#006233", W] },
  ec: { k: "h", c: ["#ffdd00", "#034ea2", "#ed1c24"] },
  ee: { k: "h", c: ["#0072ce", K, W] },
  eg: { k: "h", c: ["#ce1126", W, K] },
  er: { k: "special", id: "er" },
  es: { k: "h", c: ["#aa151b", "#f1bf00", "#aa151b"] },
  et: { k: "h", c: ["#078930", "#fcd116", "#da121a"] },
  fi: { k: "nordic", bg: W, cross: "#003580" },
  fj: { k: "special", id: "ukcanton" },
  fm: { k: "h", c: ["#75b2dd", "#75b2dd", "#75b2dd"] },
  fr: { k: "v", c: ["#002395", W, "#ed2939"] },
  ga: { k: "h", c: ["#009e60", "#fcd116", "#3a75c4"] },
  gb: { k: "special", id: "gb" },
  gd: { k: "special", id: "gd" },
  ge: { k: "special", id: "ge" },
  gh: { k: "h", c: ["#ce1126", "#fcd116", "#006b3f"] },
  gm: { k: "h", c: ["#ce1126", W, "#0c1c8c", W, "#3a7728"] },
  gn: { k: "v", c: ["#ce1126", "#fcd116", "#009460"] },
  gq: { k: "special", id: "gq" },
  gr: { k: "special", id: "gr" },
  gt: { k: "v", c: ["#4997d0", W, "#4997d0"] },
  gw: { k: "special", id: "gw" },
  gy: { k: "special", id: "gy" },
  hk: { k: "h", c: ["#de2910", "#de2910", "#de2910"] },
  hn: { k: "h", c: ["#0073cf", W, "#0073cf"] },
  hr: { k: "h", c: ["#ff0000", W, "#171796"] },
  ht: { k: "h", c: ["#00209f", "#d21034"] },
  hu: { k: "h", c: ["#ce2939", W, "#477050"] },
  id: { k: "h", c: ["#ce1126", W] },
  ie: { k: "v", c: ["#169b62", W, "#ff883e"] },
  il: { k: "special", id: "il" },
  in: { k: "h", c: ["#ff9933", W, "#138808"] },
  iq: { k: "h", c: ["#ce1126", W, K] },
  ir: { k: "h", c: ["#239f40", W, "#da0000"] },
  is: { k: "nordic", bg: "#02529c", cross: W, inner: "#dc1e35" },
  it: { k: "v", c: ["#009246", W, "#ce2b37"] },
  jm: { k: "special", id: "jm" },
  jo: { k: "special", id: "jo" },
  jp: { k: "special", id: "jp" },
  ke: { k: "h", c: [K, "#bb0000", "#006600"] },
  kg: { k: "h", c: ["#e8112d", "#e8112d", "#e8112d"] },
  kh: { k: "h", c: ["#032ea1", "#e00025", "#032ea1"] },
  ki: { k: "h", c: ["#ce1126", "#ce1126", "#003f87"] },
  km: { k: "h", c: ["#ffd100", W, "#00a04d", "#dc241f"] },
  kn: { k: "special", id: "kn" },
  kp: { k: "special", id: "kp" },
  kr: { k: "special", id: "kr" },
  kw: { k: "special", id: "kw" },
  kz: { k: "h", c: ["#00afca", "#00afca", "#00afca"] },
  la: { k: "h", c: ["#ce1126", "#002868", "#ce1126"] },
  lb: { k: "h", c: ["#ed1c24", W, "#ed1c24"] },
  lc: { k: "h", c: ["#66ccff", "#66ccff", "#66ccff"] },
  li: { k: "h", c: ["#002b7f", "#ce1126"] },
  lk: { k: "special", id: "lk" },
  lr: { k: "special", id: "lr" },
  ls: { k: "h", c: ["#00209f", W, "#009543"] },
  lt: { k: "h", c: ["#fdb913", "#006a44", "#c1272d"] },
  lu: { k: "h", c: ["#ea141d", W, "#3399ff"] },
  lv: { k: "h", c: ["#9e3039", W, "#9e3039"] },
  ly: { k: "h", c: ["#e70013", K, "#239e46"] },
  ma: { k: "h", c: ["#c1272d", "#c1272d", "#c1272d"] },
  mc: { k: "h", c: ["#ce1126", W] },
  md: { k: "v", c: ["#003da5", "#ffd200", "#c8102e"] },
  me: { k: "h", c: ["#c40308", "#c40308", "#c40308"] },
  mg: { k: "special", id: "mg" },
  mh: { k: "special", id: "mh" },
  mk: { k: "special", id: "mk" },
  ml: { k: "v", c: ["#14b53a", "#fcd116", "#ce1126"] },
  mm: { k: "h", c: ["#fecb00", "#34b233", "#ea2839"] },
  mn: { k: "v", c: ["#c4272f", "#015197", "#c4272f"] },
  mr: { k: "h", c: ["#d01c1f", "#00a95c", "#00a95c"] },
  mt: { k: "v", c: [W, "#cf142b"] },
  mu: { k: "h", c: ["#ea1219", "#1a206d", "#ffd500", "#00a551"] },
  mv: { k: "special", id: "mv" },
  mw: { k: "h", c: [K, "#ce1126", "#339e35"] },
  mx: { k: "v", c: ["#006847", W, "#ce1126"] },
  my: { k: "special", id: "my" },
  mz: { k: "special", id: "mz" },
  na: { k: "special", id: "na" },
  ne: { k: "h", c: ["#e05206", W, "#0db02b"] },
  ng: { k: "v", c: ["#008751", W, "#008751"] },
  ni: { k: "h", c: ["#0067c6", W, "#0067c6"] },
  nl: { k: "h", c: ["#ae1c28", W, "#21468b"] },
  no: { k: "nordic", bg: "#ba0c2f", cross: W, inner: "#00205b" },
  np: { k: "special", id: "np" },
  nr: { k: "h", c: ["#002b7f", "#ffc61e", "#002b7f"] },
  nz: { k: "special", id: "nz" },
  om: { k: "special", id: "om" },
  pa: { k: "special", id: "pa" },
  pe: { k: "v", c: ["#d91023", W, "#d91023"] },
  pg: { k: "special", id: "pg" },
  ph: { k: "special", id: "ph" },
  pk: { k: "special", id: "pk" },
  pl: { k: "h", c: [W, "#dc143c"] },
  pt: { k: "special", id: "pt" },
  pw: { k: "special", id: "pw" },
  py: { k: "h", c: ["#d52b1e", W, "#0038a8"] },
  qa: { k: "special", id: "qa" },
  ro: { k: "v", c: ["#002b7f", "#fcd116", "#ce1126"] },
  rs: { k: "h", c: ["#c6363c", "#0c4076", W] },
  ru: { k: "h", c: [W, "#0039a6", "#d52b1e"] },
  rw: { k: "h", c: ["#00a1de", "#fad201", "#20603d"] },
  sa: { k: "h", c: ["#006c35", "#006c35", "#006c35"] },
  sb: { k: "special", id: "sb" },
  sc: { k: "special", id: "sc" },
  sd: { k: "special", id: "sd" },
  se: { k: "nordic", bg: "#006aa7", cross: "#fecc00" },
  sg: { k: "h", c: ["#ef3340", W] },
  si: { k: "h", c: [W, "#005da4", "#ed1c24"] },
  sk: { k: "h", c: [W, "#0b4ea2", "#ee1c25"] },
  sl: { k: "h", c: ["#1eb53a", W, "#0072c6"] },
  sm: { k: "h", c: [W, "#5eb6e4"] },
  sn: { k: "v", c: ["#00853f", "#fdef42", "#e31b23"] },
  so: { k: "h", c: ["#4189dd", "#4189dd", "#4189dd"] },
  sr: { k: "h", c: ["#377e3f", W, "#b40a2d", W, "#377e3f"] },
  ss: { k: "special", id: "ss" },
  st: { k: "h", c: ["#12ad2b", "#ffce00", "#12ad2b"] },
  sv: { k: "h", c: ["#0047ab", W, "#0047ab"] },
  sy: { k: "h", c: ["#ce1126", W, K] },
  sz: { k: "h", c: ["#3e5eb9", "#ffd900", "#b10c0c"] },
  td: { k: "v", c: ["#002664", "#fecb00", "#c60c30"] },
  tg: { k: "special", id: "tg" },
  th: { k: "h", c: ["#a51931", W, "#2d2a4a", W, "#a51931"] },
  tj: { k: "h", c: ["#cc0000", W, "#006600"] },
  tl: { k: "special", id: "tl" },
  tm: { k: "h", c: ["#00843d", "#00843d", "#00843d"] },
  tn: { k: "special", id: "tn" },
  to: { k: "special", id: "to" },
  tr: { k: "special", id: "tr" },
  tt: { k: "special", id: "tt" },
  tv: { k: "special", id: "ukcanton" },
  tw: { k: "special", id: "tw" },
  tz: { k: "special", id: "tz" },
  ua: { k: "h", c: ["#005bbb", "#ffd500"] },
  ug: { k: "h", c: [K, "#fcdc04", "#d90000", K, "#fcdc04", "#d90000"] },
  us: { k: "special", id: "us" },
  uy: { k: "special", id: "uy" },
  uz: { k: "h", c: ["#1eb53a", "#0099b5", "#ce1126"] },
  va: { k: "v", c: ["#ffe000", W] },
  vc: { k: "v", c: ["#0072c6", "#fcd116", "#0072c6"] },
  ve: { k: "h", c: ["#ffcc00", "#00247d", "#cf142b"] },
  vn: { k: "special", id: "vn" },
  vu: { k: "special", id: "vu" },
  ws: { k: "special", id: "ws" },
  xk: { k: "h", c: ["#244aa5", "#244aa5", "#244aa5"] },
  ye: { k: "h", c: ["#ce1126", W, K] },
  za: { k: "special", id: "za" },
  zm: { k: "h", c: ["#198a00", "#198a00", "#198a00"] },
  zw: { k: "special", id: "zw" },
};

export function paintFlag(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  code: string,
) {
  const key = code.trim().toLowerCase();
  const spec = SPECS[key];
  ctx.clearRect(0, 0, w, h);
  if (!spec) {
    paintUnknown(ctx, w, h, key);
    return;
  }
  switch (spec.k) {
    case "h":
      paintH(ctx, w, h, spec.c);
      break;
    case "v":
      paintV(ctx, w, h, spec.c);
      break;
    case "nordic":
      paintNordic(ctx, w, h, spec.bg, spec.cross, spec.inner);
      break;
    case "special":
      paintSpecial(ctx, w, h, spec.id, key);
      break;
  }
}

function paintH(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  c: string[],
) {
  const n = c.length;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = c[i];
    ctx.fillRect(0, (h * i) / n, w, h / n + 1);
  }
}

function paintV(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  c: string[],
) {
  const n = c.length;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = c[i];
    ctx.fillRect((w * i) / n, 0, w / n + 1, h);
  }
}

function paintNordic(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: string,
  cross: string,
  inner?: string,
) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  const x = w * 0.36;
  const t = h * 0.18;
  ctx.fillStyle = cross;
  ctx.fillRect(0, (h - t) / 2, w, t);
  ctx.fillRect(x - t / 2, 0, t, h);
  if (inner) {
    const t2 = t * 0.45;
    ctx.fillStyle = inner;
    ctx.fillRect(0, (h - t2) / 2, w, t2);
    ctx.fillRect(x - t2 / 2, 0, t2, h);
  }
}

function paintUnknown(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  code: string,
) {
  ctx.fillStyle = "#1c3f70";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = W;
  ctx.font = `bold ${Math.floor(h * 0.28)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(code.toUpperCase(), w / 2, h / 2);
}

function star(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.4;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

function circle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
) {
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function paintSpecial(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  id: string,
  code: string,
) {
  switch (id) {
    case "us":
      paintUS(ctx, w, h);
      return;
    case "gb":
      paintGB(ctx, w, h);
      return;
    case "jp":
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#bc002d";
      circle(ctx, w * 0.5, h * 0.5, h * 0.28);
      return;
    case "cn":
      ctx.fillStyle = "#de2910";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffde00";
      star(ctx, w * 0.18, h * 0.28, h * 0.14);
      return;
    case "ch":
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      ctx.fillRect(w * 0.38, h * 0.18, w * 0.24, h * 0.64);
      ctx.fillRect(w * 0.18, h * 0.38, w * 0.64, h * 0.24);
      return;
    case "ca":
      paintV(ctx, w, h, ["#ff0000", W, "#ff0000"]);
      ctx.fillStyle = "#ff0000";
      star(ctx, w * 0.5, h * 0.5, h * 0.22);
      return;
    case "br":
      ctx.fillStyle = "#009c3b";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffdf00";
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.12);
      ctx.lineTo(w * 0.92, h * 0.5);
      ctx.lineTo(w * 0.5, h * 0.88);
      ctx.lineTo(w * 0.08, h * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#002776";
      circle(ctx, w * 0.5, h * 0.5, h * 0.18);
      return;
    case "in":
      paintH(ctx, w, h, ["#ff9933", W, "#138808"]);
      ctx.strokeStyle = "#000088";
      ctx.lineWidth = Math.max(2, h * 0.025);
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, h * 0.12, 0, Math.PI * 2);
      ctx.stroke();
      return;
    case "il":
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#0038b8";
      ctx.fillRect(0, h * 0.12, w, h * 0.1);
      ctx.fillRect(0, h * 0.78, w, h * 0.1);
      ctx.strokeStyle = "#0038b8";
      ctx.lineWidth = Math.max(2, h * 0.03);
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.3);
      ctx.lineTo(w * 0.38, h * 0.52);
      ctx.lineTo(w * 0.62, h * 0.52);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.7);
      ctx.lineTo(w * 0.38, h * 0.48);
      ctx.lineTo(w * 0.62, h * 0.48);
      ctx.closePath();
      ctx.stroke();
      return;
    case "tr":
      ctx.fillStyle = "#e30a17";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      circle(ctx, w * 0.38, h * 0.5, h * 0.22);
      ctx.fillStyle = "#e30a17";
      circle(ctx, w * 0.44, h * 0.5, h * 0.17);
      ctx.fillStyle = W;
      star(ctx, w * 0.58, h * 0.5, h * 0.12);
      return;
    case "sa":
      ctx.fillStyle = "#006c35";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      ctx.fillRect(w * 0.22, h * 0.72, w * 0.56, h * 0.08);
      return;
    case "za":
      paintZA(ctx, w, h);
      return;
    case "au":
    case "nz":
      paintGB(ctx, w, h);
      ctx.save();
      ctx.beginPath();
      ctx.rect(w * 0.5, 0, w * 0.5, h);
      ctx.clip();
      ctx.fillStyle = "#012169";
      ctx.fillRect(w * 0.5, 0, w * 0.5, h);
      ctx.fillStyle = W;
      star(ctx, w * 0.75, h * 0.55, h * 0.1);
      star(ctx, w * 0.62, h * 0.28, h * 0.06);
      star(ctx, w * 0.88, h * 0.32, h * 0.06);
      ctx.restore();
      return;
    case "ukcanton":
      ctx.fillStyle = "#012169";
      ctx.fillRect(0, 0, w, h);
      paintGB(ctx, w * 0.5, h * 0.5);
      return;
    case "gr":
      paintGR(ctx, w, h);
      return;
    case "kr":
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#cd2e3a";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, h * 0.22, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = "#0047a0";
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.5, h * 0.22, 0, Math.PI);
      ctx.fill();
      return;
    case "kp":
      paintH(ctx, w, h, ["#024fa2", W, "#ed1c27", W, "#024fa2"]);
      ctx.fillStyle = W;
      circle(ctx, w * 0.28, h * 0.5, h * 0.16);
      ctx.fillStyle = "#ed1c27";
      star(ctx, w * 0.28, h * 0.5, h * 0.12);
      return;
    case "vn":
      ctx.fillStyle = "#da251d";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff0";
      star(ctx, w * 0.5, h * 0.5, h * 0.22);
      return;
    case "tw":
      ctx.fillStyle = "#fe0000";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#000095";
      ctx.fillRect(0, 0, w * 0.5, h * 0.55);
      ctx.fillStyle = W;
      star(ctx, w * 0.25, h * 0.28, h * 0.14);
      return;
    case "cl":
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#d52b1e";
      ctx.fillRect(0, h * 0.5, w, h * 0.5);
      ctx.fillStyle = "#0039a6";
      ctx.fillRect(0, 0, w * 0.35, h * 0.5);
      ctx.fillStyle = W;
      star(ctx, w * 0.175, h * 0.25, h * 0.12);
      return;
    case "cu":
      paintH(ctx, w, h, ["#002a8f", W, "#002a8f", W, "#002a8f"]);
      paintHoistTriangle(ctx, w, h, "#cf142b");
      ctx.fillStyle = W;
      star(ctx, w * 0.16, h * 0.5, h * 0.1);
      return;
    case "cz":
      paintH(ctx, w, h, [W, "#d7141a"]);
      paintHoistTriangle(ctx, w, h, "#11457e");
      return;
    case "ph":
      paintH(ctx, w, h, ["#0038a8", "#ce1126"]);
      paintHoistTriangle(ctx, w, h, W);
      ctx.fillStyle = "#fcd116";
      star(ctx, w * 0.14, h * 0.5, h * 0.08);
      return;
    case "sd":
      paintH(ctx, w, h, ["#d21034", W, K]);
      paintHoistTriangle(ctx, w, h, "#007229");
      return;
    case "ss":
      paintH(ctx, w, h, [K, "#da121a", "#078930"]);
      paintHoistTriangle(ctx, w, h, "#0f47af");
      return;
    case "jo":
      paintH(ctx, w, h, [K, W, "#007a3d"]);
      paintHoistTriangle(ctx, w, h, "#ce1126");
      return;
    case "kw":
      paintH(ctx, w, h, ["#007a3d", W, "#ce1126"]);
      paintHoistTriangle(ctx, w, h, K);
      return;
    case "ae":
      paintH(ctx, w, h, ["#00732f", W, K]);
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, w * 0.25, h);
      return;
    case "bj":
      paintH(ctx, w, h, ["#fcd116", "#e8112d"]);
      ctx.fillStyle = "#008751";
      ctx.fillRect(0, 0, w * 0.4, h);
      return;
    case "mg":
      paintH(ctx, w, h, ["#fc3d32", "#007e3a"]);
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w * 0.33, h);
      return;
    case "pt":
      paintV(ctx, w, h, ["#006600", "#ff0000"]);
      return;
    case "om":
      paintH(ctx, w, h, [W, "#d81010", "#008000"]);
      ctx.fillStyle = "#d81010";
      ctx.fillRect(0, 0, w * 0.28, h);
      return;
    case "qa":
      ctx.fillStyle = "#8d1b3d";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w * 0.32, h);
      return;
    case "bh":
      ctx.fillStyle = "#ce1126";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w * 0.28, h);
      return;
    case "jm":
      ctx.fillStyle = "#009b3a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = K;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.5, h * 0.5);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w * 0.5, h * 0.5);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fed100";
      ctx.lineWidth = h * 0.12;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, h);
      ctx.moveTo(w, 0);
      ctx.lineTo(0, h);
      ctx.stroke();
      return;
    case "tt":
      ctx.fillStyle = "#ce1126";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = W;
      ctx.lineWidth = h * 0.22;
      ctx.beginPath();
      ctx.moveTo(w * 0.05, h);
      ctx.lineTo(w * 0.95, 0);
      ctx.stroke();
      ctx.strokeStyle = K;
      ctx.lineWidth = h * 0.12;
      ctx.stroke();
      return;
    case "tz":
      ctx.fillStyle = "#1eb53a";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#00a3dd";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fcd116";
      ctx.lineWidth = h * 0.22;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.stroke();
      ctx.strokeStyle = K;
      ctx.lineWidth = h * 0.12;
      ctx.stroke();
      return;
    case "na":
      ctx.fillStyle = "#003580";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#009543";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = W;
      ctx.lineWidth = h * 0.2;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.stroke();
      ctx.strokeStyle = "#c8102e";
      ctx.lineWidth = h * 0.1;
      ctx.stroke();
      return;
    case "kn":
      ctx.fillStyle = "#009e49";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#c8102e";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffc72c";
      ctx.lineWidth = h * 0.2;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.stroke();
      ctx.strokeStyle = K;
      ctx.lineWidth = h * 0.1;
      ctx.stroke();
      return;
    case "cg":
      ctx.fillStyle = "#009543";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#dc241f";
      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fbde4a";
      ctx.lineWidth = h * 0.22;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.stroke();
      return;
    case "cd":
      ctx.fillStyle = "#007fff";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "#f7d618";
      ctx.lineWidth = h * 0.18;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.stroke();
      ctx.fillStyle = "#ce1021";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h * 0.22);
      ctx.lineTo(w * 0.22, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#f7d618";
      star(ctx, w * 0.16, h * 0.22, h * 0.1);
      return;
    case "gy":
      ctx.fillStyle = "#009e49";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fcd116";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ce1126";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.12);
      ctx.lineTo(w * 0.5, h * 0.5);
      ctx.lineTo(0, h * 0.88);
      ctx.closePath();
      ctx.fill();
      return;
    case "tl":
      ctx.fillStyle = "#dc241f";
      ctx.fillRect(0, 0, w, h);
      paintHoistTriangle(ctx, w, h, "#f8c300");
      ctx.fillStyle = K;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.28, h * 0.5);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      return;
    case "pa":
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#005293";
      ctx.fillRect(0, 0, w * 0.5, h * 0.5);
      ctx.fillStyle = "#d21034";
      ctx.fillRect(w * 0.5, h * 0.5, w * 0.5, h * 0.5);
      ctx.fillStyle = W;
      star(ctx, w * 0.25, h * 0.25, h * 0.1);
      ctx.fillStyle = "#005293";
      star(ctx, w * 0.75, h * 0.75, h * 0.1);
      return;
    case "do":
      paintH(ctx, w, h, ["#002d62", W, "#ce1126"]);
      ctx.fillStyle = W;
      ctx.fillRect(w * 0.42, 0, w * 0.16, h);
      return;
    case "ge":
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(w * 0.42, 0, w * 0.16, h);
      ctx.fillRect(0, h * 0.42, w, h * 0.16);
      return;
    case "to":
      ctx.fillStyle = "#c10000";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w * 0.4, h * 0.5);
      ctx.fillStyle = "#c10000";
      ctx.fillRect(w * 0.16, h * 0.08, w * 0.08, h * 0.34);
      ctx.fillRect(w * 0.08, h * 0.21, w * 0.24, h * 0.08);
      return;
    case "ws":
      ctx.fillStyle = "#ce1126";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#002b7f";
      ctx.fillRect(0, 0, w * 0.5, h * 0.5);
      ctx.fillStyle = W;
      star(ctx, w * 0.18, h * 0.22, h * 0.06);
      star(ctx, w * 0.32, h * 0.16, h * 0.05);
      return;
    case "uy":
      paintH(ctx, w, h, [
        W,
        "#0038a8",
        W,
        "#0038a8",
        W,
        "#0038a8",
        W,
        "#0038a8",
        W,
      ]);
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w * 0.38, h * 0.44);
      ctx.fillStyle = "#fcd116";
      circle(ctx, w * 0.19, h * 0.22, h * 0.1);
      return;
    case "lr":
      paintUSLike(ctx, w, h, 11, "#bf0a30", "#002868");
      return;
    case "my":
      paintUSLike(ctx, w, h, 14, "#cc0000", "#010066");
      return;
    case "tg":
      paintH(ctx, w, h, [
        "#006a4e",
        "#ffce00",
        "#006a4e",
        "#ffce00",
        "#006a4e",
      ]);
      ctx.fillStyle = "#d21034";
      ctx.fillRect(0, 0, w * 0.35, h * 0.6);
      ctx.fillStyle = W;
      star(ctx, w * 0.175, h * 0.3, h * 0.12);
      return;
    case "bd":
      ctx.fillStyle = "#006a4e";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f42a41";
      circle(ctx, w * 0.4, h * 0.5, h * 0.28);
      return;
    case "pw":
      ctx.fillStyle = "#4aadd6";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffde00";
      circle(ctx, w * 0.42, h * 0.5, h * 0.24);
      return;
    case "tn":
      ctx.fillStyle = "#e70013";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      circle(ctx, w * 0.5, h * 0.5, h * 0.28);
      ctx.fillStyle = "#e70013";
      circle(ctx, w * 0.5, h * 0.5, h * 0.2);
      ctx.fillStyle = W;
      circle(ctx, w * 0.54, h * 0.5, h * 0.16);
      ctx.fillStyle = "#e70013";
      star(ctx, w * 0.58, h * 0.5, h * 0.1);
      return;
    case "pk":
      ctx.fillStyle = "#01411c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      ctx.fillRect(0, 0, w * 0.25, h);
      circle(ctx, w * 0.62, h * 0.5, h * 0.2);
      ctx.fillStyle = "#01411c";
      circle(ctx, w * 0.68, h * 0.46, h * 0.16);
      ctx.fillStyle = W;
      star(ctx, w * 0.74, h * 0.4, h * 0.08);
      return;
    case "al":
      ctx.fillStyle = "#e41e20";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = K;
      star(ctx, w * 0.5, h * 0.42, h * 0.16);
      star(ctx, w * 0.5, h * 0.62, h * 0.16);
      return;
    case "mk":
      ctx.fillStyle = "#d20000";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ffe600";
      circle(ctx, w * 0.5, h * 0.5, h * 0.16);
      return;
    case "np":
      ctx.fillStyle = "#dc143c";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#003893";
      ctx.fillRect(0, 0, w * 0.08, h);
      ctx.fillStyle = W;
      star(ctx, w * 0.45, h * 0.32, h * 0.1);
      star(ctx, w * 0.45, h * 0.68, h * 0.1);
      return;
    case "aw":
      ctx.fillStyle = "#3f7eaf";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#f9d536";
      ctx.fillRect(0, h * 0.55, w, h * 0.08);
      ctx.fillRect(0, h * 0.7, w, h * 0.08);
      ctx.fillStyle = "#c8102e";
      star(ctx, w * 0.18, h * 0.28, h * 0.12);
      return;
    case "ba":
      ctx.fillStyle = "#002395";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fcd116";
      ctx.beginPath();
      ctx.moveTo(w * 0.25, 0);
      ctx.lineTo(w * 0.85, 0);
      ctx.lineTo(w * 0.85, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = W;
      for (let i = 0; i < 5; i++) {
        star(ctx, w * 0.42 + i * w * 0.08, h * 0.18 + i * h * 0.16, h * 0.05);
      }
      return;
    case "bw":
      ctx.fillStyle = "#75aadb";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      ctx.fillRect(0, h * 0.38, w, h * 0.24);
      ctx.fillStyle = K;
      ctx.fillRect(0, h * 0.44, w, h * 0.12);
      return;
    case "ag":
      ctx.fillStyle = K;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#0072c6";
      ctx.fillRect(0, h * 0.55, w, h * 0.45);
      ctx.fillStyle = W;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * 0.5, h * 0.35);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ce1126";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * 0.5, h * 0.55);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#fcd116";
      star(ctx, w * 0.5, h * 0.28, h * 0.12);
      return;
    case "bs":
      paintH(ctx, w, h, ["#00abc9", "#fae042", "#00abc9"]);
      paintHoistTriangle(ctx, w, h, K);
      return;
    case "dj":
      paintH(ctx, w, h, ["#6ab2e7", "#12ad2b"]);
      paintHoistTriangle(ctx, w, h, W);
      return;
    case "er":
      paintH(ctx, w, h, ["#43b02a", "#3c8acc"]);
      paintHoistTriangle(ctx, w, h, "#e93821");
      return;
    case "gq":
      paintH(ctx, w, h, ["#3e9a00", W, "#e32118"]);
      paintHoistTriangle(ctx, w, h, "#0073ce");
      return;
    case "gw":
      paintH(ctx, w, h, ["#fcd116", "#009e49"]);
      ctx.fillStyle = "#ce1126";
      ctx.fillRect(0, 0, w * 0.35, h);
      ctx.fillStyle = K;
      star(ctx, w * 0.175, h * 0.5, h * 0.12);
      return;
    case "mz":
      paintH(ctx, w, h, ["#007168", K, "#fce100"]);
      paintHoistTriangle(ctx, w, h, "#d21034");
      return;
    case "zw":
      paintH(ctx, w, h, [
        "#006400",
        "#ffd200",
        "#ce1126",
        W,
        "#ce1126",
        "#ffd200",
        "#006400",
      ]);
      paintHoistTriangle(ctx, w, h, K);
      return;
    case "vu":
      paintH(ctx, w, h, ["#d21034", "#009543"]);
      paintHoistTriangle(ctx, w, h, K);
      return;
    case "sc":
      ctx.fillStyle = "#003d88";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fcd856";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * 0.4, 0);
      ctx.lineTo(w * 0.7, 0);
      ctx.lineTo(0, h);
      ctx.fill();
      ctx.fillStyle = "#d22730";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w * 0.7, 0);
      ctx.lineTo(w, 0);
      ctx.lineTo(0, h);
      ctx.fill();
      ctx.fillStyle = W;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h * 0.5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#007a3d";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, h * 0.5);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      return;
    case "sb":
      ctx.fillStyle = "#0051ba";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#215b33";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#fcd116";
      ctx.lineWidth = h * 0.1;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.stroke();
      return;
    case "pg":
      ctx.fillStyle = K;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#ce1126";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, 0);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = W;
      star(ctx, w * 0.22, h * 0.28, h * 0.08);
      ctx.fillStyle = "#fcd116";
      star(ctx, w * 0.72, h * 0.68, h * 0.1);
      return;
    case "mh":
      ctx.fillStyle = "#0033a0";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = W;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, h * 0.55);
      ctx.lineTo(w, h * 0.7);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e57200";
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(w, h * 0.7);
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
      return;
    case "lk":
      ctx.fillStyle = "#ffbe29";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#00534e";
      ctx.fillRect(w * 0.08, 0, w * 0.14, h);
      ctx.fillStyle = "#8d153a";
      ctx.fillRect(w * 0.22, 0, w * 0.14, h);
      ctx.fillStyle = "#eb7400";
      ctx.fillRect(w * 0.4, h * 0.08, w * 0.52, h * 0.84);
      return;
    case "bn":
      ctx.fillStyle = "#f7e017";
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = W;
      ctx.lineWidth = h * 0.18;
      ctx.beginPath();
      ctx.moveTo(0, h * 0.62);
      ctx.lineTo(w, h * 0.38);
      ctx.stroke();
      ctx.strokeStyle = K;
      ctx.lineWidth = h * 0.12;
      ctx.stroke();
      return;
    case "dm":
      ctx.fillStyle = "#006b3f";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#fcd116";
      ctx.fillRect(w * 0.42, 0, w * 0.16, h);
      ctx.fillRect(0, h * 0.42, w, h * 0.16);
      ctx.fillStyle = K;
      ctx.fillRect(w * 0.46, 0, w * 0.08, h);
      ctx.fillRect(0, h * 0.46, w, h * 0.08);
      return;
    case "gd":
      ctx.fillStyle = "#ce1126";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#007a5e";
      ctx.fillRect(w * 0.08, h * 0.12, w * 0.84, h * 0.76);
      ctx.fillStyle = "#fcd116";
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.12);
      ctx.lineTo(w * 0.92, h * 0.5);
      ctx.lineTo(w * 0.5, h * 0.88);
      ctx.lineTo(w * 0.08, h * 0.5);
      ctx.closePath();
      ctx.fill();
      return;
    case "mv":
      ctx.fillStyle = "#d21034";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#007e3a";
      ctx.fillRect(w * 0.22, h * 0.22, w * 0.56, h * 0.56);
      ctx.fillStyle = W;
      circle(ctx, w * 0.54, h * 0.5, h * 0.16);
      ctx.fillStyle = "#007e3a";
      circle(ctx, w * 0.58, h * 0.5, h * 0.13);
      return;
    default:
      paintUnknown(ctx, w, h, code);
  }
}

function paintHoistTriangle(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w * 0.42, h * 0.5);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();
}

function paintUS(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const stripes = 13;
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#b22234" : W;
    ctx.fillRect(0, (h * i) / stripes, w, h / stripes + 1);
  }
  const cw = w * 0.4;
  const ch = (h * 7) / 13;
  ctx.fillStyle = "#3c3b6e";
  ctx.fillRect(0, 0, cw, ch);
  ctx.fillStyle = W;
  const rows = 9;
  const cols = 11;
  for (let r = 0; r < rows; r++) {
    const n = r % 2 === 0 ? 6 : 5;
    const y = (ch * (r + 1)) / (rows + 1);
    for (let c = 0; c < n; c++) {
      const x = (cw * (c + (r % 2 === 0 ? 1 : 1.5))) / (cols / 2 + 1);
      star(ctx, x, y, h * 0.018);
    }
  }
}

function paintUSLike(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  stripes: number,
  red: string,
  blue: string,
) {
  for (let i = 0; i < stripes; i++) {
    ctx.fillStyle = i % 2 === 0 ? red : W;
    ctx.fillRect(0, (h * i) / stripes, w, h / stripes + 1);
  }
  ctx.fillStyle = blue;
  ctx.fillRect(0, 0, w * 0.4, (h * Math.ceil(stripes / 2)) / stripes);
}

function paintGB(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#012169";
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = W;
  ctx.lineWidth = h * 0.2;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, h);
  ctx.moveTo(w, 0);
  ctx.lineTo(0, h);
  ctx.stroke();
  ctx.strokeStyle = "#c8102e";
  ctx.lineWidth = h * 0.08;
  ctx.stroke();
  ctx.strokeStyle = W;
  ctx.lineWidth = h * 0.28;
  ctx.beginPath();
  ctx.moveTo(w / 2, 0);
  ctx.lineTo(w / 2, h);
  ctx.moveTo(0, h / 2);
  ctx.lineTo(w, h / 2);
  ctx.stroke();
  ctx.strokeStyle = "#c8102e";
  ctx.lineWidth = h * 0.14;
  ctx.stroke();
}

function paintGR(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const n = 9;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i % 2 === 0 ? "#0d5eaf" : W;
    ctx.fillRect(0, (h * i) / n, w, h / n + 1);
  }
  ctx.fillStyle = "#0d5eaf";
  ctx.fillRect(0, 0, w * 0.38, (h * 5) / n);
  ctx.fillStyle = W;
  ctx.fillRect(w * 0.16, 0, w * 0.06, (h * 5) / n);
  ctx.fillRect(0, h * 0.18, w * 0.38, h * 0.08);
}

function paintZA(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = "#de3831";
  ctx.fillRect(0, 0, w, h * 0.5);
  ctx.fillStyle = "#002395";
  ctx.fillRect(0, h * 0.5, w, h * 0.5);
  ctx.fillStyle = W;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.12);
  ctx.lineTo(w * 0.42, h * 0.5);
  ctx.lineTo(0, h * 0.88);
  ctx.closePath();
  ctx.fill();
  ctx.fillRect(w * 0.28, h * 0.38, w * 0.72, h * 0.24);
  ctx.fillStyle = "#007a4d";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.22);
  ctx.lineTo(w * 0.34, h * 0.5);
  ctx.lineTo(0, h * 0.78);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffb612";
  ctx.beginPath();
  ctx.moveTo(0, h * 0.32);
  ctx.lineTo(w * 0.24, h * 0.5);
  ctx.lineTo(0, h * 0.68);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = K;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.38);
  ctx.lineTo(w * 0.18, h * 0.5);
  ctx.lineTo(0, h * 0.62);
  ctx.closePath();
  ctx.fill();
}
