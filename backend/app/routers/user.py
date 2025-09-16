from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError, jwt
from fastapi.security import OAuth2PasswordBearer
from passlib.context import CryptContext
from sqlalchemy import select
from app.database import get_db
from app.schemas import user
from app import models, schemas

router = APIRouter(prefix='/auth', tags=['Auth'])

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = "supersecretkey"  # лучше вынести в .env
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def hash_password(password : str):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Не удалось проверить токен",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return email
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Недействительный токен",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
):
    email = verify_access_token(token)
    result = await db.execute(select(models.User).where(models.User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь не найден")
    return user


@router.post('/register', response_model=user.UserOut)
async def create_user(user : schemas.user.UserCreate, db : AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).where(models.User.email == user.email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400,detail='Такой eMail уже зарегистрирован')

    db_user = models.User(
        email=user.email,
        hashed_password = hash_password(user.password),
        first_name = user.first_name,
        last_name = user.last_name,
        role = user.role,
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

@router.get("/", response_model=list[schemas.user.UserOut])
async def get_users(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.user.User))
    return result.scalars().all()


@router.get("/{user_id}", response_model=schemas.user.UserOut)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.user.User).where(models.user.User.id == user_id))
    user_ext = result.scalar_one_or_none()
    if not user_ext:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/login")
async def login(user: schemas.user.UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(models.User).filter(models.User.email == user.email))
    db_user = result.scalar_one_or_none()

    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверный email или пароль",
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
    # проверим роль
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Удалять пользователей может только администратор",
        )

    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user_to_delete = result.scalar_one_or_none()

    if not user_to_delete:
        raise HTTPException(status_code=404, detail="Пользователь не найден")

    await db.delete(user_to_delete)
    await db.commit()
    return {"detail": f"Пользователь {user_id} успешно удалён"}