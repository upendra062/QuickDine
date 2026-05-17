from pydantic import BaseModel


class AdminLogin(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"


class GuestSessionCreate(BaseModel):
    name: str
    phone: str | None = None
    table_id: int


class GuestSessionOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    name: str
    phone: str | None
    table_id: int
    is_premium: bool = False
