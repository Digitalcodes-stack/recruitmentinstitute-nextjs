import asyncio
from app.database import AsyncSessionLocal
from app.models import User, VirtualExecutive, Conversation
from sqlalchemy import select

async def main():
    async with AsyncSessionLocal() as db:
        users = (await db.scalars(select(User))).all()
        execs = (await db.scalars(select(VirtualExecutive))).all()
        convs = (await db.scalars(select(Conversation))).all()

        print("=" * 60)
        print("DATABASE SUMMARY (PostgreSQL: aidesk)")
        print("=" * 60)
        print(f"\n1. USERS ({len(users)} record(s)):")
        for u in users:
            print(f"   - Email: {u.email}")
            print(f"     Name:  {u.full_name}")
            print(f"     ID:    {u.id}")
            print(f"     Active:{u.is_active}")

        print(f"\n2. VIRTUAL EXECUTIVES ({len(execs)} record(s)):")
        for e in execs:
            print(f"   - Name:         {e.name}")
            print(f"     Role:         {e.role}")
            print(f"     Company:      {e.company}")
            print(f"     ID:           {e.id}")
            print(f"     Location:     {e.address}")
            print(f"     Introduction: {e.introduction}")
            print(f"     Languages:    {e.languages}")
            print(f"     Courses:      {len(e.products_services)} course(s)")
            for p in e.products_services:
                print(f"       * {p.get('title')}")
            print(f"     FAQs:         {len(e.faqs)} FAQ(s)")
            print(f"     Open Slots:   {len(e.action_slots)} slot(s)")
            for s in e.action_slots:
                print(f"       * {s.get('label')} ({s.get('date')} {s.get('start_time')}-{s.get('end_time')})")

        print(f"\n3. CONVERSATIONS ({len(convs)} record(s)):")
        for c in convs:
            print(f"   - Caller: {c.caller_name} | Executive ID: {c.executive_id} | Started: {c.started_at}")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
