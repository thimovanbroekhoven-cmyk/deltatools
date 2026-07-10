---
name: transcribeer
description: Haal de kennis van een YouTube-kanaal binnen als tekst. Pakt de laatste video's van een kanaal of playlist en haalt van elke video de ondertitels op (snel, gratis, geen download), en bouwt er optioneel een kennis-skill van die werkt volgens de principes van die expert. Gebruik deze skill wanneer de gebruiker "/transcribeer" typt, of zegt "haal de tekst van dit kanaal op", "transcribeer dit kanaal", "download de kennis van dit kanaal", "maak een skill van dit kanaal", of een YouTube-kanaal/playlist-URL aanlevert.
---

# Transcribeer een YouTube-kanaal (en bouw er een kennis-skill van)

Haal van de nieuwste video's van een YouTube-kanaal of playlist de tekst op. Er wordt niks
gedownload: de skill pakt de ondertitels die YouTube zelf al heeft (via `youtube-transcript-api`).
Snel, gratis, geen ffmpeg en geen model. En optioneel: bouw van die tekst een nieuwe skill die
werkt volgens de kennis en principes van die expert.

## Waar de kennis wordt opgeslagen

De standaard-opslagplek staat in `config.json` naast dit bestand, sleutel `kennis_map`
(de installatie-wizard heeft daarnaar gevraagd). Transcripties komen in
`<kennis_map>/<kanaalnaam>/`. Met `--out "<pad>"` kies je per keer een andere map.
Staat er geen `kennis_map`, dan gebruikt het script `./transcripties/<kanaal>`.

In deze repo (`deltatools`) staat `kennis_map` op `youtube-kennis` (relatief aan de map waarin
je het commando draait). Draai `/transcribeer` dus vanuit de root van deze repo, zodat alles
netjes in `youtube-kennis/<kanaal>/` terechtkomt en je het kunt committen.

## Deel 1: Tekst ophalen

1. **Vraag de URL** als die nog niet gegeven is (kanaal zoals `https://www.youtube.com/@naam`
   of een playlist-URL). Vraag optioneel hoeveel video's (default 20).
2. **Draai het script met `uv`** (dat installeert de pakketjes zelf, eenmalig):
   ```bash
   uv run ~/.claude/skills/transcribeer/transcribeer.py "<YOUTUBE-URL>"
   ```
   Opties: `--max 10` (aantal), `--out "<map>"` (andere doelmap), `--taal nl` (voorkeurstaal),
   `--vertaal` (ondertitels naar het Nederlands laten vertalen als ze in een andere taal zijn).
3. **Meld het resultaat**: per video een leesbaar `.md`-bestand (titel, link, taal, tekst).
   Al opgehaalde video's worden overgeslagen. Video's zonder ondertitels worden netjes gemeld.

## Deel 2: Een kennis-skill bouwen (optioneel maar krachtig)

Wanneer de gebruiker er een skill van wil (of het script `--bouw-skill` meekreeg), maak je
van de transcripties een nieuwe, herbruikbare skill. Zo verander je het "brein" van een
expert in een tool die de gebruiker steeds opnieuw kan inzetten.

Draai eventueel met de vlag:
```bash
uv run ~/.claude/skills/transcribeer/transcribeer.py "<URL>" --bouw-skill "<naam>"
```

Het script haalt de tekst op en print daarna een handoff met de kennisbron-map en een
voorgestelde skill-naam. Volg dan deze procedure:

1. **Bepaal doel + naam.** Vraag kort waarvoor de skill moet dienen (bijv. "advertenties
   schrijven zoals dit kanaal"). Kies een korte, duidelijke slug (bv. `meta-ads`).
2. **Lees de kennis.** Neem een representatieve selectie van de transcripties in de
   kennisbron-map: gebruik `grep` op terugkerende termen en lees een spreiding van de
   bestanden. Bij veel/lange transcripties: lees genoeg om de patronen te snappen, niet alles.
3. **Distilleer.** Vat samen wat deze expert kenmerkt: kernprincipes, frameworks, vaste
   stappen, do's en don'ts, typische voorbeelden en woordgebruik. Wees concreet.
4. **Schrijf de skill** naar `~/.claude/skills/<slug>/SKILL.md` met:
   - frontmatter (`name`, een `description` met duidelijke triggers);
   - de gedistilleerde principes/frameworks (kort en scherp);
   - een instructie dat de volledige kennisbron in de map `<kennis_map>/<kanaal>/` staat en
     dat je die map raadpleegt (grep/lezen) voor details en voorbeelden bij een opdracht;
   - een korte werkwijze: hoe de skill een taak aanpakt met deze kennis.
5. **Bevestig** dat de skill klaar is en geef één gebruiksvoorbeeld, bijv.
   `/meta-ads schrijf 3 advertenties voor mijn webshop`.

**Belangrijk:** verzin nooit principes die niet in de transcripties staan. De kracht zit erin
dat de skill echt op de kennis van dat kanaal leunt. Respecteer auteursrecht: gebruik dit voor
eigen research en output, niet om andermans content letterlijk te herpubliceren.

## Wat je nodig hebt (eenmalig)

`uv` (draait het script en installeert `youtube-transcript-api` + `yt-dlp` automatisch). De
installatie-wizard heeft dit gecheckt en geregeld. Geen ffmpeg, geen Whisper, geen model.

## Let op

- Werkt op openbare video's met ondertitels (bijna alles heeft auto-ondertitels).
- Er wordt niks gedownload behalve de tekst; daarom is het snel (seconden voor 20 video's).
