import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

async def main():
    engine = create_async_engine('postgresql+asyncpg://postgres:postgres@localhost:5432/recruitment_institute')
    async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)
    
    async with async_session() as session:
        # Check if assessment exists for course 22
        res = await session.execute(text('SELECT id FROM assessments WHERE course_id = 22'))
        row = res.fetchone()
        if not row:
            # Create assessment
            await session.execute(text('''
                INSERT INTO assessments (course_id, assessment_name, total_marks, duration_minutes, created_at)
                VALUES (22, 'Course 22 Assessment', 2, 5, NOW())
            '''))
            res = await session.execute(text('SELECT id FROM assessments WHERE course_id = 22'))
            row = res.fetchone()
            
        assessment_id = row[0]
        
        # Check if questions exist
        res = await session.execute(text(f'SELECT id FROM question_bank_items WHERE assessment_id = {assessment_id}'))
        q_row = res.fetchone()
        if not q_row:
            # Create dummy questions
            await session.execute(text(f'''
                INSERT INTO question_bank_items (assessment_id, topic_name, question_text, option_a, option_b, option_c, option_d, correct_option, difficulty, generated_by, sort_order, created_at)
                VALUES 
                ({assessment_id}, 'General', 'What is 2+2?', '3', '4', '5', '6', 'B', 'easy', 'script', 0, NOW()),
                ({assessment_id}, 'General', 'What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C', 'easy', 'script', 1, NOW())
            '''))
            
            await session.execute(text(f'''
                INSERT INTO assessment_questions (assessment_id, question_type, topic, question_text, options, correct_answer, difficulty, generated_by, points)
                VALUES 
                ({assessment_id}, 'mcq', 'General', 'What is 2+2?', '["3", "4", "5", "6"]', '4', 'easy', 'script', 1),
                ({assessment_id}, 'mcq', 'General', 'What is the capital of France?', '["London", "Berlin", "Paris", "Madrid"]', 'Paris', 'easy', 'script', 1)
            '''))
            
        await session.commit()
        print('Assessment created for course 22!')

if __name__ == '__main__':
    asyncio.run(main())
