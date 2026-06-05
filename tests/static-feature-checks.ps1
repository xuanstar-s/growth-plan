$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$html = Get-Content -Raw -Encoding UTF8 (Join-Path $root "index.html")
$js = Get-Content -Raw -Encoding UTF8 (Join-Path $root "app.js")
$css = Get-Content -Raw -Encoding UTF8 (Join-Path $root "styles.css")

$checks = @(
  @{ Name = "photo input exists"; Text = $html; Pattern = 'id="photoInput"' },
  @{ Name = "photo input opens camera"; Text = $html; Pattern = 'capture="environment"' },
  @{ Name = "sugar budget card exists"; Text = $html; Pattern = 'id="sugarBudgetCard"' },
  @{ Name = "sugar limit input exists"; Text = $html; Pattern = 'id="sugarLimitInput"' },
  @{ Name = "meal slot grid exists"; Text = $html; Pattern = 'id="mealSlotGrid"' },
  @{ Name = "estimate categories exist"; Text = $html; Pattern = 'id="estimateCategoryGrid"' },
  @{ Name = "intake list exists"; Text = $html; Pattern = 'id="intakeList"' },
  @{ Name = "app models intake items"; Text = $js; Pattern = 'intakeItems' },
  @{ Name = "app calculates sugar budget"; Text = $js; Pattern = 'calculateSugarBudget' },
  @{ Name = "app deletes intake items"; Text = $js; Pattern = 'deleteIntakeItem' },
  @{ Name = "app has default 25g limit"; Text = $js; Pattern = 'limit: 25' },
  @{ Name = "styles include budget card"; Text = $css; Pattern = '.budget-card' },
  @{ Name = "styles include photo preview"; Text = $css; Pattern = '.photo-preview' },
  @{ Name = "styles include intake group"; Text = $css; Pattern = '.intake-group' }
)

$failures = @()

foreach ($check in $checks) {
  if ($check.Text -notlike "*$($check.Pattern)*") {
    $failures += $check.Name
  }
}

if ($failures.Count) {
  Write-Host "FAIL static feature checks"
  foreach ($failure in $failures) {
    Write-Host "- $failure"
  }
  exit 1
}

Write-Host "PASS static feature checks"
