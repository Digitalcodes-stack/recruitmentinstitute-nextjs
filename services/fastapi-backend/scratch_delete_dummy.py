import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def main():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/recruitment_institute')
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with async_session() as session:
        await session.execute(text("DELETE FROM assessments WHERE assessment_name = 'Course 22 Assessment'"))
        await session.commit()
        print('Deleted dummy assessment')

if __name__ == '__main__':
    asyncio.run(main())
