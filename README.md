<!-- MHFU Save Viewer — v1.0 beta -->
# MHFU Save Viewer

A **read-only** viewer for Monster Hunter Freedom Unite / Portable 2nd G character saves.
Drop your raw **MHP2NDG.BIN** and the viewer decrypts it in your browser, or drop an
already-decrypted character save. Either way it shows what the file holds — hunt counts, the
per-subspecies **size records** the game stores but never displays, and your progress toward
the 48 Guild-Card Awards.

**v1.0 is a beta.** Every section now reads live from the save, but the tool is not finished: 38 of
the 48 awards show earned/not without reconstructed progress, and per-piece equipment detail
(decorations, sharpness, skills, upgrade path) is still to come.

This tool **never writes, edits, re-encrypts, or downloads** your save. It only reads and displays,
and runs entirely in your browser; your save never leaves your machine. Decryption happens once, in
memory.

> Companion to the *Illegal Monster Size Fixer*. Same offset ground-truth, opposite purpose:
> the fixer changes the save, this one only looks.

## Files

Everything the website needs lives in `docs/` — that folder is what GitHub Pages publishes, and it
holds nothing else:

```
index.html                    markup / layout (loads decryptor.js before app.js)
styles.css                    MHFU-styled theme (gold outline frames, translucent panels, screenshot bg)
decryptor.js                  embedded "SaveTools" decryptor — raw MHP2NDG.BIN → character slots
app.js                        save parsing + all rendering (DATA / SLOTS offset tables live here)
item_master_table.csv         every item: 5 name sets, tag, storable, decoration, rarity, grindable
equipment_full_table.csv      every weapon and armour piece: name, class, rarity, attack, flags
item_data_fallback.js         generated from the item CSV — used only when opened over file://
equipment_data_fallback.js    generated from the equipment CSV — same purpose
images/                       static assets — mhfu-background.png is the background screenshot
```

Open `index.html` directly in a browser — no build step, no server needed. `app.js` fetches the two
CSVs at startup; browsers block that over `file://`, so the two `_fallback.js` files carry the same
data as plain scripts and are read only when the fetch fails. On a hosted copy they are unused.

Outside `docs/`: `INTERNAL_NOTES.md` (offsets, proofs, open items) and `GENERATED_FILES.md` (which
files are generated from which source, and what to regenerate after an edit).

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

A left sidebar switches sections — **Hunter, Quests, Monsters, Items, Equipment, Awards** and
**Advanced**. All seven read live from the save. The background is a
static in-game screenshot; the sidebar and content sit in outlined frames over it. Any scrollable
list can be dragged (click-drag, axis-locked) as well as scrolled with the wheel.

### Hunter

A dashboard of bordered cards showing the hunter profile, read straight from the save (only
fully-decoded fields are shown):

- **Hunter** — character name and **playtime** (stored as total seconds, shown H:MM).
- **Funds** — **Pokke Points**, **Guild Points**, and **Zenny** (each caps at 9,999,999 in-game).
- **Weapon Usage** — a horizontal bar chart of quests cleared per weapon, all 11 types in the
  game's on-screen bar order, most-used highlighted, with a total.
- **Guild Card Greeting** — the player message, folded from the save's fullwidth glyphs back to ASCII.
- **Felyne Comrades** — a compact table of each non-empty comrade slot: Level, Attack, Defense,
  First Leader name.

Deferred (not stored as plain values / needs lookup tables): HR, Friendship points,
currently-held weapon type, treasures-collected grid.

### Quests

The 7 quest tallies in in-game display order: Chief's, Nekoht's, Guild Hall Low / High / G Rank,
Treasure Quests, Training School.

### Monsters

Monsters are in **in-game Monster List order**. Each family's base species is **bold**; its
subspecies are listed beneath it with **no number** (Fatalis variants and Ashen Lao-Shan Lung are
shown bold like main species). Defaults to **Crown monsters only**.

Controls: a **search** box, a **filter** dropdown, and a **Size & crown columns** toggle.

