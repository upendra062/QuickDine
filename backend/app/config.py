from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    DATABASE_URL: str = "postgresql+asyncpg://quickdine:quickdine_pass@localhost:5432/quickdine"
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    RAZORPAY_KEY_ID: str = "rzp_test_PLACEHOLDER"
    RAZORPAY_KEY_SECRET: str = "PLACEHOLDER_SECRET"

    FRONTEND_URL: str = "http://localhost:3000"


settings = Settings()
