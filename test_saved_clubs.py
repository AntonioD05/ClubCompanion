import asyncio
from services.saved_clubs_service import get_saved_clubs, save_club, unsave_club, is_club_saved

async def test():
    student_id = 1  # Replace with a valid student ID from your database
    club_id = 1     # Replace with a valid club ID from your database
    
    try:
        print(f"Testing saved clubs functionality for student {student_id} and club {club_id}...")
        
        # Check if club is already saved
        is_saved = await is_club_saved(student_id, club_id)
        print(f"Is club {club_id} already saved? {is_saved}")
        
        # Save the club
        save_result = await save_club(student_id, club_id)
        print(f"Save club result: {save_result}")
        
        # Get all saved clubs
        saved_clubs = await get_saved_clubs(student_id)
        print(f"Saved clubs for student {student_id}:")
        for club in saved_clubs:
            print(f"  - {club['name']} (ID: {club['id']})")
        
        # Check if club is now saved
        is_saved = await is_club_saved(student_id, club_id)
        print(f"Is club {club_id} saved now? {is_saved}")
        
        # Unsave the club
        unsave_result = await unsave_club(student_id, club_id)
        print(f"Unsave club result: {unsave_result}")
        
        # Check if club is still saved
        is_saved = await is_club_saved(student_id, club_id)
        print(f"Is club {club_id} still saved? {is_saved}")
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(test()) 