import os
import sqlalchemy as sa

# Load DB URL from environment or .env
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    # fallback to .env file parsing
    from pathlib import Path
    env_path = Path('.env')
    for line in env_path.read_text().splitlines():
        if line.startswith('DATABASE_URL='):
            DATABASE_URL = line.split('=',1)[1].strip()
            break

engine = sa.create_engine(DATABASE_URL)

tables = [
    'users',
    'fastapi_audit_logs',
    'fastapi_notifications',
    'fastapi_enrollments',
    'fastapi_courses',
    'fastapi_trainers',
    'email_logs',
    'refresh_tokens',
    'student_trainer_mapping',
    'student_resumes',
    'placement_tracking',
    'meeting_attendees',
    'meetings',
]

with engine.connect() as conn:
    for t in tables:
        try:
            result = conn.execute(sa.text(f'SELECT COUNT(*) FROM {t}'))
            count = result.scalar()
            print(f"{t}: {count}")
        except Exception as e:
            print(f"{t}: error {e}")
