#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["youtube-transcript-api>=1.0.0", "yt-dlp>=2024.0.0"]
# ///
"""Haal de tekst (ondertitels) op van de laatste video's van een YouTube-kanaal of playlist.

Wat het doet:
  1. Pakt de N nieuwste video's van een kanaal/playlist (yt-dlp, alleen de lijst - geen download).
  2. Haalt per video de ONDERTITELS op via youtube-transcript-api (YouTube heeft die al).
     Geen video/audio-download, geen ffmpeg, geen Whisper. Seconden werk, gratis.
  3. Schrijft per video een leesbaar .md-bestand met de tekst.

  Al-opgehaalde video's worden overgeslagen (herkenbaar aan het video-ID in de naam).

Gebruik (via uv, dat installeert de pakketjes zelf):
    uv run transcribeer.py "https://www.youtube.com/@kanaalnaam"
    uv run transcribeer.py "https://www.youtube.com/playlist?list=..." --max 10
    uv run transcribeer.py "<url>" --taal nl --vertaal        # ondertitels vertalen naar NL
    uv run transcribeer.py "<url>" --bouw-skill meta-ads       # + kennis-skill bouwen (Claude maakt 'm af)

Standaard-opslagplek: als config.json (naast dit script) een 'kennis_map' bevat, komen de
transcripties in <kennis_map>/<kanaal>. De installatie-wizard vraagt daarnaar bij het installeren.

Taal: standaard zoekt 'ie een Nederlandse ondertitel; bestaat die niet, dan pakt 'ie de beste
beschikbare in de oorspronkelijke taal. Met --vertaal laat je YouTube 'm naar --taal vertalen.

Gemaakt door Bart Boonstra (Slim Werken AI). Lokaal, gratis, privé.
"""
from __future__ import annotations

import argparse, json, re, subprocess, sys, time
from pathlib import Path

YTDLP = [sys.executable, "-m", "yt_dlp"]
SCRIPT_DIR = Path(__file__).resolve().parent


# ---------- helpers ----------

def die(msg: str, code: int = 1):
    print(f"\n[FOUT] {msg}", file=sys.stderr)
    sys.exit(code)


def safe_name(text: str, maxlen: int = 80) -> str:
    text = re.sub(r"[\\/:*?\"<>|]", "", text).strip()
    text = re.sub(r"\s+", " ", text)
    return text[:maxlen].strip() or "video"


def slugify(text: str) -> str:
    s = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return s or "kanaal"


def load_config() -> dict:
    """Leest config.json naast dit script (o.a. 'kennis_map' = standaard-opslagplek)."""
    cfg = SCRIPT_DIR / "config.json"
    if cfg.exists():
        try:
            return json.loads(cfg.read_text(encoding="utf-8"))
        except Exception:
            pass
    return {}


# ---------- yt-dlp: alleen de lijst ophalen (geen download) ----------

def normalize_channel_url(url: str) -> str:
    """Kanaal-URL's laten we op de 'Videos'-tab uitkomen (nieuwste eerst),
    zodat we niet per ongeluk Shorts of livestreams meepakken."""
    u = url.split("?")[0].rstrip("/")
    is_channel = any(s in u for s in ("/@", "/channel/", "/c/", "/user/"))
    already_tab = u.endswith(("/videos", "/streams", "/shorts", "/featured"))
    if is_channel and not already_tab:
        return u + "/videos"
    return url


