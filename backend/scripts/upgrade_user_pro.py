import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + "/..")

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

TARGET_EMAIL = "amithviswas0909@gmail.com"

async def upgrade():
    db_url = os.environ.get("DATABASE_URL", "")
    if "sslmode=require" in db_url:
        db_url = db_url.replace("?sslmode=require", "").replace("&sslmode=require", "")
    
    engine = create_async_engine(db_url, echo=False, connect_args={"ssl": True})
    
    async with engine.begin() as conn:
        # Check current state
        r = await conn.execute(
            text("SELECT id, email, plan, is_verified FROM users WHERE email = :email"),
            {"email": TARGET_EMAIL}
        )
        row = r.fetchone()
        
        if not row:
            print(f"USER NOT FOUND: {TARGET_EMAIL}")
            # List all users to help debug
            r2 = await conn.execute(text("SELECT email, plan FROM users LIMIT 20"))
            print("Existing users:")
            for u in r2.fetchall():
                print(f"  {u[0]}  ->  plan={u[1]}")
        else:
            print(f"Found user: id={row[0]}, email={row[1]}, plan={row[2]}, verified={row[3]}")
            await conn.execute(
                text("UPDATE users SET plan = 'pro', is_verified = true WHERE email = :email"),
                {"email": TARGET_EMAIL}
            )
            # Verify
            r3 = await conn.execute(
                text("SELECT email, plan, is_verified FROM users WHERE email = :email"),
                {"email": TARGET_EMAIL}
            )
            updated = r3.fetchone()
            print(f"UPGRADED: email={updated[0]}, plan={updated[1]}, verified={updated[2]}")
    
    await engine.dispose()
    print("Done.")

asyncio.run(upgrade())
