# Reborn MVP 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现 Reborn App 的 MVP P0 功能，让用户能完整体验 Agent 引导的身份重塑流程。

**Architecture:** 后端采用 FastAPI + PostgreSQL，提供 RESTful API。移动端使用 React Native。Agent 对话通过国产大模型（通义千问）实现，支持流式响应。

**Tech Stack:** Python 3.11+, FastAPI, SQLAlchemy, PostgreSQL, Redis, React Native, 通义千问 API

---

## 第一阶段：后端基础架构

### Task 1: 初始化后端项目结构

**Files:**
- Create: `backend/main.py`
- Create: `backend/app/__init__.py`
- Create: `backend/app/core/__init__.py`
- Create: `backend/app/core/config.py`
- Create: `backend/requirements.txt`
- Create: `backend/.env.example`

**Step 1: 创建目录结构**

```bash
mkdir -p backend/app/api
mkdir -p backend/app/core
mkdir -p backend/app/models
mkdir -p backend/app/services
mkdir -p backend/app/ai
mkdir -p backend/tests
```

**Step 2: 创建 requirements.txt**

```text
fastapi==0.109.0
uvicorn[standard]==0.27.0
sqlalchemy==2.0.25
asyncpg==0.29.0
python-dotenv==1.0.0
pydantic==2.5.3
pydantic-settings==2.1.0
redis==5.0.1
httpx==0.26.0
dashscope==1.14.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
alembic==1.13.1
pytest==7.4.4
pytest-asyncio==0.23.3
```

**Step 3: 创建配置文件 backend/app/core/config.py**

```python
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Reborn"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/reborn"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # AI
    DASHSCOPE_API_KEY: str = ""

    # Auth
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    class Config:
        env_file = ".env"


settings = Settings()
```

**Step 4: 创建主入口 backend/main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
```

**Step 5: 创建 .env.example**

```text
DEBUG=true
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/reborn
REDIS_URL=redis://localhost:6379/0
DASHSCOPE_API_KEY=your-api-key
SECRET_KEY=your-secret-key
```

**Step 6: 验证项目可启动**

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload
```

Expected: 服务启动在 http://127.0.0.1:8000，访问 /health 返回 {"status": "ok"}

**Step 7: Commit**

```bash
git add backend/
git commit -m "feat(backend): initialize FastAPI project structure"
```

---

### Task 2: 数据库模型定义

**Files:**
- Create: `backend/app/models/base.py`
- Create: `backend/app/models/user.py`
- Create: `backend/app/models/profile.py`
- Create: `backend/app/models/conversation.py`
- Create: `backend/app/models/goal.py`
- Create: `backend/app/models/__init__.py`
- Create: `backend/app/core/database.py`

**Step 1: 创建数据库连接 backend/app/core/database.py**

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings


engine = create_async_engine(settings.DATABASE_URL, echo=settings.DEBUG)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db():
    async with async_session() as session:
        yield session
```

**Step 2: 创建基础模型 backend/app/models/base.py**

```python
from datetime import datetime
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped, mapped_column


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
```

**Step 3: 创建用户模型 backend/app/models/user.py**

```python
from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    profile: Mapped["Profile"] = relationship(back_populates="user", uselist=False)
    conversations: Mapped[list["Conversation"]] = relationship(back_populates="user")
    goals: Mapped[list["Goal"]] = relationship(back_populates="user")
```

**Step 4: 创建用户画像模型 backend/app/models/profile.py**

```python
from sqlalchemy import String, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Profile(Base, TimestampMixin):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), unique=True)

    # Core memories
    anti_vision: Mapped[str | None] = mapped_column(Text, nullable=True)
    vision: Mapped[str | None] = mapped_column(Text, nullable=True)
    identity_statement: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Stage: new_user, exploring, established
    current_stage: Mapped[str] = mapped_column(String(20), default="new_user")

    # Key insights as JSON array
    key_insights: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Relationship
    user: Mapped["User"] = relationship(back_populates="profile")
