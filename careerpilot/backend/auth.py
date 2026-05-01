from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from database import supabase

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not supabase:
        raise HTTPException(status_code=500, detail="Database connection not configured")
    try:
        response = supabase.auth.get_user(token)
        if response.user is None:
            raise credentials_exception
        return {"id": response.user.id, "email": response.user.email}
    except HTTPException:
        raise
    except Exception:
        raise credentials_exception

oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

async def get_optional_user(token: str = Depends(oauth2_scheme_optional)):
    if not token or not supabase:
        return None
    try:
        response = supabase.auth.get_user(token)
        if response.user is None:
            return None
        return {"id": response.user.id, "email": response.user.email}
    except Exception:
        return None
