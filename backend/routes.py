from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from .auth import verify_password, create_access_token,decode_access_token, require_student, require_lecturer
from typing import List
from sqlalchemy.orm import Session
from . import models, schemas
from .database import SessionLocal, engine
from .auth import get_password_hash
from .schemas import UserLogin
from fastapi import UploadFile, File, Form
from typing import Optional
from .schemas import CourseOut
from .auth import get_current_user
from .models import User, Course, Assignment, Lesson, Submission
from sqlalchemy.orm import joinedload
from fastapi import UploadFile, File, Form
import os
from .schemas import EnrolledCourseOut

models.Base.metadata.create_all(bind=engine)


router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

#========USERS=========
@router.post("/register", response_model=schemas.UserOut)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user.password) 

    new_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_password,  # store hashed password
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login_user(user: schemas.UserLogin, db: Session = Depends(get_db)):
    print("Got user login:", user.email)  # ✅ for testing
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    return {
    "access_token": token,
    "token_type": "bearer",
    "user": {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role
    }
}

#======COURSES======
@router.post("/courses", response_model=schemas.CourseOut)
def create_course(
    course: schemas.CourseCreate,
    _=Depends(require_lecturer), #role check
    db: Session = Depends(get_db)         #db session  
):
    new_course = models.Course(**course.model_dump())
    db.add(new_course)
    db.commit()
    db.refresh(new_course)
    return new_course

@router.get("/courses", response_model=List[schemas.CourseOut])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(models.Course).options(
        joinedload(models.Course.teacher),
        joinedload(models.Course.assignments),
        joinedload(models.Course.lessons),
        joinedload(models.Course.students)
    ).all()
    return courses

@router.get("/courses/{course_id}", response_model=schemas.CourseOut)
def get_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).options(
        joinedload(models.Course.teacher),
        joinedload(models.Course.assignments),
        joinedload(models.Course.lessons),
        joinedload(models.Course.students)
    ).filter(models.Course.id == course_id).first()

    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    return course

@router.delete("/courses/{course_id}")
def delete_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    db.delete(course)
    db.commit()
    return {"detail": f"Course {course_id} has been deleted successfully."}

#========LESSONS=========
@router.post("/courses/{course_id}/lessons", response_model=schemas.LessonOut)
def create_lesson(
    course_id: int,
    title: str = Form(...),
    content: str = Form(...),
    video: UploadFile = File(None),
    _=Depends(require_lecturer),
    db: Session = Depends(get_db)
):
    video_url = None
    if video:
        file_location = f"videos/{video.filename}"
        with open(file_location, "wb") as f:
            f.write(video.file.read())
        video_url = f"/{file_location}"

    new_lesson = models.Lesson(
        title=title,
        content=content,
        course_id=course_id,
        video_url=video_url
    )
    db.add(new_lesson)
    db.commit()
    db.refresh(new_lesson)
    return new_lesson

@router.get("/lessons", response_model=List[schemas.LessonOut])
def get_lessons(db: Session = Depends(get_db)):
    return db.query(models.Lesson).all()

