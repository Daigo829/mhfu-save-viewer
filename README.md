<!-- MHFU Save Viewer — v0.6 -->
# MHFU Save Viewer

A **read-only** viewer for Monster Hunter Freedom Unite / Portable 2nd G character saves.
Drop your raw **MHP2NDG.BIN** and the viewer decrypts it in your browser, or drop an
already-decrypted character save. Either way it shows what the file holds — every monster's hunt
counts and the per-subspecies **size records** the game stores but never displays.

This tool **never writes, edits, re-encrypts, or downloads** your save. It only reads and displays,
and runs entirely in your browser; your save never leaves your machine. Decryption happens once, in
memory.

> Companion to the *Illegal Monster Size Fixer*. Same offset ground-truth, opposite purpose:
> the fixer changes the save, this one only looks.

## Files

```
index.html      markup / layout (loads decryptor.js before app.js)
styles.css      MHFU-styled theme (gold outline frames, translucent panels, game screenshot bg)
decryptor.js    embedded "SaveTools" decryptor — raw MHP2NDG.BIN → character slots (self-contained)
app.js          save parsing + all rendering (DATA / SLOTS offset tables live here)
images/         static assets — mhfu-background.png is the background screenshot
```

Open `index.html` directly in a browser — no build step, no server needed.

## Use it

Drop your save on the start screen (or click to choose). The viewer accepts either:

- **Raw `MHP2NDG.BIN`** (1,483,024 bytes off a memory stick, or 1,483,008 if PSP-decryption is
  already off — PPSSPP's default). The viewer decrypts it in-browser, then shows a slot picker:
  choose character 1/2/3 (empty slots are greyed out). No external tools needed.
- **A decrypted `characterX.sav`** (438,528 bytes). Loads straight into the viewer.

The viewer opens on the **Monsters** section.

### How decryption works (decryptor.js)

`MHP2NDG.BIN` has two encryption layers. The embedded decryptor peels both, then cuts the character
slots at fixed offsets:

1. **PSP layer** — AES-128-CBC (the same crypto SED-PC / the PSP hardware does), region key
   auto-detected. `1,483,024 → 1,483,008`.
2. **Game layer** — Capcom's substitution + rolling-XOR cipher (the QuickBMS `MHFU_SaveDecrypter.bms`
   logic). Region is confirmed with the save's salted SHA-1.
3. **Slot extraction** — `character1/2/3.sav` at `0x1000 / 0x6C100 / 0xD7200`, 438,528 bytes each.

Region is detected automatically by trying US/EU then JP keys and validating the SHA-1. The US/EU
path is verified byte-for-byte against known-good decrypted saves; the JP path is attempted the same
way but is not yet confirmed against a JP-region BIN.

## Interface

A left sidebar switches sections. **Monsters** and **Advanced** are functional; **Hunter, Quests,
Items, Equipment,** and **Awards** are placeholders for later passes. The background is a static
in-game screenshot; the sidebar and content sit in outlined frames over it. Any scrollable list can
be dragged (click-drag, axis-locked to up/down or left/right) as well as scrolled with the wheel.

### Monsters

Monsters are in **in-game Monster List order**. Each family's base species is **bold**; its
subspecies are listed beneath it with **no number** (Fatalis variants and Ashen Lao-Shan Lung are
shown bold like main species). Defaults to **Crown monsters only**.

Controls: a **search** box, a **filter** dropdown (*All Monsters / Crown monsters only / Captured*),
and a **Size & crown columns** toggle.

Columns:

- **# / Monster** — in-game number (base rows only) and name. The base row also carries a
  **Σ hunted** chip (family total: base + all subspecies, i.e. the guild-card *Hunted* number) and a
  **+N sub** count.
- **Slain / Captured / Total** — this row's own kills, captures, and their sum. Captured shows
  `----` for monsters that can't be captured (small monsters, elder dragons, Fatalis, Lao-Shan).
- **Card smallest / Card biggest** — the smallest/largest size you've recorded for that form
  (stored % and cm), shown plain.
- **Min game / Max game** — the family-wide absolute smallest/largest that monster can ever be,
  always coloured (**min in red**, **max in blue**).
- **Crowns** — tags earned: *small crown / big crown* (crossed the crown threshold) and
  *min size / max size* (reached the game's absolute extreme, which sits on top of a crown).
- **Caught** — only in the *Captured* view: a green ✓ when captured ≥ 1, a red ✗ when 0.

**Size & crown columns** off collapses the view to just **# → Monster → Slain → Captured**.
The **Captured** filter shows **# → Monster → Slain → Captured → Caught**.

### Advanced

A full list of the **offset map** used for the Monster List — all **90 internal save array slots**
with their raw offsets and live values (captured / largest / smallest / slain), including the 6
unused slots and the one unidentified counter (`0x4282`). For debugging, hex editing and offset
finding; not needed for normal use.

## How the data was mapped

Size percents live in two u16 little-endian arrays (`0x40E0`–`0x4246`); displayed cm = `base × percent / 100`.
The guild-card cache at `0x67408` stores, per base species, `[u16 ?][u16 hunted][u16 max×10][u16 min×10]`.
Offsets and base sizes were confirmed by forced-ramp **edit-testing** on an untouched JP (Daigo) save.
Crown thresholds come from `mhfu_crown_size_percentages_v2.txt`; the game min/max sizes come from
Kenta's crown guide (family level) and were validated against the Daigo save.

## Status

**v0.6.** Adds **in-browser decryption**: drop a raw `MHP2NDG.BIN` and the embedded decryptor
(`decryptor.js`) peels the PSP + game layers and offers a 1/2/3 character-slot picker — no external
SaveTools/QuickBMS needed. Decrypted `characterX.sav` files still load directly.

Viewer itself is unchanged from v0.5: MHFU-styled interface with a sidebar, static screenshot
background, and outlined frames. **Monsters** lists every roster monster in in-game order with hunt
counts, card + game sizes, and crown / min-size / max-size tags, across All / Crown-only / Captured
views. **Advanced** holds the 90-slot offset map. **Hunter, Quests, Items, Equipment,** and
**Awards** are placeholders for later passes — only monster information is mapped so far.

## Credits

- **SaveTools** / `MHFU_SaveDecrypter.bms` — HenryEx (QuickBMS game-layer decryption).
- **SED-PC** — hgoel0974 (PC port of the PSP save encrypter/decrypter).
- **mhef** — Seth VanHeulen (PSP AES-layer keys + algorithm the embedded decryptor is ported from).
- **QuickBMS** — Luigi Auriemma (original script engine).
- **vnctdj** — PPSSPP-forums SaveTools packaging / quest list.
- **ryin77** — GameFAQs crown-size % guide (legal ranges).
- **willthehunter** — MH-Freedom Quest Editor size tables.
- Offset & crown mapping done by edit-test on an untouched JP (Daigo) save.

Not affiliated with Capcom. For personal, offline use.
