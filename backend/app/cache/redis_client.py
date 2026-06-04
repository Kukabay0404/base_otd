import redis.asyncio as redis
from typing import Optional

from app.core.config import settings

redis_client: Optional[redis.Redis] = None

async def get_redis_client() -> redis.Redis:
    global redis_client
    if not settings.REDIS_ENABLED:
        return None
    if redis_client is None:
        redis_client = redis.from_url(settings.REDIS_URL)
    return redis_client

async def close_redis_client() -> None:
    global redis_client
    if redis_client is not None:
        await redis_client.close()
        redis_client = None
