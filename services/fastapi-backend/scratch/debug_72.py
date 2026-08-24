import asyncio
from app.repositories.assessment_repository import AssessmentRepository
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from app.services.question_bank_service import QuestionBankService
from app.services.assessment_service import AssessmentService

async def main():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/recruitmentinstitute')
    async with AsyncSession(engine) as db:
        repo = AssessmentRepository(db)
        q_svc = QuestionBankService(repo, AssessmentService(repo))
        try:
            res = await q_svc.get_or_auto_generate_for_course(72)
            print("Assessment ID:", res.id)
        except Exception as e:
            print("Error:", repr(e))

asyncio.run(main())
