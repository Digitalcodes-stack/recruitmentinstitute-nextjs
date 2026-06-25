from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from app.core.exceptions import ServiceError
from app.models.resume import StudentResume
from app.repositories.resume_repository import ResumeRepository
from app.schemas.resume import ResumeRead

ALLOWED_MIME_TYPES = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}
MAX_FILE_SIZE = 5 * 1024 * 1024


@dataclass
class ResumeService:
    repo: ResumeRepository
    storage_root: Path

    async def upload(self, student_id: int, file: UploadFile) -> StudentResume:
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise ServiceError("Unsupported file type. Only PDF, DOC, and DOCX are allowed.", 400)

        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise ServiceError("File too large. Maximum size is 5 MB.", 400)

        self.storage_root.mkdir(parents=True, exist_ok=True)
        ext = ALLOWED_MIME_TYPES[file.content_type]
        stored_name = f"resume-{student_id}-{uuid4().hex}{ext}"
        file_path = self.storage_root / stored_name
        file_path.write_bytes(content)

        row = StudentResume(
            student_id=student_id,
            filename=stored_name,
            original_filename=file.filename or stored_name,
            file_path=str(file_path),
            mime_type=file.content_type,
            file_size=len(content),
        )
        return await self.repo.create(row)

    async def get_resume(self, student_id: int, resume_id: int) -> ResumeRead:
        resume = await self.repo.get_for_student(student_id, resume_id)
        if not resume:
            raise ServiceError("Resume not found", 404)
        return ResumeRead.model_validate(resume)