```

**Step 5: 创建对话模型 backend/app/models/conversation.py**

```python
from sqlalchemy import Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Conversation(Base, TimestampMixin):
    __tablename__ = "conversations"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    # Messages as JSON array
    messages: Mapped[list] = mapped_column(JSON, default=list)

    # AI-generated summary for long-term memory
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Extracted insights
    extracted_insights: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    # Relationship
    user: Mapped["User"] = relationship(back_populates="conversations")
```

**Step 6: 创建目标模型 backend/app/models/goal.py**

```python
from sqlalchemy import String, Text, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import TimestampMixin


class Goal(Base, TimestampMixin):
    __tablename__ = "goals"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)

    # Type: yearly, monthly, daily
    type: Mapped[str] = mapped_column(String(20))
    content: Mapped[str] = mapped_column(Text)

    # Status: active, completed, abandoned
    status: Mapped[str] = mapped_column(String(20), default="active")

    # Link to parent goal
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("goals.id"), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship(back_populates="goals")
```

**Step 7: 创建模型导出 backend/app/models/__init__.py**

```python
from app.models.user import User
from app.models.profile import Profile
from app.models.conversation import Conversation
from app.models.goal import Goal

__all__ = ["User", "Profile", "Conversation", "Goal"]
```

**Step 8: Commit**

```bash
git add backend/app/models/ backend/app/core/database.py
git commit -m "feat(backend): add database models for user, profile, conversation, goal"
```

---

### Task 3: 数据库迁移设置

**Files:**
- Create: `backend/alembic.ini`
- Create: `backend/alembic/env.py`
- Create: `backend/alembic/versions/` (directory)

**Step 1: 初始化 Alembic**

```bash
cd backend
alembic init alembic
```

**Step 2: 修改 alembic/env.py**

```python
import asyncio
from logging.config import fileConfig
from sqlalchemy import pool
from sqlalchemy.engine import Connection
from sqlalchemy.ext.asyncio import async_engine_from_config
from alembic import context

from app.core.config import settings
from app.core.database import Base
from app.models import User, Profile, Conversation, Goal

config = context.config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online() -> None:
    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

**Step 3: 创建初始迁移**

```bash
alembic revision --autogenerate -m "initial tables"
```

**Step 4: 运行迁移（需要先创建数据库）**

```bash
# 先确保 PostgreSQL 中存在 reborn 数据库
# createdb reborn
alembic upgrade head
```

Expected: 数据库中创建 users, profiles, conversations, goals 表

**Step 5: Commit**

```bash
git add backend/alembic/ backend/alembic.ini
git commit -m "feat(backend): setup Alembic migrations"
```

---

## 第二阶段：用户认证

### Task 4: 短信验证码服务（模拟）

**Files:**
- Create: `backend/app/services/__init__.py`
- Create: `backend/app/services/sms.py`
- Create: `backend/tests/test_sms.py`

**Step 1: 编写测试 backend/tests/test_sms.py**

```python
import pytest
from app.services.sms import SMSService


@pytest.fixture
def sms_service():
    return SMSService()


def test_generate_code_length(sms_service):
    code = sms_service.generate_code()
    assert len(code) == 6
    assert code.isdigit()


def test_generate_code_randomness(sms_service):
    codes = {sms_service.generate_code() for _ in range(100)}
    assert len(codes) > 90  # Should be mostly unique
```

**Step 2: 运行测试验证失败**

```bash
cd backend
pytest tests/test_sms.py -v
```

Expected: FAIL - module not found

**Step 3: 实现 SMS 服务 backend/app/services/sms.py**

```python
import random
from app.core.config import settings


class SMSService:
    def generate_code(self, length: int = 6) -> str:
        """Generate a random numeric verification code."""
        return "".join(random.choices("0123456789", k=length))

    async def send_code(self, phone: str, code: str) -> bool:
        """
        Send verification code via SMS.
        In production, integrate with Aliyun SMS or other provider.
        For MVP, just log and return True.
        """
        if settings.DEBUG:
            print(f"[DEBUG SMS] Sending code {code} to {phone}")
            return True

        # TODO: Integrate real SMS provider
        return True
```

