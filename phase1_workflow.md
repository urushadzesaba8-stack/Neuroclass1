# Phase 1 — guided workflow

## Step 1 — Create a project folder
Unzip this package. Keep the folder named `NeuroClass_Starter`.

## Step 2 — Review the catalog
Open `data/classification_catalog.csv` in Google Sheets, Excel, or LibreOffice.
Filter by `category`. Add columns as needed:
- `primary_reference`
- `doi`
- `version`
- `calculator_required` (yes/no)
- `verification_status`
- `reviewer_notes`

## Step 3 — Deduplicate and normalize
Keep separate records for genuinely different versions. Examples:
- TICI and mTICI / eTICI variants
- Fisher and Modified Fisher
- Raymond–Roy original and modified Raymond–Roy
- original and revised Tokuhashi, where relevant

Do not merge systems merely because they share an eponym.

## Step 4 — Verify each candidate
For every entry, find the original publication or authoritative guideline. Confirm:
- intended population and clinical context
- required inputs and exact definitions
- scoring rules and thresholds
- missing / unassessable data handling
- version and limitations
- source citation and DOI/URL

## Step 5 — Mark status
Use:
- `discovered` — name found in an index
- `source_found` — authoritative source identified
- `verified` — criteria independently checked
- `implemented` — calculator coded
- `tested` — test cases pass
- `retired` — obsolete or superseded

## Step 6 — First pilot group
Recommended first pilot: mTICI, Raymond–Roy (original and modified kept distinct), Hunt–Hess, WFNS, Fisher, Modified Fisher, PHASES, Spetzler–Martin, Meyerding, Pfirrmann, Schizas, GCS, ASIA, mRS.

## Step 7 — Next phase
After the catalog is reviewed, create the database tables and import only verified records. Then implement one calculator at a time with unit tests.
