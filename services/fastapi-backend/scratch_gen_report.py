import asyncio
from pathlib import Path

from app.db.session import async_session_factory
from app.repositories.assessment_repository import AssessmentRepository
from app.services.report_service import ReportService


async def main():
    async with async_session_factory() as db:
        repo = AssessmentRepository(db)
        out_dir = Path(
            r"C:\Users\Admin\AppData\Local\Temp\claude\d--xampp-htdocs-recruitmentinstitute-nextjs"
            r"\ae49f94d-7f4f-47f6-97ce-6a899ca9a12d\scratchpad\pdf_diag"
        )
        service = ReportService(repo=repo, storage_root=out_dir)
        report = await service.generate_pdf(20)
        await db.commit()
        print("generated:", report.file_path, report.status)


asyncio.run(main())
