from dataclasses import dataclass
from jinja2 import Environment, DictLoader, select_autoescape


TEMPLATES = {
    "enrollment_request_submitted.html": """
    <p>Hello {{ name }},</p>
    <p>Your enrollment request for <strong>{{ course_title }}</strong> has been submitted successfully.</p>
    """,
    "enrollment_approved.html": """
    <p>Hello {{ name }},</p>
    <p>Your enrollment for <strong>{{ course_title }}</strong> has been approved.</p>
    """,
    "enrollment_rejected.html": """
    <p>Hello {{ name }},</p>
    <p>Your enrollment for <strong>{{ course_title }}</strong> was rejected.</p>
    <p>{{ note or '' }}</p>
    """,
    "trainer_assigned.html": """
    <p>Hello {{ name }},</p>
    <p>A trainer has been assigned to you: <strong>{{ trainer_name }}</strong>.</p>
    """,
    "meeting_scheduled.html": """
    <p>Hello {{ name }},</p>
    <p>Your meeting <strong>{{ title }}</strong> is scheduled for {{ start_time }}.</p>
    {% if meeting_url %}<p>Join here: <a href="{{ meeting_url }}">{{ meeting_url }}</a></p>{% endif %}
    """,
    "meeting_reminder.html": """
    <p>Hello {{ name }},</p>
    <p>This is a reminder for your upcoming meeting <strong>{{ title }}</strong> at {{ start_time }}.</p>
    {% if meeting_url %}<p>Join here: <a href="{{ meeting_url }}">{{ meeting_url }}</a></p>{% endif %}
    """,
    "placement_status_updated.html": """
    <p>Hello {{ name }},</p>
    <p>Your placement status for <strong>{{ job_title }}</strong> at {{ company_name }}</strong> has been updated to {{ stage }}.</p>
    """,
}


@dataclass
class TemplateRenderer:
    env: Environment = Environment(
        loader=DictLoader(TEMPLATES),
        autoescape=select_autoescape(["html", "xml"]),
    )

    def render(self, template_name: str, context: dict) -> str:
        return self.env.get_template(template_name).render(**context)