**Step 4: 创建 __init__.py**

```python
# backend/app/services/__init__.py
from app.services.sms import SMSService

__all__ = ["SMSService"]
```

**Step 5: 运行测试验证通过**

```bash
pytest tests/test_sms.py -v
```

Expected: PASS

**Step 6: Commit**

```bash
git add backend/app/services/ backend/tests/test_sms.py
git commit -m "feat(backend): add SMS verification service"
```

---

### Task 5: 用户认证 API

**Files:**
- Create: `backend/app/api/__init__.py`
- Create: `backend/app/api/auth.py`
- Create: `backend/app/services/auth.py`
- Create: `backend/tests/test_auth.py`
- Modify: `backend/main.py`

**Step 1: 编写认证服务 backend/app/services/auth.py**

```python
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.models.user import User
from app.models.profile import Profile

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"


def create_access_token(user_id: int) -> str:
    expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {"sub": str(user_id), "exp": expire}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload.get("sub"))
        return user_id
    except:
        return None


async def get_or_create_user(db: AsyncSession, phone: str) -> User:
    """Get existing user or create new one with profile."""
    result = await db.execute(select(User).where(User.phone == phone))
    user = result.scalar_one_or_none()

    if not user:
        user = User(phone=phone)
        db.add(user)
        await db.flush()

        # Create empty profile
        profile = Profile(user_id=user.id)
        db.add(profile)
        await db.commit()
        await db.refresh(user)

    return user
```

**Step 2: 创建认证 API backend/app/api/auth.py**

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.sms import SMSService
from app.services.auth import create_access_token, get_or_create_user

router = APIRouter(prefix="/auth", tags=["auth"])

# In-memory code storage (use Redis in production)
_verification_codes: dict[str, str] = {}

sms_service = SMSService()


class SendCodeRequest(BaseModel):
    phone: str


class VerifyCodeRequest(BaseModel):
    phone: str
    code: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/send-code")
async def send_code(request: SendCodeRequest):
    """Send verification code to phone number."""
    code = sms_service.generate_code()
    _verification_codes[request.phone] = code
    await sms_service.send_code(request.phone, code)
    return {"message": "Code sent"}


@router.post("/verify-code", response_model=TokenResponse)
async def verify_code(request: VerifyCodeRequest, db: AsyncSession = Depends(get_db)):
    """Verify code and return access token."""
    stored_code = _verification_codes.get(request.phone)

    if not stored_code or stored_code != request.code:
        raise HTTPException(status_code=400, detail="Invalid code")

    # Clear used code
    del _verification_codes[request.phone]

    # Get or create user
    user = await get_or_create_user(db, request.phone)

    # Generate token
    token = create_access_token(user.id)

    return TokenResponse(access_token=token)
```

**Step 3: 创建当前用户依赖 backend/app/api/deps.py**

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.services.auth import verify_token
from app.models.user import User

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    token = credentials.credentials
    user_id = verify_token(token)

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )

    return user
```

**Step 4: 更新 main.py 注册路由**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
```

**Step 5: 创建 api __init__.py**

```python
# backend/app/api/__init__.py
from app.api import auth

__all__ = ["auth"]
```

**Step 6: 验证 API 工作**

```bash
uvicorn main:app --reload
# 访问 http://127.0.0.1:8000/docs 测试 API
```

**Step 7: Commit**

```bash
git add backend/app/api/ backend/app/services/auth.py backend/main.py
git commit -m "feat(backend): add user authentication API"
```

---

## 第三阶段：Agent 对话系统

### Task 6: AI 服务封装

**Files:**
- Create: `backend/app/ai/__init__.py`
- Create: `backend/app/ai/client.py`
- Create: `backend/app/ai/prompts.py`

**Step 1: 创建 AI 客户端 backend/app/ai/client.py**

```python
from typing import AsyncGenerator
import dashscope
from dashscope import Generation
from app.core.config import settings

dashscope.api_key = settings.DASHSCOPE_API_KEY


