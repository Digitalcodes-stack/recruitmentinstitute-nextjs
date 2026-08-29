"""Self-check for JD text formatting. Run: py -m app.tests.test_jd_formatter"""
from types import SimpleNamespace

from app.services.jd_formatter import format_jd_text


def test_full_profile_with_detailed_role():
    exe = SimpleNamespace(
        name="Rupali Patil", role="Recruitment Coordinator", company="DigitalAIML",
        address="Pune, Maharashtra, India",
        products_services=[
            {
                "title": "Backend Engineer",
                "description": "Hybrid, Pune, 3-6 yrs exp",
                "salary_range": "12-18 LPA",
                "responsibilities": "Design REST APIs\nOwn database schema\nMentor junior engineers",
                "requirements": "3+ years Python\nExperience with PostgreSQL\nStrong communication skills",
            },
        ],
    )
    text = format_jd_text(exe)
    assert "Rupali Patil" in text
    assert "Backend Engineer" in text
    assert "Hybrid, Pune, 3-6 yrs exp" in text
    assert "Salary Range: 12-18 LPA" in text
    assert "Responsibilities:" in text
    assert "- Design REST APIs" in text
    assert "- Own database schema" in text
    assert "Requirements:" in text
    assert "- 3+ years Python" in text
    assert "Pune, Maharashtra, India" in text


def test_minimal_role_still_works():
    """Backward compatibility: existing data with only title+description (no new fields) must still format cleanly."""
    exe = SimpleNamespace(
        name="X", role="R", company="C", address=None,
        products_services=[{"title": "Backend Engineer", "description": "Hybrid, Pune, 3-6 yrs exp"}],
    )
    text = format_jd_text(exe)
    assert "Backend Engineer" in text
    assert "Hybrid, Pune, 3-6 yrs exp" in text
    assert "Salary Range" not in text
    assert "Responsibilities:" not in text


def test_no_roles():
    exe = SimpleNamespace(
        name="X", role="R", company="C", address=None, products_services=[],
    )
    text = format_jd_text(exe)
    assert "No open roles" in text


if __name__ == "__main__":
    test_full_profile_with_detailed_role()
    test_minimal_role_still_works()
    test_no_roles()
    print("OK: all jd_formatter self-checks passed")
