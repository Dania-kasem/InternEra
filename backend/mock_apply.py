from app.services.ai_service import calculate_match_score


applications_db = []

def apply_for_internship():
    cv_text = """
    I know Python, SQL and built APIs using Flask
    """

    internship_text = """
    We need Python, FastAPI, SQL and API development
    """

    result = calculate_match_score(cv_text, internship_text)

    application = {
        "student_id": 1,
        "internship_id": 101,
        "match_score": result["score"],
        "notes": result["notes"]
    }

    applications_db.append(application)

    print("=== SAVED APPLICATION ===")
    print(application)


if __name__ == "__main__":
    apply_for_internship()