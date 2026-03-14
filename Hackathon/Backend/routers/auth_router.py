from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from database.connection import get_db
from models.user import User
from schemas.user_schema import (
    UserCreate, LoginRequest, ForgotPasswordRequest, VerifyOTPRequest, ResetPasswordRequest
)
from services import auth_service
from services.auth_deps import get_current_user
from utils.response_wrapper import success_response, error_response
from core.limiter import limiter

router = APIRouter()


@router.post("/register")
def register(data: UserCreate, db: Session = Depends(get_db)):
    user = auth_service.register_user(db, data)
    return success_response(
        data={"id": str(user.id), "email": user.email, "name": user.name, "role": user.role},
        message="User registered successfully",
        status_code=201,
    )


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    result = auth_service.login_user(db, data.email, data.password)
    user = result["user"]
    return success_response(
        data={
            "access_token": result["access_token"],
            "token_type": result["token_type"],
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "role": user.role,
            },
        },
        message="Login successful",
    )


@router.post("/forgot-password")
@limiter.limit("3/minute")
def forgot_password(request: Request, data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    result = auth_service.generate_otp(db, data.email)
    return success_response(data=result, message="OTP generated")


@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    result = auth_service.verify_otp(db, data.email, data.otp)
    return success_response(data=result, message="OTP verified")


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    result = auth_service.reset_password(db, data.reset_token, data.new_password)
    return success_response(data=result, message="Password reset successfully")


@router.get("/me")
def me(current_user: User = Depends(get_current_user)):
    return success_response(
        data={
            "id": str(current_user.id),
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
            "is_active": current_user.is_active,
        },
        message="Current user",
    )
