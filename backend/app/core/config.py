from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Digital Urpaq"
    API_V1_PREFIX: str = "/api"

    DATABASE_URL: str = "postgresql+psycopg2://digital_urpaq:digital_urpaq_password@localhost:5432/digital_urpaq"
    SECRET_KEY: str = "change-me-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    INITIAL_ADMIN_EMAIL: str = "admin@digitalurpaq.local"
    INITIAL_ADMIN_PASSWORD: str = "ChangeMe123!"
    ENABLE_DEMO_SEED: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)


settings = Settings()
