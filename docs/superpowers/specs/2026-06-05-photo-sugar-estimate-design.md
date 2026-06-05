# Photo Sugar Estimate Design

## Goal

Add an iPhone-first photo flow to the "控糖计划" app so the user can take a food photo, choose a meal slot and food category, see an estimated sugar risk and sugar range, compare daily accumulated sugar against a daily limit, then write the result into today's sugar-control record.

This first version is not full automatic AI recognition. It uses the iPhone camera for capture and manual category confirmation for the estimate. The data model leaves room for cloud AI recognition later.

## Assumptions

- The app remains a static PWA published through GitHub Pages.
- The primary device is iPhone Safari or the iPhone home-screen PWA.
- Desktop behavior is not a priority.
- The first version does not upload photos to a server.
- The first version does not require an API key, backend, account, or paid AI service.
- Sugar values are rough estimates for behavior tracking, not medical or nutrition-label precision.
- The default daily sugar limit is 25g because the user's goal is acne-conscious sugar reduction and they prefer a stricter target.

## Entry Point

Add a "拍照估算糖分" control at the top of the "今日控糖" section, above the success / miss segmented control.

The control uses an iPhone-friendly file input:

```html
<input type="file" accept="image/*" capture="environment">
```

Expected behavior:

- On iPhone, tapping the control should let the user take a food photo with the rear camera or choose an image.
- After selection, the app shows a compact preview.
- If the user cancels photo selection, the app returns to the existing sugar check-in state.

## Manual Category Estimate

After a photo is selected, show a meal slot selector:

- 早餐
- 午餐
- 晚餐
- 加餐/饮品

Then show category chips:

- 奶茶/甜饮
- 甜点/糖果
- 精制主食/外卖
- 零食
- 水果
- 不确定/其它

Each category maps to an estimate:

| Category | Risk | Sugar range | Source mapping |
| --- | --- | --- | --- |
| 奶茶/甜饮 | high | 25-60g | sweet-drink |
| 甜点/糖果 | high | 15-50g | dessert |
| 精制主食/外卖 | medium-high | 10-35g | takeout-carb |
| 零食 | medium-high | 8-30g | other |
| 水果 | medium | 8-25g | other |
| 不确定/其它 | unknown | 需要手动确认 | other |

## Result Card

After the user chooses a category, show a result card with:

- Food category
- Risk label: 低 / 中 / 中高 / 高 / 待确认
- Estimated sugar range
- Editable minimum and maximum sugar estimate fields
- Short note: "照片只能估算，请按实际分量和配料修正。"
- Primary action: "写入今日记录"
- Secondary action: "重新拍照"

The editable estimate fields let the user correct obvious mismatch from portion size or recipe:

```text
最低估算：25g
最高估算：60g
```

## Daily Sugar Limit

Add a daily sugar control card inside the "今日控糖" section.

Default values:

- Daily limit: 25g
- Ideal range: 0-15g
- Warning range: 15-25g
- Over limit: >25g

The daily limit should be editable in the card:

```text
目标上限：25g
```

The app should show estimated intake as a range because photo estimates are imprecise:

```text
今日糖分控制
估算 12-20g / 25g
还算稳
```

If the estimate exceeds the target:

```text
今日糖分控制
估算 30-50g / 25g
今天建议停止摄入甜饮和甜食
```

Status logic:

- If the upper bound is <= 15g: green / stable
- If the upper bound is > 15g and <= 25g: amber / warning
- If the lower bound is > 25g or the upper bound is > 25g: red / over limit
- Unknown estimates should show "待确认" and should not calculate progress.

## Write-To-Record Behavior

When the user taps "写入今日记录":

- Add a new intake item to today's record.
- Recalculate today's sugar intake estimate by summing every intake item's `sugarMin` and `sugarMax`.
- Set today's sugar status:
  - high or medium-high risk sets `sugarStatus` to `miss`
  - any accumulated estimate whose upper bound exceeds the daily limit sets `sugarStatus` to `miss`
  - medium or unknown risk does not overwrite an existing success/miss decision unless no decision exists
