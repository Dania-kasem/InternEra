from app.services.ai_service import parse_cv, match_cv_to_internship, AIServiceError

cv_text = """
My name is Ahmad.
I study Information Systems.
I know Python, SQL, HTML, CSS, and basic JavaScript.
I built a student registration system using Python and PostgreSQL.
"""

internship_text = """
Backend Intern needed.
Requirements:
Python, FastAPI, PostgreSQL, SQL, API development.
Nice to have: React.
"""

print("CV ANALYSIS:")
try:
    print(parse_cv(cv_text))
except AIServiceError as e:
    print(f"Error: {e}")

print("\nMATCH RESULT:")
try:
    print(match_cv_to_internship(cv_text, internship_text))
except AIServiceError as e:
    print(f"Error: {e}")