def list_latest(url: str, n: int) -> list[dict]:
    """Geeft de n nieuwste video's als [{id, title, url}] (metadata-only, geen download)."""
    candidates = [normalize_channel_url(url)]
    if candidates[0] != url:
        candidates.append(url)

    proc = None
    for cand in candidates:
        cmd = YTDLP + ["--flat-playlist", "--playlist-end", str(n),
                       "--dump-json", "--no-warnings", cand]
        proc = subprocess.run(cmd, capture_output=True, text=True)
        if proc.returncode == 0 and proc.stdout.strip():
            break

    if proc is None or proc.returncode != 0:
        die("yt-dlp kon de video-lijst niet ophalen. Klopt de URL?\n"
            + (proc.stderr.strip() if proc else ""))

    entries = []
    for line in proc.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            d = json.loads(line)
        except json.JSONDecodeError:
            continue
        vid = d.get("id")
        if not vid:
            continue
        entries.append({
            "id": vid,
            "title": d.get("title") or vid,
            "url": d.get("url") or f"https://www.youtube.com/watch?v={vid}",
        })

    if not entries:
        die("Geen video's gevonden op die URL.")
    return entries[:n]


def channel_label(url: str) -> str:
    """Nette mapnaam voor het kanaal/de playlist."""
    m = re.search(r"@([A-Za-z0-9._-]+)", url)
    if m:
        return safe_name(m.group(1), 60)
    try:
        out = subprocess.run(
            YTDLP + ["--flat-playlist", "--playlist-end", "1",
                     "--print", "%(playlist_channel|playlist_uploader|playlist_title)s", "--no-warnings",
                     normalize_channel_url(url)],
            capture_output=True, text=True, timeout=60)
        name = (out.stdout.strip().splitlines() or [""])[0]
        if name and name != "NA":
            return safe_name(name, 60)
    except Exception:
        pass
    return "kanaal"


# ---------- ondertitels ophalen ----------

def fetch_captions(video_id: str, taal: str, vertaal: bool):
    """Haalt de ondertitel-tekst op. Geeft (tekst, taalcode, vertaald_bool) of (None, reden, False)."""
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError:
        die("youtube-transcript-api ontbreekt. Draai dit script met 'uv run', of installeer:\n"
            "  pip install youtube-transcript-api")

    api = YouTubeTranscriptApi()
    try:
        tl = api.list(video_id)
    except Exception as e:
        return None, f"geen ondertitels ({type(e).__name__})", False

    transcript = None
    # 1. voorkeurstalen op volgorde: de gevraagde taal, dan Engels (meest voorkomende brontaal).
    #    find_transcript pakt per taal de beste (handmatig boven auto).
    try:
        transcript = tl.find_transcript([taal, "en", "en-US", "en-GB"])
    except Exception:
        transcript = None

    # 2. anders de AUTO-gegenereerde track (volgt de gesproken taal); pas daarna de eerste
    #    beschikbare. Zo pakken we niet per ongeluk een willekeurige community-vertaling
    #    (bv. het Arabisch van een TED-talk waar geen auto-ondertitel bij zit).
    translated = False
    if transcript is None:
        available = list(tl)
        if not available:
            return None, "geen ondertitels beschikbaar", False
        generated = [t for t in available if t.is_generated]
        transcript = (generated or available)[0]

    if vertaal and transcript.language_code != taal and getattr(transcript, "is_translatable", False):
        try:
            transcript = transcript.translate(taal)
            translated = True
        except Exception:
            translated = False

    try:
        fetched = transcript.fetch()
    except Exception as e:
        return None, f"ophalen mislukt ({type(e).__name__})", False

    snippets = getattr(fetched, "snippets", fetched)
    parts = []
    for s in snippets:
        t = (getattr(s, "text", None) or (s.get("text") if isinstance(s, dict) else "") or "").strip()
        if t:
            parts.append(t)
    text = " ".join(parts).strip()
    if not text:
        return None, "lege ondertitel", False
    return text, transcript.language_code, translated


# ---------- output ----------

def write_transcript(out_dir: Path, meta: dict, text: str, index: int, lang: str, translated: bool) -> str:
    fname = f"{index:02d} - {safe_name(meta['title'])} [{meta['id']}].md"
    taal_regel = f"{lang}" + (" (vertaald)" if translated else "")
    md = (
        f"# {meta['title']}\n\n"
        f"- **Video:** https://www.youtube.com/watch?v={meta['id']}\n"
        f"- **Ondertitel-taal:** {taal_regel}\n"
        f"- **Bron:** YouTube-ondertitels\n\n"
        f"---\n\n{text}\n"
    )
    (out_dir / fname).write_text(md, encoding="utf-8")
    return fname


