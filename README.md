<!-- MHFU Save Viewer — v0.5 -->
# MHFU Save Viewer

A **read-only** viewer for Monster Hunter Freedom Unite / Portable 2nd G character saves.
Drop a decrypted save and it shows what the file holds — every monster's hunt counts and the
per-subspecies **size records** the game stores but never displays.

This tool **never writes, edits, or downloads** your save. It only reads and displays, and runs
entirely in your browser; your save never leaves your machine.

> Companion to the *Illegal Monster Size Fixer*. Same offset ground-truth, opposite purpose:
> the fixer changes the save, this one only looks.

## Files

```
index.html      markup / layout
styles.css      MHFU-styled theme (gold outline frames, translucent panels, game screenshot bg)
app.js          save parsing + all rendering (DATA / SLOTS offset tables live here)
images/         static assets — bg-daigo.png is the background screenshot
```

Open `index.html` directly in a browser — no build step, no server needed.

## Use it

1. Decrypt your save first (it must be **438,528 bytes**):
   PPSSPP → *Savedata* → **SaveTools** (by vnctdj) → decrypt.
2. Open `index.html` (or the hosted page).
3. Drop `character1.sav` (or click to choose). The viewer opens on the **Monsters** section.

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

**v0.5.** MHFU-styled interface with a sidebar, static screenshot background, and outlined frames.
**Monsters** lists every roster monster in in-game order with hunt counts, card + game sizes, and
crown / min-size / max-size tags, across All / Crown-only / Captured views. **Advanced** holds the
90-slot offset map. Other sidebar sections are placeholders for later passes.

## Credits

- **SaveTools** — vnctdj (PPSSPP forums), decrypt/encrypt.
- **ryin77** — GameFAQs crown-size % guide (legal ranges).
- **willthehunter** — MH-Freedom Quest Editor size tables.
- Offset & crown mapping done by edit-test on an untouched JP (Daigo) save.

Not affiliated with Capcom. For personal, offline use.
