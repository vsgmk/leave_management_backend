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



















