# Sugar Acne Control PWA Design

## Goal

Build a mobile-first HTTPS-friendly web app for iPhone that helps the user reduce high-sugar intake and observe how sugar-related habits correlate with acne, oiliness, sleep, and breakouts.

The app is not a diabetes or medical glucose tracker. It is a lightweight daily behavior tracker for acne-prone skin, designed for long-term consistency.

## Assumptions

- The app will reuse the current static PWA structure: `index.html`, `styles.css`, `app.js`, `manifest.json`, and `service-worker.js`.
- Data stays on the device in `localStorage`.
- There is no login, backend, cloud sync, image upload, nutrition database, or precise sugar calculation in the first version.
- The target usage is iPhone Safari, including "Add to Home Screen" from an HTTPS host such as GitHub Pages.
- The first version should be simple enough to use daily in under one minute.

## Product Shape

The app becomes a single-page mobile PWA named "控糖护肤计划".

The home screen focuses on four sections:

1. Today status
2. Sugar-control check-in
3. Acne and skin observation
4. Daily tasks and 7-day trend

The interface should stay practical and quiet, matching the existing mobile planner style while changing the content from general growth planning to sugar and skin tracking.

## Core Features

### Today Status

Show the current date, today's sugar-control result, current streak, and a compact 7-day summary.

Success criteria:

- The user can immediately see whether today has been checked in.
- The streak updates from locally saved daily records.
- The app handles missed days by breaking the streak.

### Sugar-Control Check-In

The user records whether today was a sugar-control success.

Inputs:

- A two-option segmented control: success / not success.
- High-sugar sources:
  - Milk tea or sweet drink
  - Dessert or candy
  - Late-night snack
  - High-carb takeout or refined staple
  - Other
- Optional short note about the trigger or context.

Success criteria:

- Check-in is fast and works without exact sugar grams.
- The user can update today's record later.
- Selected sources are saved with today's date.

### Acne And Skin Observation

The user records simple skin signals once per day.

Inputs:

- Acne severity: 0 to 5
- Oiliness: 0 to 5
- Sleep quality: 0 to 5
- Large inflamed pimple / broken pimple: yes or no
- Optional one-sentence skin note

Success criteria:

- Scores are easy to enter on mobile.
- Broken or large pimples are tracked as a binary risk signal.
- The app does not present medical diagnosis or treatment claims.

### Daily Tasks

Provide a small task list to support behavior change:

- No sugary drink
- No dessert
- No food after dinner
- Sleep before 23:30

Success criteria:

- Each task can be checked off independently.
- Task completion contributes to today's summary.
- Tasks reset per date and are stored locally.

### 7-Day Trend

Show a compact recent trend:

- Sugar-control success days in the last 7 days
- Average acne score
- Average oiliness score
- Average sleep score

Success criteria:

- Trend data comes from local daily records.
- Missing days do not crash the view.
- The summary remains readable on iPhone screen widths.

## Data Model

Use one `localStorage` key for all records, for example `sugar-skin-records`.

Each record is keyed by local date:

```json
{
  "2026-06-05": {
    "sugarSuccess": true,
    "sugarSources": ["sweet-drink", "dessert"],
    "sugarNote": "Craved milk tea after lunch",
    "acneScore": 3,
    "oilScore": 4,
    "sleepScore": 2,
    "hasLargePimple": true,
    "skinNote": "Right cheek still red",
    "tasks": {
      "noSweetDrink": true,
      "noDessert": false,
      "noAfterDinnerFood": true,
      "sleepBefore2330": false
    }
  }
}
```

The app should normalize partial or missing records into safe defaults when rendering.

## Error Handling

- If saved JSON is invalid, show a fresh empty state instead of crashing.
- If some fields are missing from an old record, fill defaults.
- If `localStorage` write fails, keep the current in-memory state and avoid blocking the UI.
- System notifications are out of scope for the first version. The existing reminder section should be removed or replaced by the daily tracker status.

## UI Notes

- Mobile-first, max width around the existing 520px app shell.
- Use compact controls that are easy to tap on iPhone.
- Avoid nested cards and decorative complexity.
- Use restrained colors with clear status contrast:
  - Green for sugar-control success
  - Red or amber for high-sugar sources / warning states
  - Blue or neutral for trend and skin scores
- Keep Chinese interface text clear and direct.

## Out Of Scope

- Food database
- Automatic sugar grams
- Barcode scanning
- Photo upload or acne image analysis
- Medical treatment recommendations
- Cloud account sync
- Social sharing
- Push notification reliability across closed iOS Safari sessions

## Verification

Implementation should be verified by:

- Opening the app locally in a browser.
- Entering today's sugar and skin record.
- Refreshing and confirming data persists.
- Editing today's record and confirming the UI updates.
- Adding records for recent dates if needed to check 7-day trend logic.
- Checking mobile viewport layout for iPhone-sized widths.
