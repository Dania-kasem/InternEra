$ErrorActionPreference = "Stop"

Write-Host "=== InternEra Demo Verification ===" -ForegroundColor Cyan
Write-Host ("Started: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")) -ForegroundColor Gray

Write-Host "`n[1/3] Loading schema + demo data..." -ForegroundColor Yellow
python load_demo_data.py --with-schema

Write-Host "`n[2/3] Running backend smoke check..." -ForegroundColor Yellow
python demo_smoke_check.py

Write-Host "`n[3/3] Done." -ForegroundColor Green
Write-Host "Artifacts:" -ForegroundColor Cyan
Write-Host " - backend/DEMO_SMOKE_RESULT.md"
Write-Host " - DEMO_VERIFICATION_CHECKLIST.md (manual UI validation)"
Write-Host ("Finished: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")) -ForegroundColor Gray

