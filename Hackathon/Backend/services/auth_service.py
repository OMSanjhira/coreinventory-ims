import random
import string
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from core import security
from core.config import settings
from models.user import User, OTPToken
from schemas.user_schema import UserCreate


# ── Register ──────────────────────────────────────────────────────────────────

def register_user(db: Session, data: UserCreate):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        password_hash=security.get_password_hash(data.password),
        role=data.role or "staff",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


# ── Login ─────────────────────────────────────────────────────────────────────

def login_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not security.verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )

    token = security.create_access_token(
        data={"sub": str(user.id), "role": user.role}
    )
    return {"access_token": token, "token_type": "bearer", "user": user}


# ── OTP: Generate ─────────────────────────────────────────────────────────────

def generate_otp(db: Session, email: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp = "".join(random.choices(string.digits, k=6))
    otp_token = OTPToken(
        user_id=user.id,
        otp=otp,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
        is_used=False,
    )
    db.add(otp_token)
    db.commit()

    # For hackathon: return OTP directly (no email needed)
    return {"otp": otp, "message": "OTP generated successfully (dev mode)"}


# ── OTP: Verify ───────────────────────────────────────────────────────────────

def verify_otp(db: Session, email: str, otp: str):
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    token = (
        db.query(OTPToken)
        .filter(
            OTPToken.user_id == user.id,
            OTPToken.otp == otp,
            OTPToken.is_used == False,
        )
        .order_by(OTPToken.expires_at.desc())
        .first()
    )
    if not token:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    if token.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="OTP has expired")

    token.is_used = True
    db.commit()

    reset_token = security.create_access_token(
        data={"sub": str(user.id), "type": "reset"},
        expires_delta=timedelta(minutes=15),
    )
    return {"reset_token": reset_token}


# ── Reset Password ────────────────────────────────────────────────────────────

def reset_password(db: Session, reset_token: str, new_password: str):
    from jose import jwt, JWTError
    try:
        payload = jwt.decode(
            reset_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        token_type = payload.get("type")
        if user_id is None or token_type != "reset":
            raise HTTPException(status_code=400, detail="Invalid reset token")
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.password_hash = security.get_password_hash(new_password)
    db.commit()
    return {"message": "Password reset successfully"}
