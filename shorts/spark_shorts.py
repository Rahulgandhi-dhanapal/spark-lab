#!/usr/bin/env python3
"""spark_shorts: turn movie/episode clips into emotion-themed 9:16 Shorts.

Only needs ffmpeg + Python 3 standard library. No AI, no paid tools.
Optional: `pip install faster-whisper` enables `transcribe` (draft subtitles from dialogue).

Usage:
  python3 spark_shorts.py doctor
  python3 spark_shorts.py new <id> --theme breakup --source input/film.mp4
  python3 spark_shorts.py make specs/<id>.json      # or several specs
  python3 spark_shorts.py make --all
  python3 spark_shorts.py transcribe input/film.mp4 --start 120 --end 140
"""
import argparse, csv, datetime, json, random, shutil, subprocess, sys, tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
W, H, FPS = 1080, 1920, 30
AUDIO_EXT = {".mp3", ".wav", ".m4a", ".ogg", ".flac"}
TRACKER_COLS = ["date", "id", "theme", "source", "year", "risk", "music", "duration_s",
                "views", "viewed_pct", "comments", "new_subs", "claim_or_strike", "minutes_spent"]


def run(cmd, quiet=True):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        sys.exit(f"command failed: {' '.join(map(str, cmd))}\n{p.stderr[-1500:]}")
    return p.stdout


def ts(x):
    """'1:02:03.5' | '02:03' | 123.4 -> seconds."""
    if isinstance(x, (int, float)):
        return float(x)
    s = 0.0
    for part in str(x).split(":"):
        s = s * 60 + float(part)
    return s


def probe(path):
    out = run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_type:format=duration",
               "-of", "json", str(path)])
    d = json.loads(out)
    return float(d["format"].get("duration", 0)), any(s["codec_type"] == "audio" for s in d["streams"])


def resolve(p):
    p = Path(p)
    return p if p.is_absolute() else ROOT / p


# ---------- subtitles (ASS) ----------
def ass_time(t):
    h, r = divmod(t, 3600)
    m, s = divmod(r, 60)
    return f"{int(h)}:{int(m):02d}:{s:05.2f}"


def esc(t):
    return t.replace("\\", "").replace("{", "(").replace("}", ")").replace("\n", "\\N")


def build_ass(spec, total, out):
    font = spec.get("font", "Inter")
    hook_len = 2.0 if spec.get("hook") else 0.0
    q_len = 2.5 if spec.get("question") else 0.0
    # subtitles: strings get spread over the body by word count; dicts keep their own times
    subs = spec.get("subtitles", [])
    fixed = [s for s in subs if isinstance(s, dict)]
    auto = [s for s in subs if isinstance(s, str)]
    events = []
    if auto:
        t0, t1 = hook_len, max(hook_len + 1, total - q_len)
        words = [max(1, len(s.split())) for s in auto]
        span = (t1 - t0) / sum(words)
        t = t0
        for s, w in zip(auto, words):
            events.append(("Sub", t, t + w * span, s))
            t += w * span
    for s in fixed:
        events.append(("Sub", ts(s["start"]), ts(s["end"]), s["text"]))
    if spec.get("hook"):
        events.append(("Hook", 0, hook_len, spec["hook"]))
    if spec.get("question"):
        events.append(("Q", total - q_len, total, spec["question"]))
    hdr = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