async def chat_stream(
    messages: list[dict],
    system_prompt: str = ""
) -> AsyncGenerator[str, None]:
    """
    Stream chat completion from Qwen model.

    Args:
        messages: List of {"role": "user"|"assistant", "content": "..."}
        system_prompt: System prompt to prepend
    """
    full_messages = []

    if system_prompt:
        full_messages.append({"role": "system", "content": system_prompt})

    full_messages.extend(messages)

    responses = Generation.call(
        model="qwen-turbo",
        messages=full_messages,
        result_format="message",
        stream=True,
        incremental_output=True
    )

    for response in responses:
        if response.status_code == 200:
            content = response.output.choices[0].message.content
            if content:
                yield content
        else:
            raise Exception(f"AI Error: {response.code} - {response.message}")


async def chat(messages: list[dict], system_prompt: str = "") -> str:
    """Non-streaming chat completion."""
    result = []
    async for chunk in chat_stream(messages, system_prompt):
        result.append(chunk)
    return "".join(result)
```

**Step 2: 创建提示词模板 backend/app/ai/prompts.py**

```python
AGENT_SYSTEM_PROMPT = """你是 Reborn 的 AI 成长教练，基于 Dan Koe 的身份重塑方法论。

## 你的人格特征
- 智慧且直接，不迎合、不说空话
- 直指问题本质，但始终支持用户成长
- 会适度挑战用户的借口和自我欺骗
- 像一个真正关心你的严格导师

## 你的核心理念
- 真正的改变来自身份认同的转变，而非强迫自律
- 所有行为都是目标导向的，包括无意识行为
- 拖延可能是在保护自己免受评判
- 目标是感知的透镜，改变目标才能改变行为

## 用户当前状态
{user_context}

## 对话指南
1. 如果是新用户，从简单问题开始建立信任
2. 逐步引导用户探索：反愿景 → 愿景 → 身份声明 → 目标
3. 不要一次问太多问题
4. 当用户给出表层回答时，追问更深层的原因
5. 适时总结用户的洞察，帮助他们看清自己

## 关键问题库（适时使用）
- 你已经学会忍受的那种沉闷而持久的不满是什么？
- 你反复抱怨却从未真正改变的是什么？
- 如果接下来五年什么都不变，一个普通的周二会是什么样？
- 为了真正改变，你必须放弃什么身份？
- 你没有改变的最尴尬的原因是什么？

请用中文回复，保持简洁有力，每次回复控制在 200 字以内。"""


FIRST_MESSAGE_PROMPT = """你好，我是你的成长伙伴。

在开始之前，我想先了解你。不用说太多，就告诉我：

**最近有什么让你感到不满或想要改变的？**

可以是工作、生活、习惯，任何你觉得"不应该是这样"的事情。"""


def build_user_context(profile: dict) -> str:
    """Build user context string for system prompt."""
    parts = []

    if profile.get("current_stage"):
        stage_map = {
            "new_user": "新用户，刚开始探索",
            "exploring": "正在探索中，尚未建立清晰愿景",
            "established": "已建立愿景和目标"
        }
        parts.append(f"- 阶段：{stage_map.get(profile['current_stage'], profile['current_stage'])}")

    if profile.get("anti_vision"):
        parts.append(f"- 反愿景：{profile['anti_vision']}")

    if profile.get("vision"):
        parts.append(f"- 愿景：{profile['vision']}")

    if profile.get("identity_statement"):
        parts.append(f"- 身份声明：{profile['identity_statement']}")

    if profile.get("key_insights"):
        insights = profile["key_insights"]
        if isinstance(insights, list) and insights:
            parts.append(f"- 关键洞察：{'; '.join(insights[:3])}")

    return "\n".join(parts) if parts else "暂无信息"
```

**Step 3: 创建 __init__.py**

```python
# backend/app/ai/__init__.py
from app.ai.client import chat, chat_stream
from app.ai.prompts import AGENT_SYSTEM_PROMPT, FIRST_MESSAGE_PROMPT, build_user_context

