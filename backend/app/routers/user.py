from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.auth.deps import get_current_admin, get_current_user, get_current_user_optional
from app.auth.hash import hash_password
from app.auth.jwt_handler import create_access_token
from app.core.config import settings
from app.database import get_db
from app.schemas import user


router = APIRouter(prefix="/auth", tags=["Auth"])

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

limiter = Limiter(key_func=get_remote_address, enabled=settings.REDIS_ENABLED)


@router.post("/register", response_model=user.UserOut)
async def create_user(
    user: schemas.user.UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User | None = Depends(get_current_user_optional),
):
    result = await db.execute(select(models.User).where(models.User.email == user.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    user_role = models.user.UserRole.client
    if current_user and current_user.is_admin:
        user_role = user.role

    db_user = models.User(
        email=user.email,
        hashed_password=hash_password(user.password),
        first_name=user.first_name,
        last_name=user.last_name,
        role=user_role,
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.get("/", response_model=list[schemas.user.UserOut])
async def get_users(
    db: AsyncSession = Depends(get_db),
    _admin: models.User = Depends(get_current_admin),
):
    result = await db.execute(select(models.user.User))
    return result.scalars().all()


@router.get("/users/{user_id}", response_model=schemas.user.UserOut)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to read this user",
        )

    result = await db.execute(select(models.user.User).where(models.user.User.id == user_id))
    user_ext = result.scalar_one_or_none()
    if not user_ext:
        raise HTTPException(status_code=404, detail="User not found")
    return user_ext


@router.post("/login")
@limiter.limit("5/minute")
async def login(request: Request, user: schemas.user.UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == user.email))
    db_user = result.scalar_one_or_none()

    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token({"sub": db_user.email})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=user.UserOut)
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete users",
        )

    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user_to_delete = result.scalar_one_or_none()

    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user_to_delete)
    await db.commit()
    return {"detail": f"User {user_id} deleted successfully"}


@router.put("/{user_id}", response_model=schemas.UserOut)
async def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this user",
        )

    result = await db.execute(select(models.User).where(models.User.id == user_id))
    db_user = result.scalars().first()

    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_update.model_dump(exclude_unset=True)

    if "role" in update_data and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can change role",
        )

    if "password" in update_data:
        update_data["hashed_password"] = hash_password(update_data.pop("password"))

    for key, value in update_data.items():
        setattr(db_user, key, value)

    await db.commit()
    await db.refresh(db_user)

    return db_user
