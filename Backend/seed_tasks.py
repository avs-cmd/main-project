
from src.utils.db import SessionLocal
from src.tasks.models import Task

DEFAULT_TASKS = [
    {
        "title": "Referral",
        "description": "Refer a student or eligible candidate.",
        "points": 200,
    },
    {
        "title": "Team Call / Add Value",
        "description": "Participate in a team call or contribute value.",
        "points": 100,
    },
    {
        "title": "Put Up Posters",
        "description": "Put up approved physical posters.",
        "points": 100,
    },
    {
        "title": "Brochures",
        "description": "Distribute Talerang brochures.",
        "points": 100,
    },
    {
        "title": "Workshop",
        "description": "Conduct or participate in an approved workshop.",
        "points": 500,
    },
    {
        "title": "Social Media Post",
        "description": "Publish an approved social media post.",
        "points": 50,
    },
    {
        "title": "Weekly Team Call",
        "description": "Attend the weekly team call.",
        "points": 10,
    },
]


def seed_tasks():
    db = SessionLocal()

    try:
        for task_data in DEFAULT_TASKS:
            existing_task = (
                db.query(Task)
                .filter(Task.title == task_data["title"])
                .first()
            )

            if existing_task:
                print(f"Already exists: {task_data['title']}")
                continue

            db.add(Task(**task_data))
            print(f"Added: {task_data['title']}")

        db.commit()
        print("Task catalogue seeded successfully.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    seed_tasks()
