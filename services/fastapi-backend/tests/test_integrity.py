from app.models import Base


def test_model_table_names_are_registered():
    expected = {
        "meetings",
        "meeting_attendees",
        "placement_tracking",
        "student_resumes",
    }
    assert expected.issubset(set(Base.metadata.tables.keys()))
