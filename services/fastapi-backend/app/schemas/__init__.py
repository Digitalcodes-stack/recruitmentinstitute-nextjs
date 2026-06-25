from app.schemas.auth import CurrentUser, LoginRequest, LogoutRequest, RefreshRequest, TokenPair
from app.schemas.common import ErrorResponse
from app.schemas.course import CourseCreate, CourseRead, CourseUpdate
from app.schemas.enrollment import EnrollmentCreate, EnrollmentRead
from app.schemas.meeting import MeetingCreate, MeetingRead, MeetingUpdate
from app.schemas.notification import NotificationRead
from app.schemas.placement import NotificationCreate, PlacementTrackingCreate
from app.schemas.placement_tracking import PlacementTrackingRead
from app.schemas.resume import ResumeRead
from app.schemas.trainer import AssignedTrainerResponse, TrainerAssignmentRead, TrainerAssignmentRequest, TrainerCreate, TrainerRead, TrainerStudentsResponse
