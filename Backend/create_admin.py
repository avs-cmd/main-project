
from getpass import getpass
from sqlalchemy.exc import IntegrityError

from src.utils.db import SessionLocal
from src.utils.auth import hash_password
from src.user.models import User


def create_admin():
    db = SessionLocal()

    try:
        print("\n===== TALERANG ADMIN ACCOUNT CREATION =====\n")

        name = input("Administrator name: ").strip()
        email = input("Administrator email: ").strip().lower()
        mobile = input("Mobile number: ").strip()
        college = input("Organization / college: ").strip()

        password = getpass("Set temporary password: ")
        confirm = getpass("Confirm password: ")

        if not all([name, email, mobile, college, password]):
            print("Error: All fields are required.")
            return

        if len(password) < 12:
            print("Error: Password must contain at least 12 characters.")
            return

        if password != confirm:
            print("Error: Passwords do not match.")
            return

        existing = db.query(User).filter(
            (User.email == email) |
            (User.mobile == mobile)
        ).first()

        if existing:
            print("Error: Email or mobile is already registered.")
            print("Existing account role:", existing.role)
            return

        admin = User(
            full_name=name,
            email=email,
            mobile=mobile,
            college=college,
            linkedin_url=None,
            password=hash_password(password),
            role="admin"
        )

        db.add(admin)
        db.commit()
        db.refresh(admin)

        print("\nADMIN ACCOUNT CREATED SUCCESSFULLY!")
        print("------------------------------------")
        print("ID:", admin.id)
        print("Name:", admin.full_name)
        print("Email:", admin.email)
        print("Role:", admin.role)
        print("------------------------------------")
        print("Share the temporary password privately.")

    except IntegrityError:
        db.rollback()
        print("Error: Email or mobile already exists.")

    except Exception as error:
        db.rollback()
        print("Database error:", error)

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
