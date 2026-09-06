from fastapi import FastAPI  # type: ignore[import]
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, students, companies, internships, applications, cv, saved_internships, messages, reports,ai   
from app.startup import ensure_runtime_schema

app = FastAPI(title="InternEra API")

@app.on_event("startup")
def startup():
    ensure_runtime_schema()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://192.168.154.1:3000",
        "http://192.168.154.1:3001",
    ],
    allow_origin_regex=r"^http://192\.168\.\d{1,3}\.\d{1,3}:300[01]$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(companies.router)
app.include_router(internships.router)
app.include_router(applications.router)
app.include_router(cv.router)
app.include_router(saved_internships.router)
app.include_router(messages.router)
app.include_router(reports.router)
app.include_router(ai.router, prefix="/ai")
@app.get("/")
def root():
    return {"message": "Welcome to InternEra API"}