**Five views**, each with its own stat line above the table:

| View | Shows | Stat line |
|---|---|---|
| All Monsters | everything | `X / N monsters hunted` |
| Crown monsters only | families that record sizes | `X / N total crowns`, `X / N big crowns`, `X / N small crowns` |
| Captured | capturable families | `X / N monsters captured`, `X / 43 for the Ecology Research Report` |
| Subspecies only | all 21 subspecies rows, no base rows | `X / 21 hunted`, `X / 16 for the Rare Species Report` |
| Rare Species Report | exactly the 16 variants award 1O requires | `X / 16 hunted` |

Columns:

- **# / Monster** — in-game number (base rows only) and name. The base row also carries a
  **Σ hunted** chip (family total: base + all subspecies, i.e. the guild-card *Hunted* number) and a
  **+N sub** count.
- **Slain / Captured / Total** — this row's own kills, captures, and their sum. Captured shows
  `----` for monsters that can't be captured.
- **Card smallest / Card biggest** — the smallest/largest size you've recorded for that form
  (stored % and cm).
- **Min game / Max game** — the smallest/largest that form can ever be, **per subspecies**,
  always coloured (**min in red**, **max in blue**).
- **Crowns** — tags earned: *small crown / big crown* (crossed the crown threshold) and
  *min size / max size* (reached the game's absolute extreme). On a **subspecies**, the
  min-size / max-size tag carries a corner **info bubble** — click it to see whether that form's
  range *differs from* or is the *same as* its base species.
- **Caught** — *Captured* view only: green ✓ when captured ≥ 1, red ✗ when 0.
- An unlabelled ✓/✗ column — *Rare Species Report* view only: whether that variant has been
  hunted (slain or captured ≥ 1).

**Size & crown columns** off collapses the view to **# → Monster → Slain → Captured**.
The Rare Species Report view shows **# → Monster → Slain → Captured → Total → ✓/✗**.

### Items

Three collapsible sections, all collapsed by default, each with its counts in the header so you can
read them without expanding anything. A search box filters all three by item name or id, and a
dropdown picks which of the five **name sets** to display (EU, US, JP+English patch, Japanese, MHFU
Complete) — it defaults to whichever matches the region the save was decrypted from.

- **Item Box — 1000 slots** and **Item Pouch — 24 slots.** Every slot in on-screen order (the box as
  10 pages of 100, the pouch as 3 pages of 8), with a page header every page-worth of slots. Slots
  are not packed in the save, so occupied slots can sit after empty ones; both lists walk every slot.
  Columns are slot number, id, item (with its tag chip where it has one) and count. Empty slots read
  *— empty —*; a count of 255 reads **infinite** (only Normal S Lv1 stores it); an id that names no
  item reads *Unknown (id N)* in red.
- **Every item at 99 — tracker.** All 1,025 storable items, decorations included, in catalogue order:
  id, rarity, name, amount held and ✓/✗. Amount reads as full stacks plus remainder (`99x2 + 52`),
  counting box and pouch together, with a note when part of it sits in the pouch. The header reads
  `X / 1,025 items at 99`.

  Filters: **All obtainable items**, **Missing only (under 99)**, **Grindable items** and
  **Grindable — missing only**, plus checkboxes to **hide decorations** and **hide low rarity (1–3)**.
  The grindable list is the 675 farmable materials; in that mode the header switches to
  `X / 675 grindable items at 99`.

  Because more than 99 of an item means more than one slot, counts are shown per slot in the box
  listing and totalled only here.

### Equipment

Every slot of the **1000-slot equipment box** in slot order, paged every 100 like the item box, with
a search box and a category dropdown. Columns: slot, category, id, name, class, rarity, attack and a
**G** flag for G-rank weapons. The header shows slots used, G-weapons held and rarity-9–10 armour
held — the same numbers awards 2V and 2W count — with per-category chips beneath it.

Empty slots read *— empty —*; a category byte above 6 reads *Unknown category N* and an unrecognised
id reads *Unknown (id N)*, both in red. Attack is a weapon value: the equipment table carries no
defence figures, so armour rows show a dash there.

Each record's bytes `+4`..`+11` are still undecoded — presumed decorations and upgrade state. That
is the per-piece detail planned for a later pass.

### Awards — Completion

All 48 Guild-Card Awards in card order, with `X / 48 complete` in the header and an
**All / Incomplete only** filter.

Every row reads the game's own **earned flag** from the save, so all 48 are at least
binary-correct — including the 38 whose progress isn't reconstructed yet (those show
*Not yet mapped* in the progress column, but a completed row still reads as complete).

