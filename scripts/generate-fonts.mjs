import fs from "fs";
import path from "path";
import url from "url";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fontkit = require("fontkit");

// paths
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const FONTS_DIR = process.argv.find(a=>a.startsWith("--fonts-dir="))?.split("=")[1] || "assets/fonts";
const OUT_FILE  = process.argv.find(a=>a.startsWith("--out="))?.split("=")[1] || "src/generated/fonts.ts";

// util
const exts = new Set([".ttf",".otf",".ttc",".otc",".woff",".woff2"]);
const norm = s => (s||"").toLowerCase().replace(/\s+/g," ").trim();

// scan
const dir = path.resolve(__dirname, "..", FONTS_DIR);
if (!fs.existsSync(dir)) {
  console.error("Diretório não existe:", dir);
  process.exit(1);
}
const files = fs.readdirSync(dir).filter(f => exts.has(path.extname(f).toLowerCase()));
if (!files.length) {
  console.error("Nenhuma fonte encontrada em", dir);
  process.exit(1);
}

// coleta meta -> [{name, postscriptName}]
const entries = [];
for (const file of files) {
  const fp = path.join(dir, file);
  try {
    const f = fontkit.openSync(fp);
    const faces = f.fonts ? f.fonts : [f]; // TTC/OTC vs TTF/OTF/WOFF
    for (const face of faces) {
      const ps = face.postscriptName || face.fullName || path.basename(file, path.extname(file));
      // nome legível: tente fullName; senão derive do filename
      const readable =
        face.fullName ||
        path.basename(file, path.extname(file)).replace(/[-_]+/g, " ");
      entries.push({
        name: readable,
        postscriptName: ps
      });
    }
  } catch (e) {
    // fallback: se não deu pra abrir, derive do nome do arquivo
    const base = path.basename(file, path.extname(file));
    entries.push({ name: base.replace(/[-_]+/g," "), postscriptName: base });
  }
}

// dedup por postscriptName
const seen = new Set();
const unique = [];
for (const it of entries) {
  const key = norm(it.postscriptName);
  if (key && !seen.has(key)) {
    seen.add(key);
    unique.push({
      name: it.name.trim(),
      postscriptName: it.postscriptName.trim()
    });
  }
}

// ordena por name asc, estável
unique.sort((a,b) => a.name.localeCompare(b.name, "pt-BR", { sensitivity:"base" }));

// sempre inclui "Padrão / System" no topo
const finalList = [
  { name: "Padrão", postscriptName: "System" },
  ...unique
];

// monta TS
const header = `// ATENÇÃO: Este arquivo foi gerado automaticamente. Não edite manualmente.
// Rode \`npm run generate-fonts\` para atualizar.

export interface FontOption {
  name: string;
  postscriptName: string;
}

export const AVAILABLE_FONTS: FontOption[] = `;
const body = JSON.stringify(finalList, null, 2);
const content = `${header}${body};\n`;

// escreve
const outPath = path.resolve(__dirname, "..", OUT_FILE);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, content, "utf8");

console.log(`Gerado ${OUT_FILE} com ${finalList.length} opções.`);
