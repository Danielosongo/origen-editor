"""Transcribe un clip con faster-whisper (español, timestamps por palabra).
Escribe transcript.json (palabras) y transcript.srt (para importar en HyperFrames).

Uso:
    python scripts/transcribe.py "projects/<job>/raw/<clip>" --out "projects/<job>" --model small --lang es

Modelos: tiny | base | small (def) | medium | large-v3  (más grande = mejor pero más RAM).
Este PC va justo de RAM: 'small' int8 es el equilibrio; sube a 'medium' si tienes margen.
"""
import argparse, json, os, sys

def fmt_ts(t):
    h = int(t // 3600); m = int((t % 3600) // 60); s = t % 60
    return f"{h:02d}:{m:02d}:{s:06.3f}".replace(".", ",")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input")
    ap.add_argument("--out", default=".")
    ap.add_argument("--model", default="small")
    ap.add_argument("--lang", default="es")
    a = ap.parse_args()

    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("Falta faster-whisper:  pip install faster-whisper")

    print(f"[transcribe] modelo={a.model} lang={a.lang} (CPU int8)")
    model = WhisperModel(a.model, device="cpu", compute_type="int8")
    segments, info = model.transcribe(a.input, language=a.lang, word_timestamps=True, vad_filter=True)

    words, srt_cues, full = [], [], []
    for seg in segments:
        full.append(seg.text.strip())
        for w in (seg.words or []):
            words.append({"start": round(w.start, 3), "end": round(w.end, 3), "word": w.word.strip()})
        srt_cues.append((seg.start, seg.end, seg.text.strip()))

    os.makedirs(a.out, exist_ok=True)
    with open(os.path.join(a.out, "transcript.json"), "w", encoding="utf-8") as f:
        json.dump({"language": info.language, "duration": info.duration,
                   "text": " ".join(full), "words": words}, f, ensure_ascii=False, indent=2)
    with open(os.path.join(a.out, "transcript.srt"), "w", encoding="utf-8") as f:
        for i, (st, en, tx) in enumerate(srt_cues, 1):
            f.write(f"{i}\n{fmt_ts(st)} --> {fmt_ts(en)}\n{tx}\n\n")

    print(f"[transcribe] OK  {len(words)} palabras · duración ~{info.duration:.1f}s")
    print(f"             -> {os.path.join(a.out, 'transcript.json')}")
    print(f"             -> {os.path.join(a.out, 'transcript.srt')}  (importar en HyperFrames)")

if __name__ == "__main__":
    main()
