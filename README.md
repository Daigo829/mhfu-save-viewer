<!-- MHFU Save Viewer — v0.8 -->
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

A left sidebar switches sections. **Hunter**, **Monsters** and **Advanced** are functional; **Quests,
Items, Equipment,** and **Awards** are placeholders for later passes. The background is a static
in-game screenshot; the sidebar and content sit in outlined frames over it. Any scrollable list can
be dragged (click-drag, axis-locked to up/down or left/right) as well as scrolled with the wheel.

### Hunter

A dashboard of bordered cards showing the hunter profile, read straight from the save (only
fully-decoded fields are shown):

- **Hunter** — character name and **playtime** (stored as total seconds, shown H:MM).
- **Funds** — **Pokke Points**, **Guild Points**, and **Zenny** (each caps at 9,999,999 in-game).
- **Quest Records** — the 7 quest tallies: Chief's, Guild Hall Low/High/G Rank, Treasure Quests,
  Training School, Nekoht's.
- **Weapon Usage** — a horizontal bar chart of quests cleared per weapon, all 11 types in the
  game's on-screen bar order, most-used highlighted, with a total.
- **Guild Card Greeting** — the player message, folded from the save's fullwidth glyphs back to ASCII.
- **Felyne Comrades** — a compact table of each non-empty comrade slot: Level, Attack, Defense,
  First Leader name.

Deferred (not stored as plain values / needs lookup tables — omitted for now): HR, Friendship
points, currently-held weapon type, treasures-collected grid.

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
- **Min game / Max game** — the smallest/largest that form can ever be, **per subspecies** (each
  base and subspecies has its own range), always coloured (**min in red**, **max in blue**).
- **Crowns** — tags earned: *small crown / big crown* (crossed the crown threshold) and
  *min size / max size* (reached the game's absolute extreme, which sits on top of a crown). On a
  **subspecies**, the min-size / max-size tag carries a small corner **info bubble** — click or tap it
  to see whether that form's range *differs from* or is the *same as* its base species.
- **Caught** — only in the *Captured* view: a green ✓ when captured ≥ 1, a red ✗ when 0.

**Size & crown columns** off collapses the view to just **# → Monster → Slain → Captured**.
The **Captured** filter shows **# → Monster → Slain → Captured → Caught**.

### Advanced

A full list of the **offset map** used for the Monster List — all **90 internal save array slots**
with their raw offsets and live values (captured / largest / smallest / slain), including the 6
unused slots and the one unidentified counter (`0x4282`). Below it, a **weapon-usage internal byte
order** table maps each slot of the `0x678E0` array to its offset, the weapon it holds, and its live
value (the array's internal order differs from the on-screen bar order). For debugging, hex editing
and offset finding; not needed for normal use.

## How the data was mapped

Size percents live in two u16 little-endian arrays (`0x40E0`–`0x4246`); displayed cm = `base × percent / 100`.
The guild-card cache at `0x67408` stores, per base species, `[u16 ?][u16 hunted][u16 max×10][u16 min×10]`.
Offsets and base sizes were confirmed by forced-ramp **edit-testing** on an untouched JP (Daigo) save.
Crown thresholds come from `mhfu_crown_size_percentages_v2.txt`; the game min/max sizes are
**per-form** ryin77 ground-truth ranges (base and each subspecies separately, from that guide's
per-quest size tables). Five ranges were then **widened to match a verified 3,600 h save** whose real
records exceeded ryin77: Tigrex max 138%, Teostra max 140%, Kushala Daora max 138%, Diablos max
154%, and Yian Garuga (One-Eyed) min 86% (which makes it identical to base Garuga).

## Status

**v0.8.** Adds the **Awards — Completion** tab: all 48 Guild-Card Awards in card order. Six mapped
awards show live progress bars (1E Kirin, 1F Akantor, 2M Ukanlos, 2Q Guild Points, 2V 50 G-weapons,
2W rarity-9/10 armour with per-slot counts); the rest read "Not yet mapped." 2V/2W scan the
1000-slot equipment box (`0x00A8`) against `equipment_full_table.csv`. The **Quests** tab moves to its
own sidebar section, and **Advanced** gains a quest-count internal-byte-order table.

**v0.7.** Adds **in-browser decryption**: drop a raw `MHP2NDG.BIN` and the embedded decryptor
(`decryptor.js`) peels the PSP + game layers and offers a 1/2/3 character-slot picker — no external
SaveTools/QuickBMS needed. Decrypted `characterX.sav` files still load directly.

Adds the **Hunter** tab: a card dashboard with name, playtime, funds, the 7 quest tallies, a
weapon-usage bar chart, the guild-card greeting, and the Felyne-comrade table. **Advanced** gains a
weapon-usage internal-byte-order table.

MHFU-styled interface with a sidebar, static screenshot background, and outlined frames.

**What works** (reads live from the save):
- **Monsters** — every roster monster in in-game order with hunt counts, card + game sizes, and
  crown / min-size / max-size tags, across All / Crown-only / Captured views.
- **Hunter** — card dashboard: name, playtime, funds, weapon-usage chart, guild-card greeting,
  Felyne-comrade table.
- **Quests** — the 7 quest tallies (Chief, Nekoht, Guild Hall low/high/G, Treasure, Training).
- **Awards — Completion** — all 48 Guild-Card Awards in order; the 6 mapped ones (1E, 1F, 2M, 2Q,
  2V, 2W) show live progress bars.
- **Advanced** — the 90-slot monster offset map plus the weapon- and quest-count internal-byte-order
  tables.

**What's still placeholder** (needs byte-address mapping before it can be shown):
- **Items** and **Equipment** tabs.
- The other 42 awards, which read "Not yet mapped."

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
