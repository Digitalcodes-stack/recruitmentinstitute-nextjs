from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class TrainerAnalytics(Base):
    __tablename__ = "trainer_analytics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trainer_id: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    batch_id: Mapped[int | None] = mapped_column(Integer, nullable=True, index=True)
    average_score: Mapped[float] = mapped_column(Float, default=0.0)
    pass_rate: Mapped[float] = mapped_column(Float, default=0.0)
    weak_topics: Mapped[list] = mapped_column(JSON, default=list)
    strong_topics: Mapped[list] = mapped_column(JSON, default=list)
    assessment_completion_rate: Mapped[float] = mapped_column(Float, default=0.0)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
