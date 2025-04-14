from django.urls import path
from .views import register_student, verify_otp, login_view, apply_leave, register_teacher, verify_teacher_otp, teacher_login, approve_leave, get_teachers, get_teacher_leave_requests, get_leave_requests, get_student_leaves, get_profile, update_profile,     mark_attendance, edit_attendance, get_attendance, attendance_percentage, get_students, mark_attendance ,edit_attendance

urlpatterns = [
    path("register/student/", register_student, name="register"),
    path("verify-otp/", verify_otp, name="verify_otp"),
    path("login/student/", login_view, name="login"),
    path("apply_leave/", apply_leave, name="apply_leave"),  # Ensure this is correct
    path("register/teacher/", register_teacher, name="register_teacher"),
    path("verify_teacher_otp/", verify_teacher_otp, name="verify_teacher_otp"),
    path("login/teacher/", teacher_login, name="login/teacher/"),
    path("approve_leave/<int:leave_id>/", approve_leave, name="approve_leave"),
    path("get_teachers/", get_teachers, name="get_teachers"),
    path("teacher/leave_requests/", get_teacher_leave_requests, name="get_teacher_leave_requests"),
    path("leave_requests/", get_leave_requests, name="leave_requests"),
    path("student_leaves/", get_student_leaves, name="student-leaves"),
    path("profile/", get_profile, name="get_profile"),
    path("update_profile/", update_profile, name="update_profile"),
    
    path("get_attendance/", get_attendance, name="get_attendance"),
    path("get_students/", get_students, name="get-students"),
    path("mark_attendance/", mark_attendance, name="mark-attendance"),
    path("edit_attendance/", edit_attendance, name="edit_attendance")
]