WrapStyle: 0

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Sub,{font},62,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,5,2,2,70,70,330,1
Style: Hook,{font},78,&H0000E5FF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,6,3,8,70,70,260,1
Style: Q,{font},76,&H0000E5FF,&H000000FF,&H00000000,&H00000000,1,0,0,0,100,100,0,0,3,10,0,5,90,90,0,1

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
"""
    lines = [f"Dialogue: 0,{ass_time(a)},{ass_time(b)},{st},,0,0,0,,{{\\fad(150,150)}}{esc(tx)}"
             for st, a, b, tx in events]
    Path(out).write_text(hdr + "\n".join(lines) + "\n", encoding="utf-8")


# ---------- music ----------
def pick_music(spec):
    m = spec.get("music")
    if m and (resolve("music") / m).exists():
        return resolve("music") / m
    if m and resolve(m).exists():
        return resolve(m)
    mood = (spec.get("mood") or spec.get("theme") or "").lower()
    files = [f for f in (ROOT / "music").iterdir() if f.suffix.lower() in AUDIO_EXT]
    match = [f for f in files if f.name.lower().startswith(mood)] if mood else []
    pool = match or files
    if not pool:
        print("  ! no music found in shorts/music, continuing without music")
        return None
    if not match:
        print(f"  ! no '{mood}_*' track, using a random one")
    return random.choice(pool)


# ---------- video ----------
def scene_filter(i, layout, has_audio, dur):
    if layout == "crop":
        v = f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"
    else:  # "blur": whole frame kept, blurred copy fills the 9:16 canvas
        v = (f"split[a{i}][b{i}];[a{i}]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
             f"boxblur=30:5,eq=brightness=-0.12[bg{i}];[b{i}]scale={W}:-2[fg{i}];"
             f"[bg{i}][fg{i}]overlay=(W-w)/2:(H-h)/2")
    f = f"[{i}:v]{v},fps={FPS},setsar=1,format=yuv420p[v{i}];"
    if has_audio:
        f += f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=0:{dur},asetpts=N/SR/TB[a{i}];"
    else:
        f += f"anullsrc=r=48000:cl=stereo,atrim=0:{dur},asetpts=N/SR/TB[a{i}];"
    return f


def check_spec(spec, durs, strict=False):
    """Originality + copyright-basis warnings. --strict turns them into errors."""
    w = []
    basis = spec.get("copyright_basis", "unknown")
    if basis not in ("public_domain", "licensed"):
        w.append(f"copyright_basis is '{basis}': use public_domain or licensed to minimise claims")
    if not spec.get("take") and not spec.get("voiceover"):
        w.append("no original commentary: add a 'take' (your one-line opinion) or a 'voiceover' file")
    if len([s for s in spec.get("subtitles", [])]) < 2:
        w.append("fewer than 2 story subtitles: shorts that only show clips risk 'reused content'")
    if not spec.get("question"):
        w.append("no end question")
    if max(durs) > 8:
        w.append(f"longest scene is {max(durs):.0f}s: keep each scene to 8s or less")
    if len(durs) < 3:
        w.append("fewer than 3 scenes: a built story arc reads as more original")
    if not spec.get("film") or not spec.get("source_url"):
        w.append("log 'film' and 'source_url' for every short")
    for x in w:
        print(f"  ! {x}")
    if strict and w:
        sys.exit(f"[{spec['id']}] strict mode: fix the warnings above")


def make(spec_path, strict=False):
    spec = json.loads(Path(spec_path).read_text(encoding="utf-8"))
    sid = spec["id"]
    print(f"[{sid}] building")
    src = resolve(spec["source"])
    if not src.exists():
        sys.exit(f"source not found: {src}")
    _, has_audio = probe(src)
    layout = spec.get("layout", "blur")
    scenes = spec["scenes"]
    cmd, filt, durs = ["ffmpeg", "-y", "-v", "error"], "", []
    for i, sc in enumerate(scenes):
        a, b = ts(sc["start"]), ts(sc["end"])
        dur = b - a
        durs.append(dur)
        cmd += ["-ss", f"{a}", "-t", f"{dur}", "-i", str(src)]
        filt += scene_filter(i, layout, has_audio, dur)
    n = len(scenes)
    filt += "".join(f"[v{i}][a{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=1[v][a]"
    total = sum(durs)
    check_spec(spec, durs, strict)
    work = Path(tempfile.mkdtemp(prefix="shorts_"))
    base = work / "base.mp4"
    run(cmd + ["-filter_complex", filt, "-map", "[v]", "-map", "[a]", "-c:v", "libx264", "-preset",
               "fast", "-crf", "18", "-c:a", "aac", str(base)])
    if not 15 <= total <= 30:
        print(f"  ! duration {total:.1f}s (target 18-25s)")

    ass = work / "subs.ass"
    build_ass(spec, total, ass)
    music = pick_music(spec)
    out = ROOT / "out" / f"{sid}.mp4"
    vf = f"ass={ass.name}"
    orig_vol = spec.get("original_audio_volume", 1.0)
    mus_vol = spec.get("music_volume", 0.35)
    fade = f"afade=t=out:st={max(0, total - 1.5)}:d=1.5"
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(base.name)]
    vo = resolve(spec["voiceover"]) if spec.get("voiceover") else None
    if vo and not vo.exists():
        sys.exit(f"voiceover not found: {vo}")
    if vo:
        cmd += ["-i", str(vo)]
        vi = len([a for a in cmd if a == "-i"]) - 1
        mix_vo = f"[{vi}:a]aresample=48000,volume=1.4[vo];[aprev][vo]amix=inputs=2:duration=first:normalize=0[aout2]"
    if music:
        cmd += ["-stream_loop", "-1", "-i", str(music)]
        mi = len([a for a in cmd if a == "-i"]) - 1
        # music ducks under the original audio (dialogue), then both are mixed
        af = (f"[0:a]volume={orig_vol},asplit=2[o][sc];"
              f"[{mi}:a]aresample=48000,volume={mus_vol},atrim=0:{total}[m0];"
              f"[m0][sc]sidechaincompress=threshold=0.03:ratio=8:attack=20:release=400[m];"
              f"[o][m]amix=inputs=2:duration=first:normalize=0,{fade}[aout]")
    else:
        af = f"[0:a]volume={orig_vol},{fade}[aout]"
    if vo:
        af = af.replace("[aout]", "[aprev]") + ";" + mix_vo
        final = "[aout2]"
    else:
        final = "[aout]"
    cmd += ["-filter_complex", af, "-vf", vf, "-map", "0:v", "-map", final, "-t", f"{total}",
            "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "aac", "-b:a", "160k",
            "-movflags", "+faststart", str(out.resolve())]
    # run inside work dir so the ass filter path stays simple and portable
    p = subprocess.run(cmd, cwd=work, capture_output=True, text=True)
    if p.returncode != 0:
        sys.exit(f"final render failed:\n{p.stderr[-1500:]}")
    shutil.rmtree(work, ignore_errors=True)

    write_metadata(spec, out, total, music)
    append_tracker(spec, total, music)
    print(f"  -> {out.relative_to(ROOT.parent)} ({total:.1f}s)")


def write_metadata(spec, out, total, music):
    theme = spec.get("theme", "emotion")
    tags = ["#shorts", f"#{theme.replace(' ', '')}", "#movieclips", "#emotional"] + spec.get("hashtags", [])
    title = (spec.get("title") or spec.get("hook") or theme).strip()
    desc = [spec.get("take", ""), spec.get("question", ""), "", "Which movie is this? Tell us in the comments.", "",
            f"Source: {spec.get('film', '')} {spec.get('year', '')} ({spec.get('copyright_basis', 'unknown')}) {spec.get('source_url', '')}".strip(),
            f"Music: {music.stem if music else 'n/a'} (YouTube Audio Library)",
            "All rights belong to their respective owners. Edited with commentary.", "", " ".join(tags)]
    out.with_suffix(".txt").write_text(f"TITLE: {title[:95]} #shorts\n\nDESCRIPTION:\n" + "\n".join(desc) + "\n",
                                       encoding="utf-8")


def append_tracker(spec, total, music):
    path = ROOT / "tracker.csv"
    new = not path.exists()
    with path.open("a", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        if new:
            w.writerow(TRACKER_COLS)
        w.writerow([datetime.date.today(), spec["id"], spec.get("theme", ""), spec.get("film", spec["source"]),
                    spec.get("year", ""), spec.get("risk", ""), music.name if music else "", f"{total:.1f}",
                    "", "", "", "", "", ""])


# ---------- helpers ----------
def cmd_new(a):
    p = ROOT / "specs" / f"{a.id}.json"
    if p.exists():
        sys.exit(f"{p} exists")
    spec = {
        "id": a.id, "theme": a.theme, "mood": a.theme, "film": "TITLE", "year": "", "source_url": "", "copyright_basis": "public_domain", "risk": "old film, low risk", "take": "Your one-line opinion, e.g. He chose money over her.",
        "source": a.source, "layout": "blur",
        "hook": "She found out on their wedding day...",
        "scenes": [{"start": "0:10", "end": "0:16"}, {"start": "1:02", "end": "1:08"}, {"start": "2:30", "end": "2:36"}],
        "subtitles": ["Line that tells the story.", "Another line.", "His one-line take, like: Big mistake."],
        "question": "Would you forgive him?",
        "music_volume": 0.35, "original_audio_volume": 1.0}
    p.write_text(json.dumps(spec, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"created {p}")


def cmd_transcribe(a):
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        sys.exit("pip install faster-whisper   (optional, free, runs locally)")
    tmp = Path(tempfile.mkdtemp()) / "a.wav"
    cmd = ["ffmpeg", "-y", "-v", "error", "-ss", str(ts(a.start)), "-i", a.file]
    if a.end:
        cmd += ["-t", str(ts(a.end) - ts(a.start))]
    run(cmd + ["-ac", "1", "-ar", "16000", str(tmp)])
    segs, _ = WhisperModel(a.model, compute_type="int8").transcribe(str(tmp))
    for s in segs:
        print(f"{s.start + ts(a.start):7.1f} - {s.end + ts(a.start):7.1f}  {s.text.strip()}")


def cmd_doctor(_):
    ok = True
    for t in ("ffmpeg", "ffprobe"):
        print(f"{t}: {'ok' if shutil.which(t) else 'MISSING'}")
        ok &= bool(shutil.which(t))
    filters = run(["ffmpeg", "-hide_banner", "-filters"])
    for f in ("ass", "sidechaincompress", "boxblur"):
        has = f" {f} " in filters
        print(f"ffmpeg filter {f}: {'ok' if has else 'MISSING'}")
        ok &= has
    n = len([f for f in (ROOT / "music").iterdir() if f.suffix.lower() in AUDIO_EXT])
    print(f"music tracks: {n}")
    try:
        import faster_whisper  # noqa
        print("faster-whisper: ok (optional)")
    except ImportError:
        print("faster-whisper: not installed (optional)")
    sys.exit(0 if ok else 1)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sp = ap.add_subparsers(dest="cmd", required=True)
    sp.add_parser("doctor").set_defaults(f=cmd_doctor)
    n = sp.add_parser("new"); n.add_argument("id"); n.add_argument("--theme", default="love")
    n.add_argument("--source", default="input/film.mp4"); n.set_defaults(f=cmd_new)
    m = sp.add_parser("make"); m.add_argument("specs", nargs="*"); m.add_argument("--all", action="store_true"); m.add_argument("--strict", action="store_true")
    m.set_defaults(f=lambda a: [make(s, a.strict) for s in (sorted((ROOT / "specs").glob("*.json")) if a.all else a.specs)])
    t = sp.add_parser("transcribe"); t.add_argument("file"); t.add_argument("--start", default="0")
    t.add_argument("--end"); t.add_argument("--model", default="small"); t.set_defaults(f=cmd_transcribe)
    a = ap.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
