// RENDER DE PARIDAD — captura EXACTAMENTE lo que muestra el CRM (vídeo + transiciones + zoom +
// animaciones + subtítulos + b-roll, todo junto), fotograma a fotograma. Es tu preview grabado:
// no recompone por capas, así que sale idéntico a como lo dejaste (mismo segundo, mismos efectos).
// El vídeo base debe ser H.264 (el navegador NO decodifica HEVC) — exportar.mjs lo transcodifica.
// Env: EF_PROJECT, EF_BASE_URL (file:// del base H.264), EF_AUDIO, EF_W, EF_H, EF_FPS, [EF_START].
const puppeteer = require("puppeteer-core");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Chrome del sistema (mismo que HyperFrames). Windows típico por defecto.
const CHROME = process.env.HYPERFRAMES_BROWSER_PATH || process.env.EF_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
// El editor visual vive junto a esta carpeta: ../editor-visual/index.html
const EDITOR = "file:///" + path.resolve(__dirname, "..", "editor-visual", "index.html").replace(/\\/g, "/").replace(/ /g, "%20");
const PROJECT = JSON.parse(fs.readFileSync(process.env.EF_PROJECT, "utf8"));
PROJECT._v = 7;
const BASE_URL = process.env.EF_BASE_URL;
const ORIG_AUDIO = process.env.EF_AUDIO;
const W = +(process.env.EF_W || 3840), H = +(process.env.EF_H || 2160), FPS = +(process.env.EF_FPS || 30);
const LIMIT = parseFloat(process.argv[2] || "0");
const START = parseFloat(process.env.EF_START || "0");
const OUT = process.argv[3];
const DUR = LIMIT > 0 ? Math.min(START + LIMIT, PROJECT.duration) : PROJECT.duration;
const TOTAL = Math.round((DUR - START) * FPS);

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new",
    args: ["--no-sandbox", "--allow-file-access-from-files", "--disable-web-security", "--force-color-profile=srgb", "--autoplay-policy=no-user-gesture-required"] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument((proj) => { try { localStorage.setItem("editor-fantasma", JSON.stringify(proj)); } catch (e) {} }, PROJECT);
  await page.goto(EDITOR, { waitUntil: "load" });
  await new Promise(r => setTimeout(r, 1200));
  const CSS = "html,body,.app,.main,.col,.col.stage,.stage-wrap{background:#000!important} " +
    ".main{grid-template-columns:0 1fr 0 !important} .col.bin,.col.insp,header,.transport,.tl{display:none!important} " +
    ".stage-wrap{padding:0!important} .stage-wrap::before{display:none!important} " +
    "#monitor{position:fixed!important;left:0!important;top:0!important;width:" + W + "px!important;height:" + H + "px!important;border-radius:0!important;box-shadow:none!important;outline:none!important;z-index:2147483000!important;margin:0!important} " +
    "#video{opacity:1!important} " +   // el vídeo SE VE: capturamos el monitor entero (vídeo + efectos + gráficos)
    "#dropmsg,#guideV,#guideH,.snapline,.playhead,#toast{display:none!important} .ov .rh{display:none!important}";
  await page.evaluate(async (BASE, css) => {
    reviewMode = false; try { playing = false; } catch (e) {}
    try { await new Promise((res) => { video.onloadeddata = () => res(); video.src = BASE; video.load(); setTimeout(res, 10000); }); } catch (e) {}
    try { video.pause(); } catch (e) {}
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    if (typeof renderAll === "function") renderAll();
  }, BASE_URL, CSS);
  await new Promise(r => setTimeout(r, 400));

  const ff = spawn("ffmpeg", ["-y",
    "-f", "image2pipe", "-framerate", String(FPS), "-i", "-",
    "-i", ORIG_AUDIO,
    "-map", "0:v", "-map", "1:a:0", "-r", String(FPS),
    "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
    "-c:v", "libx264", "-preset", "medium", "-crf", "16",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
    "-c:a", "aac", "-b:a", "192k", "-shortest", OUT], { stdio: ["pipe", "inherit", "inherit"] });

  for (let f = 0; f < TOTAL; f++) {
    const t = START + f / FPS;
    await page.evaluate(async (t) => {
      const v = video;
      await new Promise((res) => { let d = false; const fin = () => { if (!d) { d = true; res(); } }; v.onseeked = fin; try { v.currentTime = t; } catch (e) { fin(); } setTimeout(fin, 2500); });
      tlTime = t; try { playing = false; } catch (e) {}
      curRange = (typeof rangeAt === "function") ? rangeAt(t) : null;
      renderOverlays();   // reposiciona overlays, transforma el vídeo (zoom/flash) y hace seek del b-roll
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    }, t);
    await new Promise(r => setTimeout(r, 45));   // deja decodificar el frame del b-roll/vídeo antes de capturar
    const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H }, type: "png" });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (f % 60 === 0) process.stdout.write(`\rframe ${f}/${TOTAL} (${t.toFixed(1)}s)   `);
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();
  console.log("\nOK -> " + OUT);
})().catch(e => { console.error(e); process.exit(1); });
