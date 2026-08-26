import asyncio
import asyncpg
import bcrypt

async def check():
    conn = await asyncpg.connect('postgresql://postgres:postgres@localhost:5432/recruitmentinstitute')
    
    admins = await conn.fetch('SELECT email, password, "isActive" FROM user_admin')
    students = await conn.fetch('SELECT email, password, "isActive" FROM students')
    members = await conn.fetch('SELECT email, password, "isActive" FROM tbl_membership')
    candidates = await conn.fetch('SELECT email, password, "acceptSignin" FROM tbl_candidate')
    trainers = await conn.fetch('SELECT email, password, "isActive" FROM trainers')

    print(f'=== ADMINS ({len(admins)}) ===')
    for a in admins:
        print(' Admin:', a['email'], 'isActive:', a['isActive'])
        
    print(f'\n=== STUDENTS ({len(students)}) ===')
    for s in students[:6]:
        try:
            match = bcrypt.checkpw(b'Student@123', s['password'].encode('utf-8')) if s['password'] else False
        except Exception:
            match = False
        print(' Student:', s['email'], 'isActive:', s['isActive'], 'matches Student@123:', match)

    print(f'\n=== TRAINERS ({len(trainers)}) ===')
    for t in trainers:
        try:
            match = bcrypt.checkpw(b'Trainer@123', t['password'].encode('utf-8')) if t['password'] else False
        except Exception:
            match = False
        print(' Trainer:', t['email'], 'isActive:', t['isActive'], 'matches Trainer@123:', match)

    print(f'\n=== MEMBERS ({len(members)}) ===')
    for m in members:
        try:
            match = bcrypt.checkpw(b'Member@123', m['password'].encode('utf-8')) if m['password'] else False
        except Exception:
            match = False
        print(' Member:', m['email'], 'isActive:', m['isActive'], 'matches Member@123:', match)

    print(f'\n=== CANDIDATES ({len(candidates)}) ===')
    for c in candidates[:6]:
        try:
            match = bcrypt.checkpw(b'Cand@123', c['password'].encode('utf-8')) if c['password'] else False
        except Exception:
            match = False
        print(' Candidate:', c['email'], 'acceptSignin:', c['acceptSignin'], 'matches Cand@123:', match)

    await conn.close()

if __name__ == '__main__':
    asyncio.run(check())
