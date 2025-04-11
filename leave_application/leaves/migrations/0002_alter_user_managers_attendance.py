# Generated by Django 5.1.7 on 2025-03-15 06:07

import django.contrib.auth.models
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('leaves', '0001_initial'),
    ]

    operations = [
        migrations.AlterModelManagers(
            name='user',
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Attendance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('date', models.DateField()),
                ('time_slot', models.CharField(choices=[('9:00 AM - 9:55 AM', '9:00 AM - 9:55 AM'), ('9:56 AM - 10:50 AM', '9:56 AM - 10:50 AM'), ('11:10 AM - 12:05 PM', '11:10 AM - 12:05 PM'), ('12:06 PM - 1:00 PM', '12:06 PM - 1:00 PM'), ('2:00 PM - 3:00 PM', '2:00 PM - 3:00 PM'), ('3:00 PM - 4:00 PM', '3:00 PM - 4:00 PM'), ('4:00 PM - 5:00 PM', '4:00 PM - 5:00 PM')], max_length=50)),
                ('status', models.CharField(choices=[('Present', 'Present'), ('Absent', 'Absent')], max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('student', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('teacher', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attendance_taken', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
