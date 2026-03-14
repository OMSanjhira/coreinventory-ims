from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "password"
    DB_NAME: str = "database"
    
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "https://hntechno.com",
    ]
    
    # Security
    SECRET_KEY: str = "your-super-secret-key-for-hackathon-123"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours for hackathon convenience

    @property
    def DATABASE_URL(self) -> str:
        # Support for PostgreSQL/MySQL - current hackathon uses postgresql format but pymysql is in requirements?
        # Re-check: the original used f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        return f"postgresql://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
