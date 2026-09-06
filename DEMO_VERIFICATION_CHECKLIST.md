# InternEra Demo Verification Checklist

Use this checklist to prove end-to-end completion of the student/company live-backend objective.

## 0) Seed and Start

1. Start backend and frontend.
2. From `backend` folder run:
   - `python load_demo_data.py --with-schema`
3. (Optional but recommended) Run automated endpoint smoke check:
   - `python scripts/demo_smoke_check.py`
4. Confirm backend logs show successful startup and no fatal errors.

Pass criteria:
- Demo data is loaded (5-9 internships visible in student search).

## 1) Auth + Routing

1. Login as student.
2. Open student-only pages (`/student/dashboard`, `/student/search`, `/student/report`).
3. Logout.
4. Login as company.
5. Open company-only pages (`/company/dashboard`, `/company/internships`, `/company/report`).

Pass criteria:
- Protected pages load for correct role.
- Unauthorized role/page access is blocked/redirected.

## 2) Student Flow

1. Upload CV (PDF) from student page.
2. Open CV view.
3. Open student search and verify AI match values are shown.
4. Open internship details and compare displayed match score.
5. Apply to one internship.
6. Open track/report pages and confirm application appears with status + score.

Pass criteria:
- CV upload succeeds and CV view/download works.
- Match score is not stuck at stale zero when profile skills exist.
- Applied internship appears in tracking/report with backend status.

## 3) Company Flow

1. Open company dashboard and confirm internship list/cards are populated from backend.
2. Open applicants for one internship.
3. Filter by status and match threshold.
4. Accept or reject one applicant.
5. Refresh page and confirm status persists.
6. Open company report and confirm updated status/match is reflected.
7. Open applicant CV and download.

Pass criteria:
- Applicant updates persist after refresh.
- Report metrics and tables reflect backend state.
- CV retrieval works from company flow.

## 4) Data Consistency Checks

1. Refresh browser and re-login.
2. Re-open student report and company report.
3. Confirm counts and statuses remain consistent.

Pass criteria:
- Data remains correct after refresh/re-login.
- No critical view is driven only by stale browser cache.

## 5) Evidence Capture (for final sign-off)

Capture these screenshots/log snippets:

1. Student search list with 5-9 internships and match scores.
2. Student report with status distribution and match values.
3. Company applicants page showing filters and status update.
4. Company report page reflecting updated values.
5. Backend log snippet showing successful API calls for apply/status/report/CV.

Pass criteria:
- All 5 evidence items are captured and match UI behavior claims.