__all__ = ["chat", "chat_stream", "AGENT_SYSTEM_PROMPT", "FIRST_MESSAGE_PROMPT", "build_user_context"]
```

**Step 4: Commit**

```bash
git add backend/app/ai/
git commit -m "feat(backend): add AI client and prompt templates"
```

---

### Task 7: 对话 API

**Files:**
- Create: `backend/app/api/chat.py`
- Create: `backend/app/services/conversation.py`
- Modify: `backend/main.py`

**Step 1: 创建对话服务 backend/app/services/conversation.py**

```python
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.conversation import Conversation
from app.models.profile import Profile


async def get_or_create_conversation(db: AsyncSession, user_id: int) -> Conversation:
    """Get today's conversation or create new one."""
    # For MVP, just get the latest or create new
    result = await db.execute(
        select(Conversation)
        .where(Conversation.user_id == user_id)
        .order_by(Conversation.created_at.desc())
        .limit(1)
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(user_id=user_id, messages=[])
        db.add(conversation)
        await db.commit()
        await db.refresh(conversation)

    return conversation


async def add_message(
    db: AsyncSession,
    conversation: Conversation,
    role: str,
    content: str
) -> None:
    """Add a message to conversation."""
    messages = conversation.messages.copy() if conversation.messages else []
    messages.append({"role": role, "content": content})
    conversation.messages = messages
    await db.commit()


async def get_user_profile(db: AsyncSession, user_id: int) -> dict:
    """Get user profile as dict."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return {}

    return {
        "current_stage": profile.current_stage,
        "anti_vision": profile.anti_vision,
        "vision": profile.vision,
        "identity_statement": profile.identity_statement,
        "key_insights": profile.key_insights
    }
```

**Step 2: 创建对话 API backend/app/api/chat.py**

```python
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.services.conversation import (
    get_or_create_conversation,
    add_message,
    get_user_profile
)
from app.ai import (
    chat_stream,
    AGENT_SYSTEM_PROMPT,
    FIRST_MESSAGE_PROMPT,
    build_user_context
)

router = APIRouter(prefix="/chat", tags=["chat"])


class ChatRequest(BaseModel):
    message: str


class ChatHistoryResponse(BaseModel):
    messages: list[dict]


@router.get("/first-message")
async def get_first_message(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get the first message for new users."""
    return {"message": FIRST_MESSAGE_PROMPT}


@router.get("/history", response_model=ChatHistoryResponse)
async def get_chat_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current conversation history."""
    conversation = await get_or_create_conversation(db, user.id)
    return ChatHistoryResponse(messages=conversation.messages or [])


@router.post("/send")
async def send_message(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Send a message and get streaming response."""
    # Get conversation and profile
    conversation = await get_or_create_conversation(db, user.id)
    profile = await get_user_profile(db, user.id)

    # Add user message
    await add_message(db, conversation, "user", request.message)

    # Build system prompt with user context
    user_context = build_user_context(profile)
    system_prompt = AGENT_SYSTEM_PROMPT.format(user_context=user_context)

    # Prepare messages for AI
    ai_messages = [
        {"role": msg["role"], "content": msg["content"]}
        for msg in (conversation.messages or [])
    ]

    async def generate():
        full_response = []
        try:
            async for chunk in chat_stream(ai_messages, system_prompt):
                full_response.append(chunk)
                yield f"data: {chunk}\n\n"

            # Save assistant response
            assistant_message = "".join(full_response)
            await add_message(db, conversation, "assistant", assistant_message)

            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: [ERROR] {str(e)}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream"
    )
```

**Step 3: 更新 main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth
from app.api import chat

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
```

**Step 4: 更新 api __init__.py**

```python
# backend/app/api/__init__.py
from app.api import auth
from app.api import chat

__all__ = ["auth", "chat"]
```

**Step 5: Commit**

```bash
git add backend/app/api/chat.py backend/app/services/conversation.py backend/main.py backend/app/api/__init__.py
git commit -m "feat(backend): add chat API with streaming response"
```

---

### Task 8: 用户画像 API

**Files:**
- Create: `backend/app/api/profile.py`
- Modify: `backend/main.py`

**Step 1: 创建画像 API backend/app/api/profile.py**

