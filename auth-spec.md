# 🔐 auth-spec.md — CrimeScope Authentication Specification

---

## 🗺️ Auth Flow Overview

```
SIGNUP FLOW:
User fills form → POST /auth/register → Email verification sent
→ User clicks link → GET /auth/verify/{token} → Account activated
→ Redirect to /login

LOGIN FLOW (Email):
User enters email + password → POST /auth/login
→ Returns access_token + refresh_token
→ Tokens stored in httpOnly cookies
→ Redirect to /dashboard

LOGIN FLOW (Google OAuth):
Click "Continue with Google" → GET /auth/google
→ Google consent screen → callback /auth/google/callback
→ Find or create user (no password needed)
→ Returns tokens → Redirect to /dashboard

TOKEN REFRESH:
Access token expires (1hr) → Frontend detects 401
→ POST /auth/refresh with refresh_token cookie
→ New access_token returned → Retry original request

LOGOUT:
POST /auth/logout → Tokens invalidated in Redis blacklist
→ Cookies cleared → Redirect to /login

PASSWORD RESET:
POST /auth/forgot-password { email }
→ If email exists: send reset link (valid 15 min)
→ User clicks link → POST /auth/reset-password { token, new_password }
→ All existing sessions invalidated
→ Redirect to /login
```

---

## 🔑 Token Strategy

### Storage: httpOnly Cookies (NOT localStorage)
```
Why: localStorage vulnerable to XSS. httpOnly cookies cannot be accessed by JS.

access_token cookie:
  httpOnly: true
  secure: true (HTTPS only)
  sameSite: 'lax'
  maxAge: 3600  (1 hour)

refresh_token cookie:
  httpOnly: true
  secure: true
  sameSite: 'lax'
  maxAge: 2592000  (30 days)
  path: '/api/v1/auth/refresh'  ← Only sent to refresh endpoint
```

### JWT Payload
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "plan": "pro",
  "is_verified": true,
  "type": "access",
  "iat": 1717200000,
  "exp": 1717203600
}
```

---

## 🛡️ Security Rules

### Password Requirements
```python
# Enforced on frontend + backend
MIN_LENGTH = 8
REQUIRES_UPPERCASE = True
REQUIRES_NUMBER = True
REQUIRES_SPECIAL = True  # !@#$%^&*

# Example: "Secure#123" ✓ | "password" ✗
```

### Password Hashing
```python
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
```

### Rate Limiting
```
Login endpoint:       5 attempts / minute / IP
Register endpoint:    3 attempts / minute / IP
Forgot password:      3 attempts / hour / IP
Password reset:       5 attempts / 15 min / token
API endpoints:        100 requests / minute / user
```

### Token Blacklist (Redis)
```python
# On logout, add token JTI to Redis blacklist
async def blacklist_token(jti: str, expire_seconds: int):
    await redis.setex(f"blacklist:{jti}", expire_seconds, "1")

# On every protected request, check blacklist
async def is_token_blacklisted(jti: str) -> bool:
    return await redis.exists(f"blacklist:{jti}") > 0
```

---

## 🔒 Plan-Based Access Control

### Plan Hierarchy
```
free < pro < enterprise < admin
```

### Middleware Implementation
```python
# app/core/security.py
from enum import Enum

class Plan(str, Enum):
    FREE = "free"
    PRO = "pro"
    ENTERPRISE = "enterprise"
    ADMIN = "admin"

PLAN_RANK = {Plan.FREE: 0, Plan.PRO: 1, Plan.ENTERPRISE: 2, Plan.ADMIN: 3}

def require_plan(minimum_plan: Plan):
    """Dependency — use on any route that needs plan gating"""
    async def check_plan(current_user: User = Depends(get_current_user)):
        if PLAN_RANK[current_user.plan] < PLAN_RANK[minimum_plan]:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": "plan_required",
                    "required_plan": minimum_plan,
                    "current_plan": current_user.plan,
                    "upgrade_url": "/pricing"
                }
            )
        return current_user
    return check_plan

# Usage on routes:
@router.get("/ml/hotspots")
async def get_hotspots(
    user: User = Depends(require_plan(Plan.PRO))
):
    ...
