from src.utils.db import engine, Base
from src.user.models import User
from src.tasks.models import Task, TaskSubmission
Base.metadata.create_all(bind=engine)

print("All tables created successfully!")