import random
import json
from django.core.mail import send_mail
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.timezone import now
from leaves.models import OTPModel, User
from django.conf import settings
from rest_framework.permissions import IsAuthenticated
from .models import LeaveApplication, User, Attendance
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.db.models import Count

User = get_user_model()  # Fetch custom user model

@csrf_exempt
def register_student(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            required_fields = [
                "first_name", "last_name", "roll_number", "branch", "batch",
                "year", "division", "email", "phone_number", "password"
            ]

            for field in required_fields:
                if not data.get(field):
                    return JsonResponse({"error": f"{field.replace('_', ' ').title()} is required."}, status=400)

            email = data["email"].strip()
            roll_number = data["roll_number"].strip()
            phone_number = data["phone_number"].strip()

            # Check for uniqueness
            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email already registered"}, status=400)
            if User.objects.filter(
                roll_number=roll_number,
                year=data["year"].strip(),
                division=data["division"].strip()
            ).exists():
                return JsonResponse({"error": f"Roll number {roll_number} already registered in {data['year']} {data['division']}"}, status=400)
            if User.objects.filter(phone_number=phone_number).exists():
                return JsonResponse({"error": "Phone number already registered"}, status=400)

            # Generate and store OTP
            otp = random.randint(100000, 999999)
            otp_entry, created = OTPModel.objects.get_or_create(email=email)
            otp_entry.otp = otp
            otp_entry.created_at = now()
            otp_entry.save()

            # Send OTP via Email
            send_mail(
                "Your OTP for Registration",
                f"Your OTP is: {otp}",
                "vaibhavsurvase674@gmail.com",  # Replace with your admin email
                [email],
                fail_silently=False,
            )

            return JsonResponse({"message": "OTP sent to email. Verify to complete registration."}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)


@csrf_exempt
def verify_otp(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get("email", "").strip()
        otp = data.get("otp", "").strip()
        
        # Common required fields (for both students & teachers)
        common_fields = ["email", "otp", "first_name", "last_name", "phone_number", "password"]

        # If roll_number is provided, assume the user is a student
        is_student = "roll_number" in data and data["roll_number"].strip()

        if is_student:
            # Required fields for students
            required_fields = common_fields + ["roll_number", "branch", "batch", "year"]
        else:
            # Required fields for teachers (No roll_number, branch, batch, year)
            required_fields = common_fields

        # Check for missing fields
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({"error": f"{field.replace('_', ' ').title()} is required."}, status=400)

        # Check OTP validity
        otp_entry = OTPModel.objects.filter(email=email, otp=otp).first()
        if not otp_entry:
            return JsonResponse({"error": "Invalid OTP."}, status=400)

        if (now() - otp_entry.created_at).seconds > 300:
            otp_entry.delete()
            return JsonResponse({"error": "OTP expired. Please request a new one."}, status=400)

        # Convert year to integer for students
        year = None
        if is_student:
            try:
                year = int(data["year"])
            except ValueError:
                return JsonResponse({"error": "Year must be a number."}, status=400)

        # Create and save the user
        user = User.objects.create(
            username=email,
            first_name=data["first_name"].strip(),
            last_name=data["last_name"].strip(),
            email=email,
            phone_number=data["phone_number"].strip(),
            is_verified=True,
            is_teacher=not is_student  # If not a student, then it's a teacher
        )

        # Set student-specific fields if the user is a student
        if is_student:
            user.roll_number = data["roll_number"].strip()
            user.branch = data["branch"].strip()
            user.batch = data["batch"].strip()
            user.year = year
            user.division = data["division"].strip()

        user.set_password(data["password"])
        user.save()

        otp_entry.delete()  # Delete OTP after successful verification
        return JsonResponse({"message": "OTP verified and user registered successfully!"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

User = get_user_model()
@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email", "").strip()
            password = data.get("password", "").strip()

            if not email or not password:
                return JsonResponse({"error": "Email and password are required."}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid email or password."}, status=401)

            if not user.check_password(password):
                return JsonResponse({"error": "Invalid email or password."}, status=401)

            if not user.is_verified:
                return JsonResponse({"error": "Email not verified. Please verify your email first."}, status=400)
            
            if user.is_teacher:
                return JsonResponse({"error": "Access denied. Only students can log in here."}, status=403)


            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return JsonResponse({
                "message": "Login successful!",
                "access_token": access_token,
                "refresh_token": str(refresh),
                "user": {
                    "id": user.id,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "is_verified": user.is_verified,
                }
            }, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=405)

User = get_user_model()  # Fetch custom user model

@csrf_exempt
def register_teacher(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            # Required fields check
            required_fields = ["first_name", "last_name", "email", "phone_number", "password"]
            for field in required_fields:
                if not data.get(field):
                    return JsonResponse({"error": f"{field.replace('_', ' ').title()} is required."}, status=400)

            email = data["email"].strip()

            # Check if the email is already registered
            if User.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email already registered"}, status=400)

            # Generate OTP
            otp = random.randint(100000, 999999)
            otp_entry, created = OTPModel.objects.get_or_create(email=email)
            otp_entry.otp = otp
            otp_entry.created_at = now()
            otp_entry.save()

            # Send OTP via Email
            send_mail(
                "Your OTP for Teacher Registration",
                f"Your OTP is: {otp}",
                "vaibhavsurvase674@gmail.com",  # Replace with your admin email
                [email],
                fail_silently=False,
            )

            return JsonResponse({"message": "OTP sent to email. Verify to complete registration."}, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Invalid request method"}, status=400)



@csrf_exempt
def verify_teacher_otp(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method"}, status=405)

    try:
        data = json.loads(request.body)

        # Required fields for teachers (NO roll_number, branch, batch, year)
        required_fields = ["email", "otp", "first_name", "last_name", "phone_number", "password"]
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({"error": f"{field.replace('_', ' ').title()} is required."}, status=400)

        email = data["email"].strip()
        otp = data["otp"].strip()

        # Check OTP
        otp_entry = OTPModel.objects.filter(email=email, otp=otp).first()
        if not otp_entry:
            return JsonResponse({"error": "Invalid OTP."}, status=400)

        # Check OTP expiration (5 min)
        if (now() - otp_entry.created_at).seconds > 300:
            otp_entry.delete()
            return JsonResponse({"error": "OTP expired. Please request a new one."}, status=400)

        # Create Teacher User (No roll number needed)
        teacher = User.objects.create(
            username=email,
            first_name=data["first_name"].strip(),
            last_name=data["last_name"].strip(),
            email=email,
            phone_number=data["phone_number"].strip(),
            is_teacher=True,  # Assuming you have a boolean field `is_teacher`
            is_verified=True
        )
        teacher.set_password(data["password"])
        teacher.save()

        otp_entry.delete()  # Delete OTP after successful verification
        return JsonResponse({"message": "OTP verified and teacher registered successfully!"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def teacher_login(request):
    """
    API for teachers to log in and get JWT token.
    """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({"error": "Email and Password are required"}, status=400)

            user = authenticate(username=email, password=password)

            # Debugging logs
            print(f"DEBUG: User authentication result: {user}")

            if user is None:
                return JsonResponse({"error": "Invalid email or password"}, status=401)
            if not user.is_teacher:
                return JsonResponse({"error": "You are not authorized as a teacher"}, status=403)

            # Generate JWT Token
            refresh = RefreshToken.for_user(user)

            response_data = {
                "message": "Login successful",
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "is_teacher": user.is_teacher
                }
            }

            print(f"DEBUG: Login success response: {response_data}")  # Debug log
            return JsonResponse(response_data, status=200)

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

    return JsonResponse({"error": "Invalid request method"}, status=405)

def get_teachers(request):
    """
    API to get the list of teachers.
    """
    teachers = User.objects.filter(is_teacher=True).values("id", "first_name", "last_name", "email")

    # Format response to include full name
    teachers_list = [
        {"id": t["id"], "name": f"{t['first_name']} {t['last_name']}", "email": t["email"]}
        for t in teachers
    ]

    return JsonResponse({"teachers": teachers_list}, status=200)

@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def apply_leave(request):
    """
    API for students to submit a leave application using teacher email IDs.
    """
    try:
        data = json.loads(request.body)

        # Required fields (No name field now)
        required_fields = ["from_date", "to_date", "reason", "teachers"]
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({"error": f"{field.replace('_', ' ').title()} is required."}, status=400)

        # Validate teachers (Max 3, Min 1)
        teacher_emails = data["teachers"]
        if not (1 <= len(teacher_emails) <= 3):
            return JsonResponse({"error": "You must select at least 1 and at most 3 teachers."}, status=400)

        # Fetch teachers from database using their email IDs
        selected_teachers = User.objects.filter(email__in=teacher_emails, is_teacher=True)

        if selected_teachers.count() != len(teacher_emails):
            return JsonResponse({"error": "One or more teacher emails are invalid."}, status=400)

        # Create Leave Application and Store in DB
        leave_application = LeaveApplication.objects.create(
            student=request.user,
            from_date=data["from_date"],
            to_date=data["to_date"],
            reason=data["reason"],
        )
        leave_application.teachers.set(selected_teachers)  # Add teachers
        leave_application.save()

        # Send Email Notification to Teachers
        email_subject = "New Leave Application Request"
        email_body = f"""
        Hello,

        You have received a leave application request from {request.user.first_name} {request.user.last_name}.

        From Date: {data["from_date"]}
        To Date: {data["to_date"]}
        Reason: {data["reason"]}

        Please review and approve/reject the request in the system.

        Regards,
        Leave Management System
        """

        send_mail(
            email_subject,
            email_body,
            "vaibhavsurvase674@gmail.com",  # Replace with your email
            teacher_emails,
            fail_silently=False,
        )

        return JsonResponse({"message": "Leave application submitted successfully!"}, status=201)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_teacher_leave_requests(request):
    """
    API for teachers to get all leave applications assigned to them.
    """
    print(f"DEBUG: User - {request.user.email}, is_teacher - {request.user.is_teacher}")

    if not request.user.is_teacher:
        return JsonResponse({"error": "Only teachers can access leave requests."}, status=403)

    # Fetch leave applications assigned to the logged-in teacher
    leave_requests = LeaveApplication.objects.filter(teachers=request.user).order_by("-created_at")

    leave_data = [
        {
            "id": leave.id,
            "student_name": leave.student.first_name + " " + leave.student.last_name,
            "email": leave.student.email,
            "from_date": leave.from_date,
            "to_date": leave.to_date,
            "reason": leave.reason,
            "status": leave.status
        }
        for leave in leave_requests
    ]

    return JsonResponse({"leave_requests": leave_data}, status=200, safe=False)

@csrf_exempt
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_leave_requests(request):
    """
    API for teachers to fetch assigned leave requests.
    """
    if not request.user.is_teacher:
        return JsonResponse({"error": "Only teachers can view leave requests."}, status=403)

    # Get leave requests assigned to the logged-in teacher
    leave_requests = LeaveApplication.objects.filter(teachers=request.user).values(
        "id",
        "student__first_name",
        "student__email",
        "from_date",
        "to_date",
        "reason",
        "status",
    )

    return JsonResponse(list(leave_requests), safe=False)

@csrf_exempt
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def approve_leave(request, leave_id):
    """
    API for teachers to approve/reject leave applications.
    Sends an email notification to the student after approval/rejection.
    """
    try:
        # Ensure only teachers can approve/reject
        if not request.user.is_teacher:
            return JsonResponse({"error": "Only teachers can approve/reject leave."}, status=403)

        # Get request data
        data = json.loads(request.body)
        status = data.get("status")

        if status not in ["Approved", "Rejected"]:
            return JsonResponse({"error": "Invalid status. Choose 'Approved' or 'Rejected'."}, status=400)

        # Get leave application
        leave = LeaveApplication.objects.get(id=leave_id)

        # Ensure the teacher is assigned to this leave request
        if request.user not in leave.teachers.all():
            return JsonResponse({"error": "You are not assigned to this leave request."}, status=403)

        # Update leave status
        leave.status = status
        leave.save()

        # Sending email notification to the student
        subject = f"Your Leave Application has been {status}"
        message = f"""
        Hello {leave.name},

        Your leave application has been **{status.lower()}** by {request.user.first_name} {request.user.last_name}.

        **Leave Details:**
        - **From:** {leave.from_date}
        - **To:** {leave.to_date}
        - **Reason:** {leave.reason}
        - **Status:** {status}

        Regards,  
        {request.user.first_name} {request.user.last_name} (Faculty)
        """

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [leave.student.email],  # Send email to student
            fail_silently=False,
        )

        return JsonResponse({"message": f"Leave application {status.lower()} successfully! Email sent to student."}, status=200)

    except LeaveApplication.DoesNotExist:
        return JsonResponse({"error": "Leave application not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_student_leaves(request):
    """
    API to get the logged-in student's leave applications including status updates.
    """
    try:
        print(f"User making request: {request.user}")  # ✅ Log user

        # Fetch leave applications with the latest status
        leaves = LeaveApplication.objects.filter(student=request.user).values(
            "id", "from_date", "to_date", "reason", "status", "teachers__username"
        )

        print("Leaves found:", leaves)  # ✅ Log leaves data

        return JsonResponse({"leaves": list(leaves)}, status=200)

    except Exception as e:
        print("Error:", str(e))  # ✅ Log errors in the backend
        return JsonResponse({"error": str(e)}, status=500)

@api_view(["GET"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    
    profile_data = {
        "first_name": user.first_name,
        "last_name": user.last_name,
        "email": user.email,
        "phone_number": user.phone_number,
        "is_teacher": user.is_teacher,
        "is_verified": user.is_verified,
    }

    if user.is_teacher:
        profile_data.update({
            "role": "Teacher",
            "department": user.department
        })
    else:
        profile_data.update({
            "role": "Student",
            "roll_number": user.roll_number,
            "branch": user.branch,
            "batch": user.batch,
            "year": user.year
        })

    return JsonResponse(profile_data, status=200)


    if user.is_teacher:
        profile_data.update({"role": "Teacher", "department": user.department})
    else:
        profile_data.update({
            "role": "Student",
            "roll_number": user.roll_number,
            "branch": user.branch,
            "batch": user.batch,
            "year": user.year
        })

    return JsonResponse(profile_data, status=200)


@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data  # Get data from frontend
    
    try:
        user.first_name = data.get("first_name", user.first_name)
        user.last_name = data.get("last_name", user.last_name)
        user.email = data.get("email", user.email)
        user.phone_number = data.get("phone_number", user.phone_number)

        if user.is_teacher:
            user.department = data.get("department", user.department)
        else:
            user.roll_number = data.get("roll_number", user.roll_number)
            user.branch = data.get("branch", user.branch)
            user.batch = data.get("batch", user.batch)
            user.year = data.get("year", user.year)

        user.save()

        return JsonResponse({"message": "Profile updated successfully!"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
@api_view(["POST"])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def mark_attendance(request):
    try:
        data = json.loads(request.body)
        print("Received Data:", data)

        date = data.get("date")
        time_slot = data.get("time_slot")
        attendance_data = data.get("attendance")
        year = data.get("year")
        branch = data.get("branch")
        division = data.get("division")
        session_type = data.get("session_type")
        batch = data.get("batch")

        if not date or not time_slot or not isinstance(attendance_data, dict):
            return JsonResponse({"message": "Please provide date, time slot, and attendance data."}, status=400)

        teacher = request.user

        # Check if attendance already exists
# NEW:
        existing_attendance = Attendance.objects.filter(
            date=date,
            time_slot=time_slot,
            teacher=teacher,
            division=division,
            session_type=session_type,
            batch=batch,
            year=year,
            branch=branch
        ).first()

        if existing_attendance:
            return JsonResponse({
                "message": f"Attendance is already marked for {date}, slot: {time_slot}, division: {division}, session: {session_type}, batch: {batch}."
            }, status=400)


        for roll_number, status in attendance_data.items():
            if not (roll_number and status):
                return JsonResponse({"message": "Invalid attendance data."}, status=400)

            student = get_object_or_404(User, roll_number=roll_number, is_teacher=False)

            Attendance.objects.create(
                student=student,
                date=date,
                time_slot=time_slot,
                status=status,
                teacher=teacher,
                year=year,
                branch=branch,
                division=division,
                session_type=session_type,
                batch=batch
            )

            # Send email to absent students
            if status == "Absent":
                student_name = f"{student.first_name} {student.last_name}"
                teacher_name = f"{teacher.first_name} {teacher.last_name}"

                send_mail(
                    subject="Lecture Absence Notification",
                    message=f"Dear {student_name},\n\n"
                            f"You were marked absent for the lecture on {date} during {time_slot}.\n"
                            f"Teacher: {teacher_name}\n\n"
                            f"Please ensure to attend future lectures.\n\n"
                            f"Regards,\nCollege Admin",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[student.email],
                    fail_silently=False,
                )

        return JsonResponse({"message": "Attendance marked successfully!"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"message": "Invalid JSON format in request."}, status=400)

    except Exception as e:
        print("Error:", e)
        return JsonResponse({"message": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_students(request):
    year = request.GET.get('year')
    division = request.GET.get('division')
    batch = request.GET.get('batch')
    branch = request.GET.get('branch')
    session_type = request.GET.get('session_type')  # This is NOT in DB – just used for logic

    if not (year and division and session_type):
        return JsonResponse({'error': 'Year, Division, and Session Type are required'}, status=400)

    try:
        year = int(year)
    except ValueError:
        return JsonResponse({'error': 'Year must be an integer'}, status=400)

    students = User.objects.filter(year=year)

    # 🎯 If session is 'Lecture' → filter using year + division [+ branch if SY/BE]
    if session_type == "Lecture":
        students = students.filter(division=division)
        if year > 1:  # SY, TY, BE
            if not branch:
                return JsonResponse({'error': 'Branch is required for SY/TY/BE lectures'}, status=400)
            students = students.filter(branch=branch)

    # 🔍 If session is 'Practical' → filter using year + division + batch [+ branch if SY/BE]
    elif session_type == "Practical":
        if not batch:
            return JsonResponse({'error': 'Batch is required for practicals'}, status=400)
        students = students.filter(division=division, batch=batch)
        if year > 1:
            if not branch:
                return JsonResponse({'error': 'Branch is required for SY/TY/BE practicals'}, status=400)
            students = students.filter(branch=branch)

    else:
        return JsonResponse({'error': 'Invalid session type. Use "Lecture" or "Practical"'}, status=400)

    # 🎒 Prepare final student list
    student_data = [
        {
            'id': student.id,
            'name': f"{student.first_name} {student.last_name}",
            'roll_number': student.roll_number,
            'year': student.year,
            'division': student.division,
            'batch': student.batch,
            'branch': student.branch,
        }
        for student in students
    ]

    return Response(student_data)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Attendance
from django.http import JsonResponse

User = get_user_model()

@api_view(['GET'])
@permission_classes([IsAuthenticated])  # Ensures authentication
def get_attendance(request):
    user = request.user  # Get the authenticated user
    date = request.GET.get("date")  # Get selected date from request

    if not date:
        return Response({"error": "Date is required"}, status=400)

    if user.is_teacher:
        # If the user is a teacher, fetch attendance for all students on that date
        attendance_records = (
            Attendance.objects.filter(teacher=user, date=date)
            .select_related("student")
            .order_by("student__roll_number")
            .values(
                "student__roll_number",  # Include roll number
                "student__first_name",
                "student__last_name",
                "student__email",
                "date",
                "time_slot",
                "status",
            )
        )
    else:
        # If the user is a student, fetch only their own attendance for that date
        attendance_records = (
            Attendance.objects.filter(student=user, date=date)
            .select_related("student")  # Make sure to select the student to get roll number and full name
            .values("student__roll_number", "student__first_name", "student__last_name", "student__email", "date", "time_slot", "status")
        )

    if not attendance_records:
        return Response({"message": "No attendance records found for the selected date."}, status=200)

    if user.is_teacher:
        # Format response for teachers
        formatted_records = [
            {
                "roll_number": entry["student__roll_number"],  # Include roll number
                "full_name": f"{entry['student__first_name']} {entry['student__last_name']}",
                "email": entry["student__email"],
                "date": entry["date"],
                "time_slot": entry["time_slot"],
                "status": entry["status"],
            }
            for entry in attendance_records
        ]
    else:
        # Format response for students
        formatted_records = [
            {
                "roll_number": entry["student__roll_number"],  # Include roll number
                "full_name": f"{entry['student__first_name']} {entry['student__last_name']}",  # Include full name
                "date": entry["date"],
                "time_slot": entry["time_slot"],
                "status": entry["status"],
            }
            for entry in attendance_records
        ]

    return Response(formatted_records, status=200)

@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def edit_attendance(request):
    """
    API to edit attendance before submission.
    """
    if not request.user.is_teacher:
        return JsonResponse({"error": "Only teachers can edit attendance"}, status=403)

    try:
        data = json.loads(request.body)
        date = data.get("date")
        time_slot = data.get("time_slot")  # Added time_slot in the check
        attendance_data = data.get("attendance")  # List of { "status": "Present", "roll_number": "12345" }

        # Check if required fields are present
        if not date or not time_slot or not attendance_data:
            return JsonResponse({"error": "Missing required fields"}, status=400)

        # Update all student attendance for that date and time slot
        for entry in attendance_data:
            status = entry.get("status")
            roll_number = entry.get("roll_number")  # Roll number for reference

            # Make sure status and roll_number are valid
            if not status or not roll_number:
                continue

            try:
                student = User.objects.get(roll_number=roll_number)

                # Check if there's more than one attendance for this student at the same time
                attendance_count = Attendance.objects.filter(student=student, date=date, time_slot=time_slot).count()

                if attendance_count > 1:
                    # Handle multiple records case (you can choose to delete or update only one)
                    Attendance.objects.filter(student=student, date=date, time_slot=time_slot).delete()
                    print(f"Multiple records found for {student} on {date} at {time_slot}, records deleted.")

                # Update or create a single attendance record with teacher_id (logged-in teacher)
                attendance, created = Attendance.objects.update_or_create(
                    student=student, date=date, time_slot=time_slot,
                    defaults={"status": status, "teacher": request.user}  # Adding teacher information
                )
            except User.DoesNotExist:
                continue  # Skip if the student doesn't exist

        return JsonResponse({"message": "Attendance updated successfully"}, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def attendance_percentage(request, student_id):
    """
    API to calculate attendance percentage.
    """
    if request.user.id != student_id and not request.user.is_teacher:
        return JsonResponse({"error": "Unauthorized access"}, status=403)

    total_classes = Attendance.objects.filter(student_id=student_id).count()
    present_classes = Attendance.objects.filter(student_id=student_id, status="Present").count()
    
    if total_classes == 0:
        percentage = 0
    else:
        percentage = (present_classes / total_classes) * 100

    return JsonResponse({"percentage": round(percentage, 2)}, status=200)

























