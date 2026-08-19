# Generated files

Some files the viewer loads are **generated** from source material, not written by hand.
Editing a generated file directly means the next regeneration overwrites your change, and
letting a source change without regenerating means the live site and an offline copy of the
same folder disagree with each other.

## Repository layout rule

`docs/` holds **only** what the website needs to run — GitHub Pages publishes that folder.
Everything else (source spreadsheets, notes, this file) lives outside it.

```
repo/
  README.md                        documentation, not published
  INTERNAL_NOTES.md                offsets and proofs, not published
  GENERATED_FILES.md               this file
  docs/                            <- published by GitHub Pages
    index.html  styles.css  app.js  decryptor.js
    item_master_table.csv          fetched at startup
    equipment_full_table.csv       fetched at startup
    item_data_fallback.js          generated, loaded by index.html
    equipment_data_fallback.js     generated, loaded by index.html
    images/mhfu-background.png
```

The three source spreadsheets are **not part of the repository** — they are kept outside it
(`uploads/MHFU_obtainable_items.xlsx`, `uploads/MHFU_farmable_materials.csv`,
`uploads/MHFU_tradeable_shortcut_risk.csv`) and referenced
here only to record where the generated columns came from.

## What is generated from what

| Generated | Source | Carries |
|---|---|---|
| `docs/item_master_table.csv` — columns `rarity`, `grindable`, `tradeable` | `MHFU_obtainable_items.xlsx` (sheet **Items**, column **Rarity**), `MHFU_farmable_materials.csv` (column `item_id`) and `MHFU_tradeable_shortcut_risk.csv` (column `item_id`) — all kept outside the repo | rarity per item id; `yes`/`no` for the grindable list; `yes`/`no` for buyable-or-tradeable |
| `docs/item_data_fallback.js` | `docs/item_master_table.csv` | every column the viewer reads, one pipe-separated line per item |
| `docs/equipment_data_fallback.js` | `docs/equipment_full_table.csv` | name, class, rarity, G-weapon flag, rarity-9/10 flag, attack |

The other columns of `item_master_table.csv` (the five name sets, `item_tag`, `storable`,
`is_decoration`, `max_stack`, `special`) are original data — nothing generates them.

## Rules that the generation follows

- **Rarity.** Values `1`–`5` pass through. Where the spreadsheet says *not published*, the
  value becomes `4-5`: those items are all rarity 4 or 5, so they must never count as low
  rarity. Item **902 Legend Coin G** is pinned to `5` (user-confirmed). Decoration jewels are
  all in the `4-5` group for now; splitting them into exact 4 or 5 is a later pass.
- **Grindable.** Every `item_id` in `MHFU_farmable_materials.csv` is marked `yes`, as-is —
  675 ids, all of which happen to be storable. The tracker's grindable denominator is
  counted from this column at load time, not hardcoded.
- **Tradeable.** Every `item_id` in `MHFU_tradeable_shortcut_risk.csv` is marked `yes` — 76 ids,
  items you can shortcut rather than farm (bought with Zenny or Pokke Points, or handed over in
  bulk by another player). The *Hide buyable / tradeable* checkbox hides **rarity 1–3 OR this
  flag**, so the column only needs to carry what rarity alone would miss: 71 of the 76 are already
  rarity 1–3, and the 5 that are not (16 Mega Demondrug, 19 Mega Armorskin, 115 Dragon S,
  158 Antidote Flute, 266 Screamer) are rarity 4–5 craftable purely from buyable and tradeable
  inputs.
- **Fallback name columns.** A name equal to `name_ULES` is stored as `=` to keep the file
  small; the loader expands it back.

## Regenerating

There is no build step to run — ask Claude to regenerate, naming what changed:

- edited a **rarity** in the xlsx, or added/removed rows in the **farmable** or **tradeable** csv
  → regenerate `item_master_table.csv`'s generated columns, then `item_data_fallback.js`
- edited **any other column** of `item_master_table.csv`
  → regenerate `item_data_fallback.js`
- edited `equipment_full_table.csv`
  → regenerate `equipment_data_fallback.js`

## Why the fallbacks exist

`app.js` fetches the two CSVs at startup. Browsers block that fetch on `file://`, so opening
`index.html` straight off a disk would leave every row showing a bare id. Script tags are not
blocked, so `index.html` also loads the two fallback `.js` files; `app.js` reads them only in
the `.catch()` branch. On the live site they are downloaded but unused.
