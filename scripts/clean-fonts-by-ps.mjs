import fs from "fs";
import path from "path";
import url from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fontkit = require("fontkit");

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const fontsFile = process.argv.find(a=>a.startsWith("--fonts-file="))?.split("=")[1] || "src/generated/fonts.ts";
const fontsDir  = process.argv.find(a=>a.startsWith("--fonts-dir=")) ?.split("=")[1] || "assets/fonts";
const dry   = process.argv.includes("--dry");
const trash = process.argv.includes("--trash");

const norm = s => (s||"").toLowerCase().replace(/[^a-z0-9]+/g,"");
const toks = s => norm(s).split(/(?=[a-z])/).filter(Boolean);

const tsPath = path.resolve(__dirname, "..", fontsFile);
const ts = fs.readFileSync(tsPath, "utf8");
// pega tanto name quanto postscriptName
const rePS = /postscriptName"\s*:\s*"([^"]+)"/g;
const reNM = /name"\s*:\s*"([^"]+)"/g;
const allow = new Set();
let m;
while ((m = rePS.exec(ts)) !== null) allow.add(m[1]);
while ((m = reNM.exec(ts)) !== null) allow.add(m[1]);

if (!allow.size) { console.error("Whitelist vazia:", tsPath); process.exit(1); }

const allowNorm = new Set([...allow].map(norm));

const dir = path.resolve(__dirname, "..", fontsDir);
if (!fs.existsSync(dir)) { console.error("Diretório não existe:", dir); process.exit(1); }

const exts = new Set([".ttf",".otf",".ttc",".otc",".woff",".woff2"]);
const files = fs.readdirSync(dir).filter(f => exts.has(path.extname(f).toLowerCase()));

const keep = [], remove = [], report = [];
for (const file of files) {
  const fp = path.join(dir, file);
  const base = path.basename(file, path.extname(file));
  const baseN = norm(base);

  let ps = [];
  try {
    const f = fontkit.openSync(fp);
    ps = f.fonts ? f.fonts.map(ff => ff.postscriptName || ff.fullName || "") : [f.postscriptName || f.fullName || ""];
  } catch { /* ignora, tenta por nome de arquivo */ }

  const psNorm = ps.map(norm).filter(Boolean);
  const candidates = new Set([baseN, ...psNorm]);

  // match 1: igualdade exata
  let match = [...candidates].some(c => allowNorm.has(c));
  // match 2: substring tolerante
  if (!match) {
    match = [...candidates].some(c => [...allowNorm].some(a => c.includes(a) || a.includes(c)));
  }

  (match ? keep : remove).push(file);
  report.push({ file, ps: ps.join("|"), match });
}

if (dry) {
  console.log("DRY RUN");
  console.log("Manter:", keep.length, keep);
  console.log("Remover:", remove.length, remove);
  // relatório simples
  fs.writeFileSync(path.join(dir,"__clean-report.json"), JSON.stringify(report,null,2));
  process.exit(0);
}

if (trash) {
  const td = path.join(dir, "__trash_" + Date.now());
  fs.mkdirSync(td, { recursive: true });
  for (const f of remove) fs.renameSync(path.join(dir,f), path.join(td,f));
  console.log("Movidos para", td, "=>", remove.length);
} else {
  for (const f of remove) fs.unlinkSync(path.join(dir,f));
  console.log("Removidos:", remove.length);
}
console.log("Mantidos:", keep.length);
