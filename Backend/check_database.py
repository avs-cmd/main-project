
from sqlalchemy import text
from src.utils.db import engine

try:
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT current_database(), current_user")
        )
        print("Python database connection:", result.fetchone())

        count = connection.execute(
            text("SELECT COUNT(*) FROM users")
        )
        print("Total users:", count.scalar())

except Exception as error:
    print("Database error:", error)
