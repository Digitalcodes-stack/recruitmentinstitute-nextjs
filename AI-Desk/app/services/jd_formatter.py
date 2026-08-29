"""Formats an executive's products_services entries into a plain-text job-description message for email/WhatsApp."""
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models import VirtualExecutive


def _format_role(item: dict) -> list[str]:
    """One role entry -> formatted lines. Every field beyond title/description is optional, so a JD with only the
    short summary still reads fine — this doesn't require every executive to have filled in the detailed fields."""
    title = item.get("title") or item.get("name") or "Untitled"
    lines = [f"• {title}", "=" * (len(title) + 2)]

    description = item.get("description", "")
    if description:
        lines.append(description)

    salary_range = item.get("salary_range", "")
    if salary_range:
        lines += ["", f"Salary Range: {salary_range}"]

    responsibilities = item.get("responsibilities", "")
    if responsibilities:
        lines += ["", "Responsibilities:"]
        lines += [f"  - {r.strip()}" for r in responsibilities.split("\n") if r.strip()]

    requirements = item.get("requirements", "")
    if requirements:
        lines += ["", "Requirements:"]
        lines += [f"  - {r.strip()}" for r in requirements.split("\n") if r.strip()]

    lines.append("")
    return lines


def format_jd_text(executive: "VirtualExecutive") -> str:
    lines = [f"{executive.name} — {executive.role} at {executive.company}", ""]
    if not executive.products_services:
        lines.append("No open roles/services listed yet.")
    else:
        for item in executive.products_services:
            lines += _format_role(item)
    if executive.address:
        lines.append(f"Location: {executive.address}")
    return "\n".join(lines).strip()
