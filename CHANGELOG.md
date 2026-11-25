# Changelog

All notable changes to the skill. Dates are YYYY-MM-DD.

## 2026-11-25
- **Bilingual layout**: in 双语 mode the Chinese of any text over ~40 characters starts on its own line with a side bar, so it never runs on after the English. Headings and short labels stay inline.
- **💾 Save & load** (`#/save`): export progress as a save code (copy) or a `.txt` file and import it in another browser or device. Line 1 of the code shows the storage format, page version, export time, browser and OS, counts and a checksum; damaged or cut-off codes are refused. Import previews the save against the current data, merges (newest record wins) or replaces, writes all-or-nothing and can be undone.
- **Storage format version** (`SAVE_FMT`, `_meta`) with a migration hook, so later structure changes can upgrade old progress.
- **Page versions**: `manifest.json` `version` (major.minor) with `{version}` in title, brand and output name; `SITE.version` appears in save codes and the AI report.
- `verify.py` tests the save-code round trip, merge, undo and damaged codes on every build.
- New `references/design.md`: where progress lives, why question ids must only be appended, save-code format, version rules.

## 2026-11-24
- Initial public release.
