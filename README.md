<!-- MHFU Save Viewer — v0.4 -->
# MHFU Save Viewer

A **read-only** viewer for Monster Hunter Freedom Unite / Portable 2nd G character saves.
Drop a decrypted save and it shows what the file holds — starting with the monster **size records**,
including the per-subspecies sizes the game stores but never displays (hunt counts land in Phase 2).

This tool **never writes, edits, or downloads** your save. It only reads and displays.
It runs entirely in your browser; your save never leaves your machine.

> Companion to the *Illegal Monster Size Fixer*. Same offset ground-truth, opposite purpose:
> the fixer changes the save, this one only looks.

## Use it

1. Decrypt your save first (it must be **438,528 bytes**):
   PPSSPP → *Savedata* → **SaveTools** (by vnctdj) → decrypt.
2. Open `index.html` (or the hosted page).
3. Drop `character1.sav` (or click to choose). The **Monsters** tab fills in automatically.

## What the Monsters tab shows

Monsters are in **in-game Monster List order** (1–62) — every roster monster, not just crown ones. Each
numbered row is a monster; its **subspecies sit directly beneath it** (indented, no number), so a family
reads like the offset-map tables. Use the caret to fold a family, or **Expand all / Collapse all** for
everything (expanded by default).

Two controls above the table:

- **Show: Everything / Crown monsters only / Captured** — *Everything* is all 62 roster entries;
  *Crown monsters only* keeps the 31 crown families (+ subspecies); *Captured* is a capture checklist —
  just `#`, Monster, Captured, and a **Caught** checkbox (ticked when you've captured at least one),
  limited to monsters that can actually be captured.
- **Size & crown columns** — toggle all the size/crown columns off when you only care about hunt counts.

Columns per row:

- **Slain / Captured / Total** — this row's own kills, captures, and their sum. Captured shows `----`
  for monsters that **can't be captured** (small monsters, elder dragons, Fatalis, Lao-Shan, etc.). The
  parent row also carries a **Σ hunted** chip — the family total (base + all subspecies), which is the
  number the guild card shows as *Hunted*.
- **Card smallest / Card biggest** — the smallest and largest size *you've recorded* for that form
  (stored % and cm). Each **lights up** on reaching this monster's crown threshold: **red** for a
  *small crown*, **blue** for a *big crown*.
- **Min game size / Max game size** — the smallest and largest that monster can *ever* be. These are
  **family-wide** values from Kenta's crown guide, so subspecies inherit their family's range.
- **Crowns** — the tags below. `----` in all size columns for monsters with no size record.

Terminology: **min / max** always mean actual *sizes*; **small crown / big crown** are the guild-card
crown thresholds. Tags:

- **small crown / big crown** — a recorded size crossed the crown threshold (gold label, red/blue text).
- **min size / max size** — the record reached the game's absolute smallest / largest possible size
  (solid red / blue). This is the ultimate, and always sits *on top of* a crown.

### Why subspecies matter

The guild card collapses a whole family into one line: one smallest, one largest, across the base
species **and** all its subspecies. So a Silver Rathalos or Gold Rathian size sits in your save but
is invisible in-game unless it happens to be the current record-holder. This viewer surfaces all of them.

## How the data was mapped

Size percents live in two u16 little-endian arrays (`0x40E0`–`0x4246`); displayed cm = `base × percent / 100`.
The guild-card cache at `0x67408` stores, per base species, `[u16 ?][u16 hunted][u16 max×10][u16 min×10]`
(the first field varies per save — it is *not* a fixed `0x001D` tag; rely on hunted/max/min). Offsets and
base sizes were confirmed by forced-ramp **edit-testing** on an untouched Daigo save. Crown thresholds come
from `mhfu_crown_size_percentages_v2.txt`; the **game min/max sizes come from Kenta's crown guide** (family
level) and were validated — every recorded size on the Daigo save falls inside its family's stated range.

### Advanced (debug) panel

At the bottom of the Monsters tab, a collapsible **Advanced** section — labelled for **debugging, hex
editing and offset finding**, not everyday use — can reveal all **90 internal array slots** with their
raw offsets and live values (captured / largest / smallest / slain), including the 6 unused slots and the
one unidentified counter (`0x4282`). More power-user tools will land here later.

## Status

v0.4. **Monsters** lists every roster monster in in-game order with hunt counts, card + game sizes,
crown / min-size / max-size tags, Everything / Crown-only / Captured views, and the Advanced slot view.
**Hunter** and **Quests** are placeholders for later passes.

Dataset is auto-generated from the `offset maps/` ground truth and verified against the untouched Daigo
save (family Hunted sums reproduce the guild-card cache 31/31; `slain = captured + 0x21C` for all 90 slots).

## Credits

- **SaveTools** — vnctdj (PPSSPP forums), decrypt/encrypt.
- **ryin77** — GameFAQs crown-size % guide (legal ranges).
- **willthehunter** — MH-Freedom Quest Editor size tables.
- Offset & crown mapping done by edit-test on an untouched JP (Daigo) save.

Not affiliated with Capcom. For personal, offline use.
