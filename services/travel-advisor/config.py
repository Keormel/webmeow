from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore", env_ignore_empty=True)

    port: int = 3004
    gemini_api_key: str = ""
    gemini_model: str = ""
    gemini_temperature: float = 0.6
    beach_service_url: str = "http://localhost:8080"
    max_profiles: int = 500
    profile_ttl: int = 3600


settings = Settings()
