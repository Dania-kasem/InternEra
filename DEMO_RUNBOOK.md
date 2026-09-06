# InternEra Demo Runbook

## Quick Start (Backend)

From `backend` directory:

0. One-command path (recommended):
   - `powershell -ExecutionPolicy Bypass -File .\run_demo_verification.ps1`

1. Seed schema + demo data:
   - `python load_demo_data.py --with-schema`
2. Run endpoint smoke check:
   - `python demo_smoke_check.py`
   - Output file generated: `backend/DEMO_SMOKE_RESULT.md`
3. Start backend API:
   - `python -m uvicorn app.main:app --reload`

## Quick Start (Frontend)

From `frontend` directory:

1. Install deps (if needed):
   - `npm install`
2. Start app:
   - `npm start`

## Demo Accounts

- Student: `lina.omar@student.yu.edu.jo` / `Test@1234`
- Company: `hr@softech.jo` / `Test@1234`

## Demo Validation Order

1. Student search/details/apply/report.
2. Company dashboard/applicants/status update/report/CV.
3. Refresh and re-login to confirm persistence.

Use:
- `DEMO_VERIFICATION_CHECKLIST.md`
- `FINAL_AUDIT_STATUS.md`