def already_done(out_dir: Path, vid: str) -> bool:
    return any(out_dir.glob(f"*[[]{vid}[]].md"))


# ---------- main ----------

def main():
    ap = argparse.ArgumentParser(description="Haal de ondertitels van de laatste YouTube-video's op als tekst.")
    ap.add_argument("url", help="YouTube-kanaal- of playlist-URL")
    ap.add_argument("--max", type=int, default=20, help="aantal nieuwste video's (default 20)")
    ap.add_argument("--out", default=None,
                    help="doelmap (default: <kennis_map>/<kanaal> uit config.json, anders ./transcripties/<kanaal>)")
    ap.add_argument("--taal", default="nl", help="voorkeurstaal van de ondertitels (default nl)")
    ap.add_argument("--vertaal", action="store_true",
                    help="ondertitels naar --taal vertalen als ze in een andere taal zijn")
    ap.add_argument("--bouw-skill", dest="bouw_skill", nargs="?", const="__auto__", default=None,
                    help="bouw na het ophalen een kennis-skill van dit kanaal (optioneel: skill-naam)")
    args = ap.parse_args()

    cfg = load_config()
    label = channel_label(args.url)

    if args.out:
        out_dir = Path(args.out).expanduser()
    elif cfg.get("kennis_map"):
        out_dir = Path(cfg["kennis_map"]).expanduser() / label
    else:
        out_dir = Path.cwd() / "transcripties" / label
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Kanaal/playlist : {label}")
    print(f"Doelmap         : {out_dir}\n")

    print(f"Nieuwste {args.max} video's ophalen...")
    videos = list_latest(args.url, args.max)
    print(f"{len(videos)} video's gevonden.\n")

    done = skipped = failed = 0
    t_all = time.time()
    for i, v in enumerate(videos, 1):
        head = f"[{i}/{len(videos)}] {v['title'][:60]}"
        if already_done(out_dir, v["id"]):
            print(f"{head} - al gedaan, overslaan"); skipped += 1; continue

        text, lang, translated = fetch_captions(v["id"], args.taal, args.vertaal)
        if text is None:
            print(f"{head} - overslaan ({lang})"); failed += 1; continue

        fname = write_transcript(out_dir, v, text, i, lang, translated)
        print(f"{head} - {len(text.split())} woorden ({lang}) -> {fname}")
        done += 1

    print(f"\nKlaar in {(time.time()-t_all):.1f} sec. "
          f"{done} nieuw, {skipped} overgeslagen, {failed} zonder ondertitels.")
    print(f"Alle transcripties staan in: {out_dir}")

    if args.bouw_skill is not None:
        slug = slugify(label if args.bouw_skill == "__auto__" else args.bouw_skill)
        print("\n" + "=" * 64)
        print("VOLGENDE STAP - KENNIS-SKILL BOUWEN (instructie voor Claude)")
        print("=" * 64)
        print(f"Kennisbron (transcripties): {out_dir}")
        print(f"Nieuwe skill: /{slug}  ->  ~/.claude/skills/{slug}/SKILL.md")
        print("Claude: volg nu de procedure 'Een kennis-skill bouwen' uit de SKILL.md")
        print("van /transcribeer. Kort:")
        print("  1. Lees een representatieve selectie van de transcripties hierboven.")
        print("  2. Distilleer de kernprincipes, frameworks, do's/don'ts en voorbeelden")
        print("     van deze expert.")
        print(f"  3. Schrijf ~/.claude/skills/{slug}/SKILL.md die die kennis toepast en")
        print("     naar de kennisbron-map hierboven verwijst voor de details.")
        print("  4. Bevestig en laat een gebruiksvoorbeeld zien.")


if __name__ == "__main__":
    main()