- Add the mapped source to `sugarSources`.
- Update `sugarNote` with a concise text summary:
  - Example: `拍照估算：奶茶/甜饮，高糖风险，约 25-60g`
- Re-render today's summary and 7-day trend.

The app should not force a medical or dietary judgment. It should frame the result as an estimate for self-observation.

## Data Model

Extend each daily record with multiple intake items:

```js
intakeItems: [
  {
    id: "2026-06-05T08:30:00.000Z",
    mode: "manual-photo",
    mealSlot: "breakfast",
    mealLabel: "早餐",
    category: "sweet-drink",
    label: "奶茶/甜饮",
    risk: "high",
    riskLabel: "高糖风险",
    sugarRange: "25-60g",
    sugarMin: 25,
    sugarMax: 60,
    sourceId: "sweet-drink",
    note: "照片只能估算，请按实际分量和配料修正。"
  }
]
```

Also extend each daily record with sugar budget fields:

```js
sugarBudget: {
  limit: 25,
  estimatedMin: 35,
  estimatedMax: 82
}
```

`estimatedMin` is the sum of every intake item's `sugarMin`. `estimatedMax` is the sum of every intake item's `sugarMax`.

The first implementation should support multiple intake items per day. Items are grouped visually by meal slot:

- 早餐
- 午餐
- 晚餐
- 加餐/饮品

The user should be able to delete an individual intake item if it was added by mistake. Editing an existing item can be added later; the first version can support delete + re-add.

Do not persist the original image in `localStorage`.

For the live page only, the app may keep the preview as an object URL or in-memory preview. This keeps privacy and storage under control. If the user reloads, the saved estimate remains but the image preview disappears.

## Future AI Compatibility

The data model should support a future AI flow by allowing:

- `mode: "ai-photo"`
- `detectedFoods: []`
- `confidence`
- `modelNote`

The first implementation only uses `mode: "manual-photo"`.

## Error Handling

- If no file is selected, keep the existing UI unchanged.
- If the selected file is not an image, show a short inline error and do not update the record.
- If preview generation fails, still allow manual category selection.
- If `localStorage` write fails, show the existing save failure text.
- If the user selects "不确定/其它", require no extra fields; write a conservative note that manual confirmation is needed.
- If deleting an intake item changes the accumulated estimate below the daily limit, do not automatically change `sugarStatus` back to success; leave the final daily decision to the user.

## UI Requirements

- The camera control must be easy to tap on iPhone.
- The photo preview should be compact and not dominate the page.
- Category chips should fit iPhone widths without horizontal scrolling.
- Meal slot controls should be easy to tap and should default to the likely current meal based on local time:
  - before 10:30: 早餐
  - 10:30-15:00: 午餐
  - 15:00-20:30: 晚餐
  - after 20:30: 加餐/饮品
- The result card should sit inside the existing "今日控糖" section.
- The daily sugar control card should sit in the same "今日控糖" section and remain visible without making the section feel crowded.
- Today's intake list should show accumulated items grouped by meal slot with their sugar ranges.
- The budget progress should communicate ranges honestly and avoid implying lab-grade precision.
- Keep the existing bottom navigation unchanged for the first version.

## Verification

Implementation should be verified by:

- Opening the app on an iPhone-sized viewport.
- Confirming the camera/file input is present in the sugar section.
- Selecting a local image file in desktop test mode to simulate iPhone capture.
- Choosing "奶茶/甜饮" and confirming the result shows high risk and `25-60g`.
- Editing the estimate range and confirming the daily sugar control card updates.
- Writing breakfast, lunch, and dinner intake items to today's record and refreshing the page.
- Confirming the daily sugar control card shows the accumulated min and max sugar estimate.
- Deleting one intake item and confirming the accumulated estimate decreases.
- Confirming the estimate summary persists while the image preview does not need to persist.
- Confirming an accumulated estimate above 25g marks today's sugar status as miss.
- Confirming there are no console errors and no horizontal overflow at 390px width.
