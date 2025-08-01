from sqlalchemy import create_engine
from .models import Base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./lms.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base.metadata.create_all(bind=engine)
