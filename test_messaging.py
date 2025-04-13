import asyncio
from services.messaging_service import get_messages

async def test():
    try:
        result = await get_messages(1, 'student')
        print("Messages:", result)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test()) 