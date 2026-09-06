# InternEra Final Sign-off Template

Date:
Verifier:
Branch/Build:

## 1) Automated Evidence

- [ ] `backend/DEMO_SMOKE_RESULT.md` generated
- [ ] Smoke check command used:
  - `powershell -ExecutionPolicy Bypass -File .\backend\run_demo_verification.ps1`

Paste summary block from `DEMO_SMOKE_RESULT.md`:

```
<paste summary here>
```

## 2) Student Flow Evidence

- [ ] Student login successful
- [ ] Internship search shows 5-9 internships with match scores
- [ ] Internship details page shows match score and apply state
- [ ] Apply flow creates application and appears in tracking/report
- [ ] Student CV view/download works

Screenshots:
- Search page:
- Internship details:
- Applications/Tracking:
- Student report:
- CV view:

## 3) Company Flow Evidence

- [ ] Company login successful
- [ ] Dashboard shows internships + top accepted students
- [ ] Applicants page supports filtering by status/match
- [ ] Accept/reject persists after refresh
- [ ] Company report reflects updated statuses/scores
- [ ] Company CV download works

Screenshots:
- Company dashboard:
- Applicants list + filter:
- Status update (before/after):
- Company report:
- Company CV view/download:

## 4) Data Consistency After Refresh/Re-login

- [ ] Student data consistent after refresh/re-login
- [ ] Company data consistent after refresh/re-login
- [ ] Report counters align with applicant/application lists

Notes:

## 5) Final Requirement Mapping

### Student Panel Features
- [ ] Implemented and verified on live backend

### Company Panel Features
- [ ] Implemented and verified on live backend

### Backend Integration Work
- [ ] JWT + endpoint integration verified

### UI/UX Enhancements
- [ ] Dark/light mode and routing behavior verified

### Testing and Demo Data
- [ ] Seeded demo data + runtime updates verified

## Final Decision

- [ ] PASS - objective complete
- [ ] FAIL - remaining gaps listed below

Remaining gaps (if any):

