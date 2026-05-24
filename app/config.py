from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    APP_NAME: str = "Lumora"
    VERSION: str = "1.0.0"

    OPENAI_API_KEY: str = ""
    GROQ_API_KEY: str
    BACKEND_URL: str = ""

    class Config:
        env_file = ".env"


settings = Settings()