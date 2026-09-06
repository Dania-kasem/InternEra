from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ANTHROPIC_API_KEY: str = ""
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_MODEL: str = "minimax/minimax-m2.5:free"
    OPENROUTER_FALLBACK_MODEL: str = "google/gemini-2.5-flash:free"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
