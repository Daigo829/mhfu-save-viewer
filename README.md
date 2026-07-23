# MHFU Save Viewer

A **read-only** viewer for Monster Hunter Freedom Unite / Portable 2nd G character saves.
Drop a decrypted save and it shows what the file holds — starting with the monster **size records
and hunt counts**, including the per-subspecies sizes the game stores but never displays.

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

Everything is in **guild-card order** (Giadrome = #0 … Teostra = #30).

Per monster the top row shows exactly what the guild card shows in-game:

- **Hunted** — the hunt counter, read from the guild-card cache at `0x67408`.
- **Smallest / Largest** — the displayed min and max size (cm and stored %).
- **Crowns** — `min` (small crown) and/or `max` (king crown) when the displayed size crosses that
  monster's crown threshold.

Expand a row to see the hidden breakdown: **every record — base species plus each subspecies** —
with its own smallest/largest size. Each record is tagged:

- **shown min / shown max** — this record is the one currently surfacing on your guild card.
- **hidden** — stored in the save but never shown in-game.
- **hidden min-size / hidden max-size** — a hidden subspecies record that is *itself* crown-sized,
  even though the card doesn't reveal it.

### Why subspecies matter

The guild card collapses a whole family into one line: one smallest, one largest, across the base
species **and** all its subspecies. So a Silver Rathalos or Gold Rathian size sits in your save but
is invisible in-game unless it happens to be the current record-holder. This viewer surfaces all of them.

## How the data was mapped

Size percents live in two u16 little-endian arrays (`0x40E0`–`0x4246`); displayed cm = `base × percent / 100`.
The guild-card cache at `0x67408` stores, per base species, `[u16 tag=0x001D][u16 hunted][u16 max×10][u16 min×10]`.
Every offset and base size was confirmed by forced-ramp **edit-testing** on an untouched Daigo save, not inference.

## Status

Early version. **Monsters** is populated; **Hunter** and **Quests** are placeholders for later passes.

## Credits

- **SaveTools** — vnctdj (PPSSPP forums), decrypt/encrypt.
- **ryin77** — GameFAQs crown-size % guide (legal ranges).
- **willthehunter** — MH-Freedom Quest Editor size tables.
- Offset & crown mapping done by edit-test on an untouched JP (Daigo) save.

Not affiliated with Capcom. For personal, offline use.