@router.get("/lessons/{lesson_id}", response_model=List[schemas.LessonOut])
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.query(models.Lesson).get(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

@router.patch("/lessons/{lesson_id}", response_model=schemas.LessonOut)
def update_lesson(
    lesson_id: int,
    title: Optional[str] = Form(None),
    content: Optional[str] = Form(None),
    video: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    _=Depends(require_lecturer),
):
    lesson = db.query(models.Lesson).filter(models.Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    if title is not None:
        lesson.title = title
    if content is not None:
        lesson.content = content
    if video is not None:
        # Save the uploaded video file and update lesson.video_url
        filename = f"videos/{uuid.uuid4()}_{video.filename}"
        with open(filename, "wb") as f:
            f.write(video.file.read())
        lesson.video_url = f"/{filename}"

    db.commit()
    db.refresh(lesson)
    return lesson

@router.delete("/lessons/{lesson_id}")
def delete_lesson(
    lesson_id: int,
    _=Depends(require_lecturer),
    db: Session = Depends(get_db)
):
    lesson = db.query(models.Lesson).get(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return {"detail": f"Lesson {lesson_id} deleted."}

# GET course-specific lessons
@router.get("/courses/{course_id}/lessons", response_model=List[schemas.LessonOut])
def get_course_lessons(course_id: int, db: Session = Depends(get_db)):
    lessons = db.query(models.Lesson).filter(models.Lesson.course_id == course_id).all()
    return lessons

#=======ASSIGNMENTS=======
@router.post("/courses/{course_id}/assignments", response_model=schemas.AssignmentOut)
def create_assignment_for_course(
    course_id: int,
    assignment: schemas.AssignmentCreate,
    _=Depends(require_lecturer),
    db: Session = Depends(get_db)
):
    new_assignment = models.Assignment(
        title=assignment.title,
        description=assignment.description,
        due_date=assignment.due_date,
        course_id=course_id
    )
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    return new_assignment

@router.get("/assignments/{assignment_id}", response_model=schemas.AssignmentOut)
def get_assignment(assignment_id: int, db: Session = Depends(get_db)):
    assignment = db.query(models.Assignment).get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment

@router.patch("/assignments/{assignment_id}", response_model=schemas.AssignmentOut)
def update_assignment(
    assignment_id: int,
    update_data: schemas.AssignmentBase,  # Reuse base schema
    _=Depends(require_lecturer),
    db: Session = Depends(get_db)
):
    assignment = db.query(models.Assignment).get(assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(assignment, field, value)

    db.commit()
    db.refresh(assignment)
    return assignment

# GET course-specific assignments
@router.get("/courses/{course_id}/assignments", response_model=List[schemas.AssignmentOut])
def get_course_assignments(course_id: int, db: Session = Depends(get_db)):
    assignments = db.query(models.Assignment).filter(models.Assignment.course_id == course_id).all()
    return assignments

#=======SUBMISSIONS=======
@router.post("/submissions", response_model=schemas.SubmissionOut)
def create_submission(
    submission: schemas.SubmissionCreate,
    _=Depends(require_student),
    db: Session = Depends(get_db)
):
    new_submission = models.Submission(**submission.model_dump())
    db.add(new_submission)
    db.commit()
    db.refresh(new_submission)
    return new_submission

@router.get("/submission", response_model=List[schemas.SubmissionOut])
def get_submissions(
    _=Depends(require_lecturer),
    db: Session = Depends(get_db)
):
    return db.query(models.Submission).all()

@router.get("/submissions/{submission_id}", response_model=schemas.SubmissionOut)
def get_submission(submission_id: int, 
        _=Depends(require_lecturer),
        db: Session = Depends(get_db)):
    submission = db.get(models.Submission, submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission

@router.get("/assignments/{assignment_id}/submissions", response_model=List[schemas.SubmissionOut])
def get_submissions_for_assignment(assignment_id: int, db: Session = Depends(get_db), _=Depends(require_lecturer)):
    return db.query(models.Submission).filter(models.Submission.assignment_id == assignment_id).all()




@router.get("/courses/{course_id}/students", response_model=List[schemas.UserOut])
def get_students_in_course(course_id: int, db: Session = Depends(get_db)):
    course = db.query(models.Course).get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    return course.students

@router.post("/courses/{course_id}/enroll")
def enroll_student(course_id: int, db: Session = Depends(get_db), current_user=Depends(require_student)):
    course = db.query(models.Course).get(course_id)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if current_user in course.students:
        raise HTTPException(status_code=400, detail="Already enrolled")
    
    course.students.append(current_user)
    db.commit()
    return {"detail": f"Enrolled in course {course.name}"}


@router.patch("/submissions/{submission_id}/review", response_model=schemas.SubmissionOut)
def mark_reviewed(submission_id: int, db: Session = Depends(get_db), _=Depends(require_lecturer)):
    sub = db.query(models.Submission).get(submission_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.reviewed = True
    db.commit()
    db.refresh(sub)
    return sub

@router.get("/students/{student_id}/courses", response_model=List[EnrolledCourseOut])
def get_student_courses(student_id: int, db: Session = Depends(get_db)):
    student = db.query(User).filter(User.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    enrolled_courses = student.courses_enrolled  

    return student.courses_enrolled


@router.get("/students/{student_id}/courses", response_model=List[CourseOut])
def get_enrolled_courses(student_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    return student.enrolled_courses

@router.post("/assignments/{assignment_id}/submit")
async def submit_assignment(
    assignment_id: int,
    file: UploadFile = File(...),
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    # Generate unique file name
    filename = f"{uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    # Create a new submission record
    submission = Submission(
        file_path=file_path,
        timestamp=datetime.utcnow(),
        user_id=current_user["id"],
        assignment_id=assignment_id
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    return {
        "message": "Submission successful",
        "submission_id": submission.id,
        "file_path": submission.file_path,
        "timestamp": submission.timestamp
    }

@router.get("/assignments/{assignment_id}/my-submissions")
def get_my_submissions(
    assignment_id: int,
    current_user: dict = Depends(require_student),
    db: Session = Depends(get_db),
):
    submissions = db.query(Submission).filter_by(
        assignment_id=assignment_id,
        user_id=current_user["id"]
    ).all()

    if not submissions:
        return {"message": "No submissions found"}

    return [
        {
            "id": sub.id,
            "file_path": sub.file_path,
            "timestamp": sub.timestamp,
            "reviewed": sub.reviewed
        }
        for sub in submissions
    ]

@router.post("/students/{student_id}/enroll")
def enroll_in_course(student_id: int, data: dict, db: Session = Depends(get_db)):
    course_id = data.get("course_id")
    student = db.query(User).filter(User.id == student_id).first()
    course = db.query(Course).filter(Course.id == course_id).first()

    if not student or not course:
        raise HTTPException(status_code=404, detail="Student or Course not found")

    if course in student.courses_enrolled:
        raise HTTPException(status_code=400, detail="Already enrolled")

    student.courses_enrolled.append(course)
    db.commit()
    return {"message": f"Student {student.name} enrolled in {course.name}"}

