from pydantic import BaseModel, EmailStr
from typing import Optional

# 1. Blueprint for incoming registration data
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

# 2. Blueprint for incoming login requests (This was missing!)
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

# 3. Blueprint for outgoing user responses (Hides the hashed password safely!)
class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool

    class Config:
        from_attributes = True

# 4. Blueprint for outgoing JWT access tokens
class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    email: EmailStr
    full_name: str

class TokenData(BaseModel):
    email: Optional[str] = None