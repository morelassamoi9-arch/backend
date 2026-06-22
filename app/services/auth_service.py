from app.auth.security import hash_password, verify_password

def create_user(db, user_data):
    user_data.password = hash_password(user_data.password)
    db.add(user_data)
    db.commit()
    db.refresh(user_data)
    return user_data


def authenticate_user(db, email, password):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not verify_password(password, user.password_hash):
        return None

    return user
