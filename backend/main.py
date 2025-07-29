from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from routers import job_description
from routers import score_weights
from routers import candidates
from routers import topscore
from routers import ai_chat
load_dotenv()
app = FastAPI()
app.include_router(ai_chat.router,prefix="/api")
app.include_router(candidates.router,prefix="/api")
app.include_router(job_description.router,prefix="/api")
app.include_router(topscore.router,prefix="/api")
app.include_router(score_weights.router,prefix="/api")

origins_raw = os.getenv("ALLOWED_ORIGINS", "")
origins = [o.strip() for o in origins_raw.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