An award is **complete when its requirement is met or its earned flag is set.** Awards are
permanent in-game and there is no way to lose one, so a set flag can legitimately sit above your
current save state: 2V earned years ago still shows complete even if you have since sold down to
43 of 50 G-weapons. Those rows carry a short note saying so, with the live count below it.

**Ten awards show live reconstructed progress:** 1E Kirin, 1F Akantor, 1G King's Crown
(big crowns per monster), 1H Miniature Crown (small crowns), 1O Rare Species Report (16 variants
hunted), 1P Ecology Research Report (43 monsters captured), 2M Ukanlos, 2Q Guild Points,
2V 50 G-weapons, 2W rarity-9/10 armour with per-slot counts.

Each row has a **See details →** link to the tab holding the underlying data, with the matching
view already selected — 1G/1H to Crown monsters, 1O to Rare Species Report, 1P to Captured, and
2V/2W to Equipment. The link leaves a **← Back to Awards** chip above the table, which stays until
you click it. The other 42 rows show the link greyed out until their data is mapped.

Two caveats worth knowing:

- **1G / 1H are accepted, not proven.** They use the viewer's existing crown thresholds and count
  every size-recording monster. Unlike 1O/1P they were never confirmed against the game itself, so
  the X/N could be slightly off; the earned flag still governs whether the award reads complete.
- **1O's requirement set is deliberately asymmetric.** Golden Rajang, Rusted Kushala Daora and Yian
  Garuga (One-Eyed) are proven *not* required and are left out, while Ashen Lao-Shan Lung is proven
  required. It looks inconsistent; it is correct. **1P counts Diablos once** — One-Horned Diablos
  shares the same save slot, so either one satisfies it, and there is no separate row for it.

### Advanced

The **offset map** used for the Monster List — all **90 internal save array slots** with their raw
offsets and live values (captured / largest / smallest / slain), including the 6 unused slots and
the one unidentified counter (`0x4282`). Below it, weapon-usage and quest-count internal-byte-order
tables, each behind its own checkbox. For debugging, hex editing and offset finding.

## How the data was mapped

Size percents live in two u16 little-endian arrays (`0x40E0`–`0x4246`); displayed cm = `base × percent / 100`.
The guild-card cache at `0x67408` stores, per base species, `[u16 ?][u16 hunted][u16 max×10][u16 min×10]`.
Offsets and base sizes were confirmed by forced-ramp **edit-testing** on an untouched JP (Daigo) save.
Crown thresholds come from `mhfu_crown_size_percentages_v2.txt`; the game min/max sizes are
**per-form** ryin77 ground-truth ranges. Five ranges were **widened to match a verified 3,600 h save**
whose real records exceeded ryin77: Tigrex 138%, Teostra 140%, Kushala Daora 138%, Diablos 154%, and
Yian Garuga (One-Eyed) min 86%.

The award earned-flag bitset at `0x67400` (6 bytes, 48 bits, `1A` = bit 0) was verified cell-for-cell
against five saves with known award grids. It is a **regenerated cache**: the game recomputes awards
from the underlying save data and rewrites it on quest completion, which makes it authoritative for
reading and useless for editing. 1O and 1P were then proven with that recompute as an oracle —
set the data, clear one quest, read the game's own verdict.

## Status

