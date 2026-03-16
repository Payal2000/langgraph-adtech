"""
Cognito JWT validation middleware.

Validates Bearer tokens against the Cognito User Pool JWKS endpoint.
Skips validation for /health and /metrics endpoints.
"""

from __future__ import annotations

import os

import httpx
from fastapi import Request, status
from fastapi.responses import JSONResponse
from jose import JWTError, jwk, jwt
from starlette.middleware.base import BaseHTTPMiddleware

SKIP_PATHS = {"/health", "/metrics", "/docs", "/openapi.json"}

_jwks_cache: dict | None = None


async def _get_jwks() -> dict:
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache

    region = os.getenv("COGNITO_REGION", "us-east-1")
    pool_id = os.getenv("COGNITO_USER_POOL_ID", "")
    url = f"https://cognito-idp.{region}.amazonaws.com/{pool_id}/.well-known/jwks.json"

    async with httpx.AsyncClient() as client:
        resp = await client.get(url)
        resp.raise_for_status()
        _jwks_cache = resp.json()
    return _jwks_cache


class CognitoAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path in SKIP_PATHS:
            return await call_next(request)

        # In development mode, skip auth
        if os.getenv("APP_ENV", "production") == "development":
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing or invalid Authorization header"},
            )

        token = auth_header.removeprefix("Bearer ").strip()
        try:
            jwks = await _get_jwks()
            # Decode and verify — jose handles RS256 signature validation
            claims = jwt.decode(
                token,
                jwks,
                algorithms=["RS256"],
                audience=os.getenv("COGNITO_CLIENT_ID"),
            )
            request.state.user = claims
        except JWTError as exc:
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"detail": f"Invalid token: {exc}"},
            )

        return await call_next(request)