```

### Frontend Plan Gate Component
```typescript
// src/components/PlanGate.tsx
'use client'
import { useAuth } from '@/hooks/useAuth'
import { PLAN_RANK } from '@/lib/plans'

interface PlanGateProps {
  requiredPlan: 'pro' | 'enterprise'
  children: React.ReactNode
}

export function PlanGate({ requiredPlan, children }: PlanGateProps) {
  const { user } = useAuth()

  if (!user || PLAN_RANK[user.plan] < PLAN_RANK[requiredPlan]) {
    return (
      <div className="plan-gate">
        <div className="plan-gate__icon">🔒</div>
        <h3>Pro Feature</h3>
        <p>Upgrade to Pro to access ML predictions, anomaly alerts, and more.</p>
        <a href="/pricing" className="btn-primary">Upgrade to Pro →</a>
      </div>
    )
  }

  return <>{children}</>
}
```

---

## 🌐 Google OAuth Full Implementation

### Backend (FastAPI)
```python
# requirements: authlib, httpx
pip install authlib

# app/api/v1/auth.py
from authlib.integrations.starlette_client import OAuth
from starlette.requests import Request

oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

@router.get("/auth/google")
async def google_login(request: Request):
    redirect_uri = f"{settings.BACKEND_URL}/api/v1/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/auth/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get('userinfo')

    # Find existing user by oauth_id or email
    user = await get_user_by_oauth(db, provider="google", oauth_id=user_info['sub'])

    if not user:
        # Try finding by email (might have registered with email before)
        user = await get_user_by_email(db, user_info['email'])
        if user:
            # Link OAuth to existing account
            user.oauth_provider = "google"
            user.oauth_id = user_info['sub']
        else:
            # Create new user — no password needed
            user = await create_oauth_user(db, {
                "email": user_info['email'],
                "full_name": user_info.get('name'),
                "oauth_provider": "google",
                "oauth_id": user_info['sub'],
                "is_verified": True,  # Google already verified email
            })

    # Generate tokens
    access_token = create_access_token(user)
    refresh_token = create_refresh_token(user)

    # Redirect to frontend with tokens in httpOnly cookies
    response = RedirectResponse(url=f"{settings.FRONTEND_URL}/dashboard")
    response.set_cookie("access_token", access_token, httponly=True, secure=True)
    response.set_cookie("refresh_token", refresh_token, httponly=True, secure=True)
    return response
```

### Frontend (Next.js)
```typescript
// src/components/auth/GoogleButton.tsx
export function GoogleSignInButton() {
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`
  }

  return (
    <button onClick={handleGoogleLogin} className="btn-google">
      <GoogleIcon />
      Continue with Google
    </button>
  )
}
```

---

## 🔄 Frontend Auth State (Zustand)

```typescript
// src/stores/authStore.ts
import { create } from 'zustand'

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    set({ user: res.data.user, isAuthenticated: true })
  },

  logout: async () => {
    await api.post('/auth/logout')
    set({ user: null, isAuthenticated: false })
    window.location.href = '/login'
  },

  refreshUser: async () => {
    try {
      const res = await api.get('/auth/me')
      set({ user: res.data, isAuthenticated: true, isLoading: false })
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false })
    }
  }
}))
```

---

## 🧪 Auth Test Cases

Every test below must pass before launch:

```python
# tests/test_auth.py

def test_register_success()          # Creates user, sends verification email
def test_register_duplicate_email()  # Returns 409
def test_register_weak_password()    # Returns 422 with validation error
def test_login_success()             # Returns tokens
def test_login_wrong_password()      # Returns 401 after 1st attempt
def test_login_rate_limit()          # Returns 429 after 5 attempts
def test_login_unverified_user()     # Returns 403 with message
def test_email_verification()        # Token activates account
def test_token_refresh()             # Returns new access token
def test_logout_blacklists_token()   # Old token rejected after logout
def test_forgot_password_sends_email()
def test_reset_password_success()
def test_reset_password_expired_token()  # Returns 400
def test_google_oauth_creates_user()
def test_plan_gating_free_user()     # 403 on pro endpoint
def test_plan_gating_pro_user()      # 200 on pro endpoint
```