**v1.0 (beta).** Adds the **Items** tab — the full 1000-slot item box, the 24-slot pouch, and a
tracker for holding **every one of the 1,025 storable items at 99**, with grindable-only and
missing-only filters, decoration and low-rarity toggles, and five selectable name sets. Adds the
**Equipment** tab: the whole 1000-slot equipment box with name, class, rarity and attack resolved
per piece. The last two placeholder tabs are gone, so all seven sections now read live from the save.

Under the hood, item and equipment facts moved out of `app.js` into their CSVs — rarity and the
grindable list became columns of `item_master_table.csv`, and each CSV gained a generated offline
fallback so names still resolve when the page is opened straight off a disk.

Still beta: 38 of the 48 awards show earned/not without reconstructed progress, per-piece equipment
detail is not decoded, and the JP decryption path is unconfirmed against a real JP BIN.

**v0.9.** Added the **earned-flag backstop for all 48 awards** — every row reads the game's own
verdict from `0x67400`, so awards whose progress isn't reconstructed are still correct. Added live
progress for four more: **1G King's Crown**, **1H Miniature Crown**, **1O Rare Species Report** and
**1P Ecology Research Report**. Completion became *requirement met OR earned flag*, with a note on
rows earned before the save regressed. The Awards tab gained an All / Incomplete-only filter and
**See details →** links into the tab holding the data; the Monsters tab gained **Subspecies only**
and **Rare Species Report** views, a per-view stat line, and a hunted ✓/✗ column.

**v0.8.** Added the **Awards — Completion** tab: all 48 awards in card order, six with live bars
(1E, 1F, 2M, 2Q, 2V, 2W). 2V/2W scan the 1000-slot equipment box (`0x00A8`) against
`equipment_full_table.csv`. **Quests** moved to its own sidebar section; **Advanced** gained a
quest-count internal-byte-order table.

**v0.7.** Added **in-browser decryption** (drop a raw `MHP2NDG.BIN`, pick a character slot) and the
**Hunter** tab: name, playtime, funds, weapon-usage chart, guild-card greeting, Felyne comrades.

**What works** (reads live from the save):
- **Monsters** — every roster monster in in-game order with hunt counts, card + game sizes, and
  crown / min-size / max-size tags, across five views.
- **Hunter** — name, playtime, funds, weapon-usage chart, guild-card greeting, Felyne comrades.
- **Quests** — the 7 quest tallies.
- **Items** — the 1000-slot box, the 24-slot pouch, and the x99 tracker for all 1,025 storable items.
- **Equipment** — the 1000-slot equipment box with per-piece name, class, rarity and attack.
- **Awards — Completion** — all 48, earned/not for every one, live progress for 10.
- **Advanced** — the 90-slot offset map plus the weapon- and quest-count byte-order tables.

**What's still missing:**
- Per-piece equipment detail — decorations, sharpness, skills, upgrade path (record bytes `+4`..`+11`
  are undecoded).
- The other 38 awards, which show earned/not but no reconstructed progress.
- Exact rarity for decoration jewels (shown as `4-5`) and the true cap on the five hard-capped items.

## Credits

- **SaveTools** / `MHFU_SaveDecrypter.bms` — HenryEx (QuickBMS game-layer decryption).
- **SED-PC** — hgoel0974 (PC port of the PSP save encrypter/decrypter).
- **mhef** — Seth VanHeulen (PSP AES-layer keys + algorithm the embedded decryptor is ported from).
- **QuickBMS** — Luigi Auriemma (original script engine).
- **vnctdj** — PPSSPP-forums SaveTools packaging / quest list.
- **ryin77** — GameFAQs crown-size % guide (legal ranges).
- **willthehunter** — MH-Freedom Quest Editor size tables.
- **Guild Card Guide** (GameFAQs FAQ 55732) — award names and requirement text.
- **atwiki** massive MHP2G database in japanese.
- Offset & crown mapping done by edit-test on my own savefiles and on multiple other dlsaves from gamefaqs used for cross-checking.

Not affiliated with Capcom. For personal, offline use.
