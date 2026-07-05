// RENDER RÁPIDO (JPEG + base todo-keyframes) — captura el CRM frame a frame, portable.
// Color NEUTRO bt709, animaciones CSS en su fase exacta, y voz opcional (EF_MUTE_VOICE=1 → mudo).
// Env: EF_PROJECT, EF_BASE_URL (base H.264 todo-keyframes), EF_AUDIO, EF_W, EF_H, EF_FPS, EF_MUTE_VOICE.
const puppeteer = require("puppeteer-core");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const CHROME = process.env.HYPERFRAMES_BROWSER_PATH || process.env.EF_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const EDITOR = "file:///" + path.resolve(__dirname, "..", "editor-visual", "index.html").replace(/\\/g, "/").replace(/ /g, "%20");
const PROJECT = JSON.parse(fs.readFileSync(process.env.EF_PROJECT, "utf8"));
PROJECT._v = 7;
const BASE_URL = process.env.EF_BASE_URL;
const ORIG_AUDIO = process.env.EF_AUDIO;
const W = +(process.env.EF_W || 3840), H = +(process.env.EF_H || 2160), FPS = +(process.env.EF_FPS || 30);
const LIMIT = parseFloat(process.argv[2] || "0");
const OUT = process.argv[3] || path.join(os.homedir(), "Downloads", "VIDEO-FINAL-tmp.mp4");
const DUR = LIMIT > 0 ? Math.min(LIMIT, PROJECT.duration) : PROJECT.duration;
const TOTAL = Math.round(DUR * FPS);
(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: "new",
    args: ["--no-sandbox","--allow-file-access-from-files","--disable-web-security","--force-color-profile=srgb","--autoplay-policy=no-user-gesture-required"] });
  const page = await browser.newPage();
  await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument((proj) => { try { localStorage.setItem("editor-fantasma", JSON.stringify(proj)); } catch(e){} }, PROJECT);
  await page.goto(EDITOR, { waitUntil: "load" });
  await new Promise(r => setTimeout(r, 1000));
  const CSS = "html,body,.app,.main,.col,.col.stage,.stage-wrap{background:#000!important} " +
    ".main{grid-template-columns:0 1fr 0 !important} .col.bin,.col.insp,header,.transport,.tl{display:none!important} " +
    ".stage-wrap{padding:0!important} .stage-wrap::before{display:none!important} " +
    "#monitor{position:fixed!important;left:0!important;top:0!important;width:"+W+"px!important;height:"+H+"px!important;border-radius:0!important;box-shadow:none!important;outline:none!important;z-index:2147483000!important;margin:0!important} " +
    "#video{opacity:1!important} #dropmsg,#guideV,#guideH,.snapline,.playhead,#toast{display:none!important} .ov .rh{display:none!important}";
  await page.evaluate(async (BASE, css) => {
    reviewMode = false; try { playing = false; } catch(e){}
    try { await new Promise((res) => { video.onloadeddata = () => res(); video.src = BASE; video.load(); setTimeout(res, 10000); }); } catch(e){}
    try { video.pause(); } catch(e){}
    const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    if (typeof renderAll === "function") renderAll();
  }, BASE_URL, CSS);
  await new Promise(r => setTimeout(r, 400));
  const ff = spawn("ffmpeg", ["-y",
    "-f", "image2pipe", "-vcodec", "mjpeg", "-framerate", String(FPS), "-i", "-",
    ...(process.env.EF_MUTE_VOICE === "1" ? ["-f", "lavfi", "-i", "anullsrc=channel_layout=stereo:sample_rate=48000"] : ["-i", ORIG_AUDIO]),
    "-map", "0:v", "-map", "1:a:0", "-r", String(FPS),
    "-vf", "scale=out_color_matrix=bt709:out_range=tv" + (process.env.EF_SUBS_ASS ? ",ass=" + process.env.EF_SUBS_ASS : "") + ",gradfun=1.5:16,format=yuv420p",   // bt709 + gradfun (anti-banding del degradado)
    "-c:v", "libx264", "-preset", "slow", "-crf", "12",
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
    ...(process.env.EF_MUTE_VOICE === "1" ? ["-c:a", "aac", "-b:a", "192k"] : ["-c:a", "copy"]),
    "-shortest", OUT], { stdio: ["pipe", "inherit", "inherit"] });
  const t0 = Date.now();
  for (let f = 0; f < TOTAL; f++) {
    const t = f / FPS;
    await page.evaluate(async (t) => {
      const v = video;
      await new Promise((res) => { let d=false; const fin=()=>{if(!d){d=true;res();}}; v.onseeked=fin; try{v.currentTime=t;}catch(e){fin();} setTimeout(fin, 2000); });
      tlTime = t; try{playing=false;}catch(e){}
      curRange = (typeof rangeAt==="function") ? rangeAt(t) : null;
      renderOverlays();
      await new Promise(r => requestAnimationFrame(()=>requestAnimationFrame(r)));
      try{ document.getAnimations().forEach(a=>{ try{
        let start=0; const el=a.effect&&a.effect.target;
        if(el&&el.closest){const ov=el.closest('.ov[data-id]'); if(ov){const c=(typeof state!=='undefined'&&state.clips||[]).find(x=>x.id===ov.dataset.id); if(c)start=c.start||0;}}
        const tim=a.effect.getComputedTiming(); const inf=(tim.iterations===Infinity);
        a.pause(); a.currentTime = inf ? (t*1000) : Math.max(0, (t-start)*1000);
      }catch(e){} }); }catch(e){}
      await new Promise(r => requestAnimationFrame(r));
    }, t);
    const buf = await page.screenshot({ clip: { x:0, y:0, width:W, height:H }, type: "jpeg", quality: 100 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if (f % 30 === 0) { const el=(Date.now()-t0)/1000; const spf=el/(f+1); process.stdout.write(`\rframe ${f}/${TOTAL} (${t.toFixed(1)}s) ${spf.toFixed(2)}s/frame eta ${Math.round(spf*(TOTAL-f)/60)}min   `); }
  }
  ff.stdin.end();
  await new Promise(r => ff.on("close", r));
  await browser.close();
  console.log("\nOK -> " + OUT);
})().catch(e => { console.error(e); process.exit(1); });
