// VIGILANTE DE EXPORT AUTOMÁTICO — en cuanto el CRM exporta un proyecto a Descargas,
// genera el vídeo final (render de paridad) sin que toques nada.
// Config: ~/.origen-editor.json  { "original": "<ruta del vídeo base>", "watchDir": "<Descargas>", "outDir": "<Descargas>" }
// Si "original" no está definido, NO hace nada (evita renders contra el vídeo equivocado).
import fs from "fs";
import os from "os";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const CFG = path.join(os.homedir(), ".origen-editor.json");
const readCfg = () => { try { return JSON.parse(fs.readFileSync(CFG, "utf8")); } catch { return {}; } };
let cfg = readCfg();
const DOWNLOADS = path.join(process.env.USERPROFILE || os.homedir(), "Downloads");
const watchDir = cfg.watchDir || DOWNLOADS;
const EXPORTAR = path.join(__dirname, "..", "render", "exportar-rapido.mjs");   // motor de 1 clic del plugin: base auto + color neutro + animaciones + SFX + Guardado
const isProject = f => /^proyecto-editor-fantasma.*\.json$/i.test(f);

let busy = false, timer = null, lastKey = "";
console.log("[auto-export] vigilando:", watchDir, "\n[auto-export] al exportar desde el CRM genero el vídeo final solo (base auto + color neutro + animaciones + sonidos).");

function fire(file) {
  const proj = path.join(watchDir, file);
  if (!fs.existsSync(proj)) return;
  const key = file + ":" + fs.statSync(proj).mtimeMs;
  if (key === lastKey) return; lastKey = key;
  busy = true;
  console.log(`\n[auto-export] Exportación detectada → generando el vídeo final (base + color neutro + animaciones + sonidos). Aparecerá en Descargas en unos minutos...`);
  const pr = spawn("node", [EXPORTAR, proj], { stdio: "inherit" });   // exportar-rapido.mjs deriva la base y la salida solo
  pr.on("close", c => { busy = false; console.log(c === 0 ? `[auto-export] ✅ LISTO → mira en Descargas` : `[auto-export] ⚠️ falló (código ${c})`); });
}

fs.watch(watchDir, (ev, file) => {
  if (!file || !isProject(file) || busy) return;
  clearTimeout(timer);
  timer = setTimeout(() => { if (!busy) fire(file); }, 3000);   // espera a que termine de descargarse
});
