import asyncio

async def main():
    print("Zero args:", await asyncio.gather())

asyncio.run(main())
