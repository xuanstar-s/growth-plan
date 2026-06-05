# Photo Sugar Meal Intake Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add iPhone-first photo sugar estimation, meal-slot intake records, daily accumulated sugar budget, and a default 25g control line to the existing "控糖计划" PWA.

**Architecture:** Keep the static PWA architecture. `index.html` adds semantic containers for the camera flow, daily sugar budget, and intake list; `app.js` manages manual photo estimate state, multi-item daily records, sugar budget calculation, and persistence; `styles.css` adds compact iPhone-first controls; `tests/static-feature-checks.ps1` provides no-dependency verification for required feature structure.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, PowerShell verification, browser manual/automated verification.

---

## File Structure

- Modify `index.html`: Add daily sugar budget card, photo capture input, photo estimate panel, meal/category/result containers, and intake list inside "今日控糖".
- Modify `app.js`: Add intake item data model, category estimates, meal slots, sugar budget calculations, photo preview object URL handling, write/delete intake behavior, and normalization for old records.
- Modify `styles.css`: Add camera button, budget card, progress bar, estimate preview, category/meal chips, result card, and grouped intake list styles.
- Create `tests/static-feature-checks.ps1`: Verify required selectors and keywords exist without requiring Node/npm.
- Keep `previews/photo-sugar-meal-preview.html`: Visual preview artifact for this feature.

---

### Task 1: Add Failing Structure Test

**Files:**
- Create: `tests/static-feature-checks.ps1`

- [ ] **Step 1: Create the static feature test**

The test checks required HTML hooks and JavaScript feature markers.

- [ ] **Step 2: Run the test before implementation**

Run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tests/static-feature-checks.ps1
```

Expected before implementation: FAIL because `photoInput`, `sugarBudget`, and `intakeItems` are not implemented yet.

---

### Task 2: Implement UI Markup

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add budget and photo estimate containers to the sugar section**

Add these elements before the existing success / miss segmented control:

- `#sugarBudgetCard`
- `#sugarLimitInput`
- `#sugarBudgetRange`
- `#sugarBudgetStatus`
- `#photoInput`
- `#photoPreviewPanel`
- `#mealSlotGrid`
- `#estimateCategoryGrid`
- `#estimateResultCard`
- `#intakeList`

- [ ] **Step 2: Keep the bottom nav unchanged**

The first implementation must not add a new nav item.

---

### Task 3: Implement State And Behavior

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Extend record defaults and normalization**

Add:

- `intakeItems: []`
- `sugarBudget: { limit: 25, estimatedMin: 0, estimatedMax: 0 }`

- [ ] **Step 2: Add meal slots and estimate categories**

Meal slots:

- breakfast / 早餐
- lunch / 午餐
- dinner / 晚餐
- snack / 加餐/饮品

Categories:

- sweet-drink / 奶茶/甜饮 / high / 25-60g / sweet-drink
- dessert / 甜点/糖果 / high / 15-50g / dessert
- takeout-carb / 外卖主食 / medium-high / 10-35g / takeout-carb
- snack-food / 零食 / medium-high / 8-30g / other
- fruit / 水果 / medium / 8-25g / other
- other / 其它 / unknown / no numeric range / other

- [ ] **Step 3: Add photo flow**

When an image is selected:

- show a compact preview from `URL.createObjectURL`
- default meal slot by current local time
- let user choose meal slot and category
- show editable min/max fields for numeric categories
- do not persist image data

- [ ] **Step 4: Add write-to-record behavior**

Writing an estimate:

- appends an item to `intakeItems`
- recalculates `sugarBudget.estimatedMin/estimatedMax`
- adds source id to `sugarSources`
- updates `sugarNote`
- marks `sugarStatus = "miss"` if risk is high/medium-high or accumulated max exceeds the limit

- [ ] **Step 5: Add delete behavior**

Deleting one item:

- removes that item
- recalculates budget
- does not automatically flip `sugarStatus` back to success

---

### Task 4: Implement Styles

**Files:**
- Modify: `styles.css`

- [ ] **Step 1: Add iPhone-first styles**

Add styles for:

- `.budget-card`
- `.budget-bar`
- `.photo-capture`
- `.photo-preview`
- `.estimate-panel`
- `.estimate-result`
- `.number-grid`
- `.intake-group`
- `.delete-button`

- [ ] **Step 2: Verify no horizontal scroll at 390px width**

Use browser viewport verification after implementation.

---

### Task 5: Verify And Publish

**Files:**
- Verify all changed files.

- [ ] **Step 1: Run static test**

Expected after implementation: PASS.

- [ ] **Step 2: Run browser verification**

Open local app, simulate selecting a file, choose categories, add breakfast/lunch/dinner records, refresh, delete one item, and verify accumulated sugar updates.

- [ ] **Step 3: Verify iPhone viewport**

At 390px width:

- no horizontal overflow
- no console errors
- budget card, photo flow, and intake list remain readable

- [ ] **Step 4: Commit and push**

Commit implementation and push `main` so GitHub Pages updates.

## Plan Self-Review

- Spec coverage: covers photo input, meal slots, category estimates, editable range, daily 25g budget, multi-item accumulation, deletion, local persistence, no image persistence, and future AI-compatible `mode`.
- Placeholder scan: no unresolved placeholder steps.
- Scope check: one cohesive PWA feature, no backend, no cloud AI, no desktop-specific behavior.
