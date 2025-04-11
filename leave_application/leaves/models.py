from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.timezone import now, timedelta
from django.db import models
from django.contrib.auth import get_user_model

class User(AbstractUser):
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=15, unique=True)
    is_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)  # True for teachers, False for students

    # Fields only for Students
    roll_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    branch = models.CharField(max_length=100, null=True, blank=True)
    batch = models.CharField(max_length=10, null=True, blank=True)
    year = models.IntegerField(null=True, blank=True)
    division = models.CharField(max_length=10, null=True, blank=True)

    # Fields only for Teachers
    department = models.CharField(max_length=100, null=True, blank=True)
    is_teacher = models.BooleanField(default=False) 

    USERNAME_FIELD = "email"  # Login using email
    REQUIRED_FIELDS = ["username", "phoney_number"]
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({'Teacher' if self.is_staff else 'Student'})"


class OTPModel(models.Model):
    email = models.CharField(max_length=254, unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_expired(self):
        return now() > self.created_at + timedelta(minutes=1)  # OTP valid for 1 min

    def __str__(self):
        return f"{self.email} - {self.otp}"

User = get_user_model()  # Get the custom user model

class LeaveApplication(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)  # Student applying for leave
    name = models.CharField(max_length=255)  # Student's name
    from_date = models.DateField()  # Start date of leave
    to_date = models.DateField()  # End date of leave
    reason = models.TextField()  # Leave reason
    teachers = models.ManyToManyField(User, related_name="leave_requests")  # Teachers to approve
    status = models.CharField(
        max_length=20,
        choices=[("Pending", "Pending"), ("Approved", "Approved"), ("Rejected", "Rejected")],
        default="Pending"
    )  # Leave status
    applied_at = models.DateTimeField(auto_now_add=True)  # Timestamp of application

    def __str__(self):
        return f"{self.name} - {self.from_date} to {self.to_date}"























from django.db import models
from django.contrib.auth import get_user_model
from django.core.mail import send_mail

User = get_user_model()

class Attendance(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE)  # Student
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, related_name="attendance_taken")  # Teacher
    date = models.DateField()  # Attendance Date
    time_slot = models.CharField(
        max_length=50,
        choices=[
            ("9:00 AM - 9:55 AM", "9:00 AM - 9:55 AM"),
            ("9:56 AM - 10:50 AM", "9:56 AM - 10:50 AM"),
            ("11:10 AM - 12:05 PM", "11:10 AM - 12:05 PM"),
            ("12:06 PM - 1:00 PM", "12:06 PM - 1:00 PM"),
            ("2:00 PM - 3:00 PM", "2:00 PM - 3:00 PM"),
            ("3:00 PM - 4:00 PM", "3:00 PM - 4:00 PM"),
            ("4:00 PM - 5:00 PM", "4:00 PM - 5:00 PM"),
        ]
    )
    year = models.IntegerField(choices=[(1, "FY"), (2, "SY"), (3, "TY"), (4, "BE")])
    branch = models.CharField(max_length=50, blank=True, null=True)
    division = models.CharField(max_length=10, null=True, blank=True)
    session_type = models.CharField(max_length=20, choices=[("Lecture", "Lecture"), ("Practical", "Practical")])
    batch = models.CharField(max_length=10, blank=True, null=True)
    status = models.CharField(max_length=10, choices=[("Present", "Present"), ("Absent", "Absent")])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        student_name = self.student.get_full_name() if hasattr(self.student, "get_full_name") else self.student.username
        return f"{student_name} - {self.date} - {self.time_slot} - {self.status}"

    def notify_absent_student(self):
        from .models import LeaveApplication  # Avoid circular import in general, though this works

        leave_exists = LeaveApplication.objects.filter(
            student=self.student, 
            from_date__lte=self.date, 
            to_date__gte=self.date,
            status="Approved"
        ).first()

        if self.status == "Absent" and not leave_exists:
            subject = "Attendance Alert: You were marked absent"
            message = (
                f"Dear {self.student.get_full_name() if hasattr(self.student, 'get_full_name') else self.student.username},\n\n"
                f"You were marked absent for the lecture on {self.date} ({self.time_slot}).\n"
                f"Teacher: {self.teacher.get_full_name() if hasattr(self.teacher, 'get_full_name') else self.teacher.username}\n\n"
                f"Please ensure your attendance meets the required criteria.\n\n"
                f"Regards,\nAdministration"
            )

            send_mail(
                subject=subject,
                message=message,
                from_email="admin@yourcollege.edu",
                recipient_list=[self.student.email],
                fail_silently=False,
            )
