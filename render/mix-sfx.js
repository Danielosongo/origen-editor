// Mezcla los SFX del montaje sobre el audio del vídeo renderizado.
// Fuerza estéreo + 48kHz en todo (evita que amix deje los SFX mono casi inaudibles) y ajusta su nivel.
// Uso: node mix-sfx.js <video-in> <video-out> [sfx-events.json]
const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const IN = process.argv[2];
const OUT = process.argv[3];
const EVENTS = process.argv[4] || process.env.EF_EVENTS || path.join(__dirname, "sfx-events.json");
const SFXDIR = process.env.EF_SFXDIR || path.resolve(__dirname, "..", "editor-visual", "sfx");
const BASE = 1.1;                                          // nivel general de los SFX (se oyen sin pasarse)
const PERFILE = { "correcto.mp3": 0.72, "pop.mp3": 0.72 };  // 'bien hecho' y pop, un poco más bajos
const ev = JSON.parse(fs.readFileSync(EVENTS, "utf8"));

if (ev.length === 0) {   // sin SFX -> copia vídeo y audio SIN re-codificar (calidad intacta)
  const r0 = spawnSync("ffmpeg", ["-y", "-i", IN, "-c", "copy", OUT], { stdio: ["ignore", "inherit", "inherit"] });
  console.log("Sin SFX: audio copiado sin pérdida ->", OUT);
  process.exit(r0.status || 0);
}

const args = ["-y", "-i", IN];
ev.forEach(e => { args.push("-i", path.join(SFXDIR, e.file)); });

let fc = "[0:a]aformat=sample_rates=48000:channel_layouts=stereo[a0];";
const labels = ["[a0]"];
ev.forEach((e, i) => {
  const ms = Math.max(0, Math.round(e.t * 1000));
  const mult = PERFILE[e.file] != null ? PERFILE[e.file] : BASE;
  const vol = ((e.vol == null ? 1 : e.vol) * mult).toFixed(2);
  fc += `[${i + 1}:a]adelay=${ms}:all=1,aformat=sample_rates=48000:channel_layouts=stereo,volume=${vol}[s${i}];`;
  labels.push(`[s${i}]`);
});
fc += `${labels.join("")}amix=inputs=${ev.length + 1}:normalize=0:duration=first,alimiter=limit=0.97[a]`;

args.push("-filter_complex", fc, "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", OUT);
console.log("SFX a mezclar:", ev.length, "(nivel " + BASE + ", correcto/pop " + PERFILE["pop.mp3"] + ", estéreo 48k)");
const r = spawnSync("ffmpeg", args, { stdio: ["ignore", "inherit", "inherit"] });
process.exit(r.status || 0);