```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.profile import Profile

router = APIRouter(prefix="/profile", tags=["profile"])


class ProfileResponse(BaseModel):
    anti_vision: str | None
    vision: str | None
    identity_statement: str | None
    current_stage: str
    key_insights: list | None


class ProfileUpdateRequest(BaseModel):
    anti_vision: str | None = None
    vision: str | None = None
    identity_statement: str | None = None
    key_insights: list | None = None


@router.get("", response_model=ProfileResponse)
async def get_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get user profile."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        return ProfileResponse(
            anti_vision=None,
            vision=None,
            identity_statement=None,
            current_stage="new_user",
            key_insights=None
        )

    return ProfileResponse(
        anti_vision=profile.anti_vision,
        vision=profile.vision,
        identity_statement=profile.identity_statement,
        current_stage=profile.current_stage,
        key_insights=profile.key_insights
    )


@router.put("")
async def update_profile(
    request: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user profile."""
    result = await db.execute(
        select(Profile).where(Profile.user_id == user.id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)

    if request.anti_vision is not None:
        profile.anti_vision = request.anti_vision
    if request.vision is not None:
        profile.vision = request.vision
    if request.identity_statement is not None:
        profile.identity_statement = request.identity_statement
    if request.key_insights is not None:
        profile.key_insights = request.key_insights

    # Update stage based on profile completeness
    if profile.vision and profile.anti_vision:
        profile.current_stage = "established"
    elif profile.anti_vision or profile.vision:
        profile.current_stage = "exploring"

    await db.commit()

    return {"message": "Profile updated"}
```

