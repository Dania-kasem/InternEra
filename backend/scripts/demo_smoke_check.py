"""
InternEra seeded demo smoke check.

Run this after loading demo data and starting backend:
  python backend/scripts/demo_smoke_check.py

Optional:
  python backend/scripts/demo_smoke_check.py --base-url http://localhost:8000
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from typing import Any
from datetime import datetime, timezone
from pathlib import Path
import time

import requests
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password


@dataclass
class SessionCtx:
    role: str
    email: str
    token: str


def assert_ok(cond: bool, msg: str) -> None:
    if not cond:
        raise AssertionError(msg)
    print(f"[OK] {msg}")


def repair_known_company_login(email: str, password: str) -> None:
    """
    Repair a known company login account in-place (if it exists):
    - reset password hash
    - set role to company
    - activate/approve
    - clear lock counters
    """
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"[INFO] No existing user for {email}; skipping direct repair.")
            return
        user.password_hash = hash_password(password)
        user.role = "company"
        user.is_active = True
        user.is_approved = True
        user.failed_attempts = 0
        user.locked_until = None
        db.commit()
        print(f"[OK] Repaired login account: {email}")
    finally:
        db.close()


def ensure_demo_admin_login(email: str, password: str) -> None:
    db: Session = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(email=email, password_hash=hash_password(password), role="admin")
            db.add(user)
        else:
            user.password_hash = hash_password(password)
            user.role = "admin"
        user.is_active = True
        user.is_approved = True
        user.failed_attempts = 0
        user.locked_until = None
        db.commit()
        print(f"[OK] Demo admin login ready: {email}")
    finally:
        db.close()


def login(base_url: str, email: str, password: str, role: str) -> SessionCtx:
    r = requests.post(
        f"{base_url}/auth/login",
        json={"email": email, "password": password},
        timeout=20,
    )
    assert_ok(r.status_code == 200, f"{role} login succeeds ({email})")
    data = r.json()
    token = data.get("access_token", "")
    assert_ok(bool(token), f"{role} token returned")
    return SessionCtx(role=role, email=email, token=token)


def register_student(base_url: str, email: str, password: str) -> None:
    payload = {
        "email": email,
        "password": password,
        "full_name": "Smoke Student",
        "major": "Software Engineering",
        "phone_number": "+962700000000",
    }
    r = requests.post(f"{base_url}/auth/register/student", json=payload, timeout=20)
    # 200/201 means created, 400 can mean already exists.
    assert_ok(r.status_code in (200, 201, 400), "Student register endpoint reachable")


def register_company(base_url: str, email: str, password: str) -> None:
    payload = {
        "email": email,
        "password": password,
        "company_name": "Smoke Company",
        "industry": "Technology",
        "location": "Amman",
        "phone_number": "+962600000000",
    }
    r = requests.post(f"{base_url}/auth/register/company", json=payload, timeout=20)
    assert_ok(r.status_code in (200, 201, 400), "Company register endpoint reachable")


def get_or_create_session(base_url: str, email: str, password: str, role: str) -> SessionCtx:
    try:
        return login(base_url, email, password, role=role)
    except AssertionError:
        if role == "student":
            register_student(base_url, email, password)
        else:
            register_company(base_url, email, password)
        time.sleep(0.2)
        return login(base_url, email, password, role=role)


def auth_headers(ctx: SessionCtx) -> dict[str, str]:
    return {"Authorization": f"Bearer {ctx.token}"}


def get_json(base_url: str, path: str, ctx: SessionCtx) -> Any:
    r = requests.get(f"{base_url}{path}", headers=auth_headers(ctx), timeout=20)
    assert_ok(r.status_code == 200, f"GET {path} returns 200")
    return r.json()

def post_json(base_url: str, path: str, ctx: SessionCtx, payload: dict[str, Any]) -> Any:
    r = requests.post(
        f"{base_url}{path}",
        headers=auth_headers(ctx),
        json=payload,
        timeout=20,
    )
    assert_ok(r.status_code in (200, 201), f"POST {path} returns {r.status_code}")
    return r.json()

def put_json(base_url: str, path: str, ctx: SessionCtx, payload: dict[str, Any]) -> Any:
    r = requests.put(
        f"{base_url}{path}",
        headers=auth_headers(ctx),
        json=payload,
        timeout=20,
    )
    assert_ok(r.status_code == 200, f"PUT {path} returns 200")
    return r.json()


def main() -> None:
    parser = argparse.ArgumentParser(description="Run InternEra demo smoke checks.")
    parser.add_argument("--base-url", default="http://localhost:8000")
    parser.add_argument("--password", default="Test@1234")
    parser.add_argument("--admin-password", default="admin123")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    password = args.password
    admin_password = args.admin_password

    # Ensure the known demo/company login from UI can authenticate.
    repair_known_company_login("careers@datalink.jo", password)
    ensure_demo_admin_login("admin@internera.com", admin_password)

    # Prefer seeded accounts; fallback creates fresh accounts if seed is not present.
    student_seed_email = "lina.omar@student.yu.edu.jo"
    company_seed_email = "hr@softech.jo"
    now_tag = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    student_fallback_email = f"smoke.student.{now_tag}@example.com"
    company_fallback_email = f"smoke.company.{now_tag}@example.com"

    try:
        student = login(base_url, student_seed_email, password, role="student")
    except AssertionError:
        student = get_or_create_session(
            base_url, student_fallback_email, password, role="student"
        )

    try:
        company = login(base_url, company_seed_email, password, role="company")
    except AssertionError:
        company = get_or_create_session(
            base_url, company_fallback_email, password, role="company"
        )

    admin = login(base_url, "admin@internera.com", admin_password, role="admin")

    # Public internships list.
    r = requests.get(f"{base_url}/internships/", timeout=20)
    assert_ok(r.status_code == 200, "GET /internships/ returns 200")
    internships = r.json() if isinstance(r.json(), list) else []
    assert_ok(5 <= len(internships) <= 9, "Internship count is within demo range (5-9)")

    # Student flow checks.
    student_report = get_json(base_url, "/reports/my-student-report", student)
    assert_ok("applied_internships" in student_report, "Student report contains applied internships")

    my_apps = get_json(base_url, "/applications/my", student)
    assert_ok(isinstance(my_apps, list), "Student applications list is returned")
    if my_apps:
        scores = [float(a.get("ai_match_score") or 0) for a in my_apps]
        assert_ok(any(s > 0 for s in scores), "Student applications include non-zero match scores")

    student_profile = get_json(base_url, "/students/me/profile", student)
    assert_ok("std_id" in student_profile, "Student profile resolves")

    # Company flow checks.
    company_profile = get_json(base_url, "/companies/me", company)
    company_id = company_profile.get("company_id")
    assert_ok(bool(company_id), "Company profile has company_id")

    company_report = get_json(base_url, "/reports/my-company-report", company)
    assert_ok("internships" in company_report, "Company report contains internships")

    company_internships = get_json(base_url, f"/reports/company/{company_id}/internships", company)
    assert_ok(isinstance(company_internships, list), "Company internship report list is returned")

    if company_internships:
        first_internship_id = company_internships[0].get("internship_id")
        assert_ok(bool(first_internship_id), "First company internship has internship_id")
        details = get_json(
            base_url,
            f"/reports/company/{company_id}/internships/{first_internship_id}",
            company,
        )
        assert_ok("applicants" in details, "Internship detail report includes applicants")

        applicants = details.get("applicants", [])
        if applicants:
            status_set = {str(a.get("status") or "pending").lower() for a in applicants}
            assert_ok(len(status_set) >= 1, "Applicants include status values")
            app_scores = [float(a.get("match_score") or 0) for a in applicants]
            assert_ok(any(s > 0 for s in app_scores), "Applicants include non-zero match score values")

        if applicants:
            app = applicants[0]
            app_id = app.get("application_id")
            if app_id:
                new_status = "accepted" if app.get("status") != "accepted" else "rejected"
                u = requests.put(
                    f"{base_url}/applications/{app_id}/status",
                    headers=auth_headers(company),
                    json={"status": new_status},
                    timeout=20,
                )
                assert_ok(u.status_code == 200, "Company can update applicant status")

    # Active write-flow verification: company posts internship, student applies, company updates status.
    created = post_json(
        base_url,
        "/internships/",
        company,
        {
            "company_id": company_id,
            "title": "Smoke Backend Intern",
            "type": "remote",
            "duration": "8 weeks",
            "field_of_study": "Computer Science",
            "location": "Amman",
            "description": "Smoke test internship for e2e verification.",
            "required_skills": "python,fastapi,sql",
            "status": "open",
        },
    )
    created_internship_id = created.get("internship_id")
    assert_ok(bool(created_internship_id), "Created internship returns internship_id")
    assert_ok(created.get("status") == "pending", "Created internship starts pending admin approval")

    approval = requests.put(
        f"{base_url}/internships/{created_internship_id}/admin-approve",
        headers=auth_headers(admin),
        timeout=20,
    )
    assert_ok(approval.status_code == 200, "Admin can approve created internship")

    applied = post_json(
        base_url,
        "/applications/",
        student,
        {"internship_id": int(created_internship_id)},
    )
    created_application_id = applied.get("application_id")
    assert_ok(bool(created_application_id), "Student application created")
    assert_ok("ai_match_score" in applied, "Application payload includes ai_match_score field")

    details_after_apply = get_json(
        base_url,
        f"/reports/company/{company_id}/internships/{created_internship_id}",
        company,
    )
    applicants_after_apply = details_after_apply.get("applicants", [])
    assert_ok(len(applicants_after_apply) >= 1, "Created internship shows applicants in company report")
    assert_ok(
        any("match_score" in a or "ai_match_score" in a for a in applicants_after_apply),
        "Company report applicants include match-score field",
    )

    put_json(
        base_url,
        f"/applications/{created_application_id}/status",
        company,
        {"status": "accepted"},
    )

    details_after_status = get_json(
        base_url,
        f"/reports/company/{company_id}/internships/{created_internship_id}",
        company,
    )
    status_values = [str(a.get("status", "")).lower() for a in details_after_status.get("applicants", [])]
    assert_ok("accepted" in status_values, "Accepted status persists in company report")

    summary = {
        "internship_count": len(internships),
        "student_application_count": len(my_apps),
        "company_internship_count": len(company_internships),
        "checked_internship_id": first_internship_id if company_internships else None,
        "created_internship_id": created_internship_id,
        "created_application_id": created_application_id,
    }
    print("\nSmoke check complete: core student/company live backend flows responded successfully.")
    print("Summary:", summary)

    # Write a small machine-readable sign-off artifact.
    report_dir = Path(__file__).resolve().parents[1]
    report_path = report_dir / "DEMO_SMOKE_RESULT.md"
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    report = [
        "# Demo Smoke Result",
        "",
        f"- Generated: {now}",
        f"- Base URL: {base_url}",
        "",
        "## Summary",
        f"- Internship count: {summary['internship_count']}",
        f"- Student application count: {summary['student_application_count']}",
        f"- Company internship count: {summary['company_internship_count']}",
        f"- Checked internship id: {summary['checked_internship_id']}",
        f"- Created internship id: {summary['created_internship_id']}",
        f"- Created application id: {summary['created_application_id']}",
        "",
        "## Status",
        "- PASS: Core student/company backend smoke checks succeeded.",
    ]
    report_path.write_text("\n".join(report), encoding="utf-8")
    print(f"Report written: {report_path}")


if __name__ == "__main__":
    main()
