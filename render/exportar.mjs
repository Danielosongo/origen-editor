// MOTOR DE EXPORTACIÓN — de proyecto del CRM a MP4 final IDÉNTICO a tu preview (misma calidad + sonido).
// Uso: node exportar.mjs <proyecto-editor-fantasma.json> <video-original> [salida.mp4]
//   1) transcodifica el original a H.264 (el navegador no decodifica HEVC) conservando resolución/calidad
//   2) render de PARIDAD: captura el monitor del CRM entero (vídeo + transiciones + zoom + animaciones +
//      subtítulos + b-roll) fotograma a fotograma  [render3.js] → sale igual que tu preview
//   3) mezcla los SFX de cada clip a su nivel y remuxa tu audio  [mix-sfx.js]
import { spawnSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PROJ = process.argv[2], SRC = process.argv[3];
const OUT = process.argv[4] || path.join(process.env.USERPROFILE || os.homedir(), "Downloads", "VIDEO-FINAL.mp4");
if (!PROJ || !SRC) { console.error("Uso: node exportar.mjs <proyecto.json> <video-original> [salida.mp4]"); process.exit(1); }
const run = (cmd, args, env) => { const r = spawnSync(cmd, args, { stdio: "inherit", env: { ...process.env, ...env } }); if (r.status) { console.error("Falló:", cmd, args[0]); process.exit(r.status); } return r; };
const probe = (f, s) => spawnSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=" + s, "-of", "default=nw=1:nk=1", f], { encoding: "utf8" }).stdout.trim();

const SFX_FILES = { whoosh:"swoosh.mp3", pop:"pop.mp3", tick:"click.mp3", ding:"correcto.mp3", snap:"chasquido.mp3", error:"error.mp3", boom:"impacto.mp3", rafaga:"rafaga.mp3" };
const p = JSON.parse(fs.readFileSync(PROJ, "utf8"));
const clips = p.clips || [];

const WORK = path.join(os.tmpdir(), "ef-render");
fs.mkdirSync(WORK, { recursive: true });

// 1) SFX de cada clip con sonido → sfx-events.json. Fiel al proyecto, no inventa nada.
const ev = clips.filter(c => c.sfx && c.sfx !== "none" && SFX_FILES[c.sfx])
  .map(c => ({ file: SFX_FILES[c.sfx], t: +c.start || 0, vol: c.sfxVol == null ? 1 : c.sfxVol }))
  .sort((a, b) => a.t - b.t);
const events = path.join(WORK, "sfx-events.json");
fs.writeFileSync(events, JSON.stringify(ev));
console.log("SFX derivados del proyecto:", ev.length);

// 2) base H.264 (para que el navegador la pinte) — conserva resolución y calidad del original
const W = +probe(SRC, "width") || 1920, H = +probe(SRC, "height") || 1080;
const fpsRaw = probe(SRC, "r_frame_rate") || "30/1";
const [fn, fd] = fpsRaw.split("/").map(Number); const FPS = Math.round((fn || 30) / (fd || 1)) || 30;
const base = path.join(WORK, "base_h264.mp4");
console.log(`Transcodificando base H.264 ${W}x${H} @${FPS}...`);
run("ffmpeg", ["-y", "-i", SRC, "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", base]);
const baseUrl = "file:///" + base.replace(/\\/g, "/").replace(/ /g, "%20");

// 3) render de paridad (captura el CRM entero) → tmp
const tmp = OUT.replace(/\.mp4$/i, "") + "-tmp.mp4";
run("node", [path.join(__dirname, "render3.js"), "0", tmp], { EF_PROJECT: PROJ, EF_BASE_URL: baseUrl, EF_AUDIO: SRC, EF_W: W, EF_H: H, EF_FPS: FPS });

// 4) mezclar SFX a su nivel + remux del audio → final
run("node", [path.join(__dirname, "mix-sfx.js"), tmp, OUT, events]);
try { fs.unlinkSync(tmp); } catch {}
console.log("\n✅ LISTO (idéntico al preview) ->", OUT);