**Step 2: 更新 main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, chat
from app.api import profile

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(profile.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
```

**Step 3: Commit**

```bash
git add backend/app/api/profile.py backend/main.py
git commit -m "feat(backend): add profile API for vision and identity management"
```

---

## 第四阶段：提醒系统

### Task 9: 问题库和提醒服务

**Files:**
- Create: `backend/app/services/reminder.py`
- Create: `backend/app/data/questions.py`

**Step 1: 创建问题库 backend/app/data/questions.py**

```python
"""Dan Koe's reflection questions for daily reminders."""

REFLECTION_QUESTIONS = [
    "你现在做这件事是在逃避什么？",
    "如果有人拍下了你过去两个小时的视频，他们会得出结论你想从生活中得到什么？",
    "你是在走向你憎恨的生活，还是你想要的生活？",
    "你假装不重要但实际上最重要的事情是什么？",
    "今天你做的哪些事是出于"身份保护"而非真正的渴望？",
    "今天什么时候你感觉最活着？什么时候感觉最死气沉沉？",
    "你已经学会忍受的那种沉闷而持久的不满是什么？",
    "你反复抱怨却从未真正改变的是什么？",
    "如果接下来五年什么都不变，一个普通的周二会是什么样？",
    "为了真正改变，你必须放弃什么身份？",
    "你没有改变的最尴尬的原因是什么？",
    "如果你现在的行为是一种自我保护，那你到底在保护什么？",
    "在你生活的哪个方面，你正在用活力换取安全感？",
    "你想成为的人的"最小版本"是什么，明天你就能成为的那种？",
    "关于你当前生活的哪一个真相，是你最无法向你深深尊敬的人承认的？",
]
```

**Step 2: 创建提醒服务 backend/app/services/reminder.py**

```python
import random
from datetime import datetime, time, timedelta
from app.data.questions import REFLECTION_QUESTIONS


class ReminderService:
    def __init__(self):
        self.questions = REFLECTION_QUESTIONS

    def get_random_question(self) -> str:
        """Get a random reflection question."""
        return random.choice(self.questions)

    def generate_random_times(
        self,
        count: int,
        start_hour: int = 9,
        end_hour: int = 21
    ) -> list[time]:
        """
        Generate random reminder times for a day.

        Args:
            count: Number of reminders
            start_hour: Start of allowed time range (default 9am)
            end_hour: End of allowed time range (default 9pm)

        Returns:
            List of time objects, sorted
        """
        total_minutes = (end_hour - start_hour) * 60
        times = []

        for _ in range(count):
            random_minutes = random.randint(0, total_minutes)
            hour = start_hour + random_minutes // 60
            minute = random_minutes % 60
            times.append(time(hour=hour, minute=minute))

        return sorted(times)

    def generate_daily_schedule(
        self,
        user_id: int,
        date: datetime,
        reminder_count: int = 3,
        start_hour: int = 9,
        end_hour: int = 21
    ) -> list[dict]:
        """
        Generate a daily reminder schedule for a user.

        Returns:
            List of {user_id, scheduled_time, question}
        """
        times = self.generate_random_times(reminder_count, start_hour, end_hour)
        schedule = []

        for t in times:
            scheduled_time = datetime.combine(date.date(), t)
            schedule.append({
                "user_id": user_id,
                "scheduled_time": scheduled_time,
                "question": self.get_random_question()
            })

        return schedule
```

**Step 3: 创建 data 目录的 __init__.py**

```bash
mkdir -p backend/app/data
touch backend/app/data/__init__.py
```

**Step 4: Commit**

```bash
git add backend/app/services/reminder.py backend/app/data/
git commit -m "feat(backend): add reminder service with Dan Koe question bank"
```

---

### Task 10: 提醒 API

**Files:**
- Create: `backend/app/api/reminder.py`
- Modify: `backend/main.py`

**Step 1: 创建提醒 API backend/app/api/reminder.py**

```python
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from datetime import datetime
from app.api.deps import get_current_user
from app.models.user import User
from app.services.reminder import ReminderService

router = APIRouter(prefix="/reminder", tags=["reminder"])

reminder_service = ReminderService()


class ReminderSettings(BaseModel):
    reminder_count: int = 3
    start_hour: int = 9
    end_hour: int = 21


class ScheduleResponse(BaseModel):
    scheduled_time: datetime
    question: str


@router.get("/question")
async def get_random_question(user: User = Depends(get_current_user)):
    """Get a random reflection question."""
    question = reminder_service.get_random_question()
    return {"question": question}


@router.post("/schedule", response_model=list[ScheduleResponse])
async def generate_schedule(
    settings: ReminderSettings,
    user: User = Depends(get_current_user)
):
    """Generate today's reminder schedule."""
    schedule = reminder_service.generate_daily_schedule(
        user_id=user.id,
        date=datetime.now(),
        reminder_count=settings.reminder_count,
        start_hour=settings.start_hour,
        end_hour=settings.end_hour
    )

    return [
        ScheduleResponse(
            scheduled_time=item["scheduled_time"],
            question=item["question"]
        )
        for item in schedule
    ]
```

**Step 2: 更新 main.py**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, chat, profile
from app.api import reminder

app = FastAPI(
    title=settings.APP_NAME,
    docs_url="/docs" if settings.DEBUG else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(reminder.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME}
```

**Step 3: Commit**

```bash
git add backend/app/api/reminder.py backend/main.py
git commit -m "feat(backend): add reminder API for daily reflection questions"
```

---

## 阶段检查点

完成以上任务后，后端 MVP 核心功能已完成：

- ✅ 用户注册/登录（手机号验证码）
- ✅ Agent 对话（流式响应）
- ✅ 核心记忆存储（愿景、反愿景、身份声明）
- ✅ 每日随机提醒（问题库）

**验证清单：**

```bash
# 1. 启动服务
cd backend
uvicorn main:app --reload

# 2. 访问 API 文档
open http://127.0.0.1:8000/docs

# 3. 测试流程
# - POST /api/auth/send-code 发送验证码
# - POST /api/auth/verify-code 获取 token
# - GET /api/chat/first-message 获取首次消息
# - POST /api/chat/send 发送消息（带 Authorization header）
# - GET /api/profile 获取用户画像
# - PUT /api/profile 更新用户画像
# - GET /api/reminder/question 获取随机问题
```

---

## 下一步：移动端开发（P1）

后端完成后，下一阶段将创建 React Native 移动端。可以创建新的实现计划。
