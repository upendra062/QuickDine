from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (coupons, help, menu, orders, payment, reviews,
                          session, settings as settings_router, ws)
from app.routers.admin import (analytics, auth, coupons as admin_coupons,
                                help as admin_help, menu as admin_menu,
                                offers, orders as admin_orders, premium,
                                rewards as admin_rewards,
                                settings as admin_settings)

app = FastAPI(title="QuickDine API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Customer routers
for r in [session.router, menu.router, orders.router, payment.router,
          rewards.router, coupons.router, help.router, reviews.router,
          settings_router.router, ws.router]:
    app.include_router(r)

# Admin routers
for r in [auth.router, admin_menu.router, admin_orders.router, admin_help.router,
          admin_coupons.router, admin_rewards.router, premium.router,
          analytics.router, offers.router, admin_settings.router]:
    app.include_router(r)


@app.get("/health")
async def health():
    return {"status": "ok"}
