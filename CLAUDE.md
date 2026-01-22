# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 语言偏好

请始终使用中文与用户交流。

## 项目概述

Reborn 是一款基于 Dan Koe "一天重启人生"方法论的 AI 教练应用，通过智能 Agent 陪伴用户完成身份重塑和持续成长。

## 技术栈

- 后端：Python + FastAPI + PostgreSQL + Redis
- 移动端：React Native
- AI：国产大模型（通义千问）

## 项目结构

```
reborn/
├── backend/          # FastAPI 后端
├── mobile/           # React Native 移动端（待开发）
├── docs/plans/       # 设计文档和实现计划
```

## 常用命令

```bash
# 启动后端
cd backend
uvicorn main:app --reload

# 运行测试
pytest tests/ -v

# 数据库迁移
alembic upgrade head
```

## 相关文档

- 设计文档：`docs/plans/2026-01-22-reborn-app-design.md`
- 实现计划：`docs/plans/2026-01-22-reborn-mvp-implementation.md`
