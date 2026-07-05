// EXPORT DE 1 CLIC — del proyecto del CRM al MP4 final, automático, FIEL y portable:
//   base por videoName -> base todo-keyframes (cache, color NEUTRO) -> render-fast (animaciones) -> mezcla SFX -> Guardado en disco
// Uso: node exportar-rapido.mjs <proyecto.json> [salida.mp4]
import fs from "fs";
import os from "os";
import path from "path";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DL = path.join(process.env.USERPROFILE || os.homedir(), "Downloads");

const PROJ = process.argv[2];
if (!PROJ || !fs.existsSync(PROJ)) { console.error("Falta el proyecto:", PROJ); process.exit(1); }
const p = JSON.parse(fs.readFileSync(PROJ, "utf8"));
const run = (cmd, args, env) => { const r = spawnSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...env } }); if (r.status) { console.error("Falló:", cmd, args[0]); process.exit(r.status); } };
const probe = (f, s) => spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=" + s, "-of", "default=nw=1:nk=1", f], { encoding: "utf8" }).stdout.trim();

// 1) localizar el VÍDEO BASE por su nombre (el que importaste al CRM)
const vn = p.videoName || "";
const cfg = (() => { try { return JSON.parse(fs.readFileSync(path.join(os.homedir(), ".origen-editor.json"), "utf8")); } catch { return {}; } })();
const stem = vn.replace(/\.[^.]+$/, "");
const dirs = [DL, path.dirname(path.resolve(PROJ)), cfg.watchDir].filter(Boolean);
let SRC = null;
for (const dir of dirs) { const f = path.join(dir, vn); if (fs.existsSync(f)) { SRC = f; break; } }   // 1) nombre exacto
if (!SRC && stem) {                                                                                    // 2) parecido (mismo stem); prefiere NEUTRO, luego más reciente
  let matches = [];
  for (const dir of dirs) { let l = []; try { l = fs.readdirSync(dir); } catch {} for (const f of l) if (/\.(mp4|mov|mkv|webm)$/i.test(f) && f.replace(/\.[^.]+$/, "").startsWith(stem)) matches.push(path.join(dir, f)); }
  matches.sort((a, b) => (/NEUTRO/i.test(b) ? 1 : 0) - (/NEUTRO/i.test(a) ? 1 : 0) || fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (matches.length) SRC = matches[0];
}
if (!SRC && cfg.original && fs.existsSync(cfg.original)) SRC = cfg.original;                             // 3) fallback config
if (!SRC) { console.error("No encuentro el vídeo base para:", vn, "en", dirs); process.exit(1); }
console.log("[export] base:", SRC);

const W = +probe(SRC, "width") || 1920, H = +probe(SRC, "height") || 1080;
const fpsRaw = probe(SRC, "r_frame_rate") || "30/1";
const FPS = Math.round(eval(fpsRaw.replace("/", "*1.0/"))) || 30;

// 2) base TODO-KEYFRAMES (seek instantáneo) — con CACHÉ por mtime del origen. Color NEUTRO bt709.
const cacheDir = path.join(__dirname, "comp"); fs.mkdirSync(cacheDir, { recursive: true });
const baseIntra = path.join(cacheDir, "base-intra.mp4");
const srcMtime = fs.statSync(SRC).mtimeMs;
const needBuild = !fs.existsSync(baseIntra) || !fs.existsSync(baseIntra + ".src") || fs.readFileSync(baseIntra + ".src", "utf8") !== SRC + ":" + srcMtime;
if (needBuild) {
  console.log(`[export] preparando base todo-keyframes ${W}x${H}@${FPS} (una vez por vídeo)...`);
  run("ffmpeg", ["-y", "-i", SRC, "-an", "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast", "-crf", "10", "-g", "1", "-keyint_min", "1", "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv", baseIntra]);
  fs.writeFileSync(baseIntra + ".src", SRC + ":" + srcMtime);
} else console.log("[export] base todo-keyframes en caché ✓");
const baseUrl = "file:///" + baseIntra.replace(/\\/g, "/").replace(/ /g, "%20");

// 3) proyecto con _t alto (que el render no lo pise con IndexedDB)
p._t = 9e15; p._v = 7;
const projTmp = path.join(__dirname, "proyecto-export.json");
fs.writeFileSync(projTmp, JSON.stringify(p));

// 4) SFX derivados del proyecto (fiel, no inventa)
const SFX_FILES = { whoosh: "swoosh.mp3", pop: "pop.mp3", tick: "click.mp3", ding: "correcto.mp3", snap: "chasquido.mp3", error: "error.mp3", boom: "impacto.mp3", rafaga: "rafaga.mp3" };
const ev = (p.clips || []).filter(c => c.sfx && c.sfx !== "none" && SFX_FILES[c.sfx]).map(c => ({ file: SFX_FILES[c.sfx], t: +c.start || 0, vol: c.sfxVol == null ? 1 : c.sfxVol })).sort((a, b) => a.t - b.t);
fs.writeFileSync(path.join(__dirname, "sfx-events.json"), JSON.stringify(ev));
console.log("[export] SFX:", ev.length);

// 5) render (color neutro + animaciones + voz opcional) -> tmp -> mezcla SFX -> final
const outName = (vn.replace(/\.[^.]+$/, "") || "video") + "-FINAL.mp4";
const OUT = process.argv[3] || path.join(cfg.outDir || DL, outName);
const tmp = OUT.replace(/\.mp4$/i, "") + "-tmp.mp4";
run("node", [path.join(__dirname, "render-fast.cjs"), "0", tmp], { EF_PROJECT: projTmp, EF_BASE_URL: baseUrl, EF_AUDIO: SRC, EF_W: String(W), EF_H: String(H), EF_FPS: String(FPS), EF_MUTE_VOICE: p.voiceMuted ? "1" : "0" });
run("node", [path.join(__dirname, "mix-sfx.js"), tmp, OUT]);
try { fs.unlinkSync(tmp); } catch {}
// Graba el montaje como "Guardado" en disco (permanente): el botón Guardado lo cargará aunque se limpie el navegador
try {
  const ov = (p.clips || []).filter(c => c.type === "ov");
  const gp = path.resolve(__dirname, "..", "editor-visual", "claude-pase.js");
  fs.writeFileSync(gp, "window.EF_CLAUDE = " + JSON.stringify({ clips: ov, markers: (p.markers || []) }) + ";\n");
  console.log("[export] Guardado en disco actualizado:", ov.length, "gráficos");
} catch (e) {}
console.log("\n✅ LISTO (color neutro + animaciones + sonidos) ->", OUT);
