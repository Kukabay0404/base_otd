from fastapi import FastAPI
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.routers import checkout, user
from fastapi.middleware.cors import CORSMiddleware


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Resort API", lifespan=lifespan)

origins = [
    "http://localhost:3000",  # Next.js dev
    "http://127.0.0.1:3000",
    "https://yourdomain.com", # если будет продакшн
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(checkout.router)
app.include_router(user.router)
