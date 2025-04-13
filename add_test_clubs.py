import asyncio
from services.registration_service import register_club
from models.schemas import ClubRegister

# Club data from studentdashboard.tsx
test_clubs = [
  {
    "name": "Engineering Club",
    "email": "engineering@club.com",
    "password": "clubpass123",
    "description": "A club for students interested in all fields of engineering and technology.",
    "interests": ["Technology", "Science", "Academic"]
  },
  {
    "name": "Sports Club",
    "email": "sports@club.com",
    "password": "clubpass123",
    "description": "Join us for various sports activities, tournaments, and fitness sessions.",
    "interests": ["Sports", "Health"]
  },
  {
    "name": "Art Society",
    "email": "art@club.com",
    "password": "clubpass123",
    "description": "Express your creativity through various art forms and exhibitions.",
    "interests": ["Arts", "Cultural"]
  },
  {
    "name": "Debate Team",
    "email": "debate@club.com",
    "password": "clubpass123",
    "description": "Enhance your public speaking and argumentation skills through competitive debates.",
    "interests": ["Academic", "Social"]
  },
  {
    "name": "Environmental Action",
    "email": "environment@club.com",
    "password": "clubpass123",
    "description": "Working towards campus sustainability and environmental awareness.",
    "interests": ["Environmental", "Social"]
  }
]

async def add_test_clubs():
    print("Starting to add test clubs to the database...")
    
    for club_data in test_clubs:
        try:
            club = ClubRegister(
                email=club_data["email"],
                password=club_data["password"],
                name=club_data["name"],
                description=club_data["description"],
                interests=club_data["interests"]
            )
            
            result = await register_club(club)
            print(f"Added {club_data['name']}: {result}")
            
        except Exception as e:
            print(f"Error adding {club_data['name']}: {str(e)}")
    
    print("Finished adding test clubs.")

if __name__ == "__main__":
    asyncio.run(add_test_clubs()) 