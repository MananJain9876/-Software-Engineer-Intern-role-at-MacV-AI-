from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User

# Create a database session
db = SessionLocal()

try:
    # Query all users
    users = db.query(User).all()
    
    # Print user information
    print("\nRegistered Users:\n" + "-" * 50)
    for user in users:
        print(f"ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Full Name: {user.full_name}")
        print(f"Active: {user.is_active}")
        print(f"Superuser: {user.is_superuser}")
        print("-" * 50)
    
    print(f"Total users: {len(users)}")

finally:
    # Close the database session
    db.close()