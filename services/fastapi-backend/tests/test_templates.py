from app.services.templates import TemplateRenderer


def test_template_renderer_renders_enrollment_email():
    html = TemplateRenderer().render("enrollment_approved.html", {"name": "Sam", "course_title": "Python"})
    assert "Sam" in html
    assert "Python" in html

