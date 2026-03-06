from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.login_route import router as login_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(login_router)  # ← así registras las rutas