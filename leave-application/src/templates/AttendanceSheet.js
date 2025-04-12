import React, { useState, useEffect } from "react";

const AttendanceSheet = () => {
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [message, setMessage] = useState("");

  const timeSlots = [
    "9:00 AM - 9:55 AM",
    "9:56 AM - 10:50 AM",
    "11:10 AM - 12:05 PM",
    "12:06 PM - 1:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
  ];

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch("https://leave-management-backend-8.onrender.com/api/students/", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);

        // Initialize attendance list with all students marked "Present"
        const initialAttendance = data.map((student) => ({
          student_id: student.id,
          status: "Present",
        }));
        setAttendance(initialAttendance);
      } else {
        console.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) =>
      prev.map((entry) =>
        entry.student_id === studentId ? { ...entry, status } : entry
      )
    );
  };

  const handleSubmit = async () => {
    if (!date || !timeSlot) {
      setMessage("Please select date and time slot.");
      return;
    }

    try {
      const response = await fetch("https://leave-management-backend-8.onrender.com/api/mark-attendance/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ date, time_slot: timeSlot, attendance }),
      });

      if (response.ok) {
        setMessage("Attendance marked successfully!");
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || "Failed to submit attendance.");
      }
    } catch (error) {
      console.error("Error submitting attendance:", error);
      setMessage("Error submitting attendance.");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Mark Attendance</h2>

      <div className="mb-4">
        <label className="block font-bold">Select Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-2 py-1"
        />
      </div>

      <div className="mb-4">
        <label className="block font-bold">Select Time Slot:</label>
        <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)} className="border px-2 py-1">
          <option value="">-- Select Time Slot --</option>
          {timeSlots.map((slot, index) => (
            <option key={index} value={slot}>
              {slot}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full border-collapse border border-gray-400">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-4 py-2">Roll No</th>
            <th className="border border-gray-400 px-4 py-2">Name</th>
            <th className="border border-gray-400 px-4 py-2">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.id} className="text-center">
                <td className="border border-gray-400 px-4 py-2">{student.roll_number}</td>
                <td className="border border-gray-400 px-4 py-2">{student.name}</td>
                <td className="border border-gray-400 px-4 py-2">
                  <select
                    value={attendance.find((a) => a.student_id === student.id)?.status || "Present"}
                    onChange={(e) => handleAttendanceChange(student.id, e.target.value)}
                    className="border px-2 py-1"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center border border-gray-400 py-4">
                No students available.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleSubmit}>
        Submit Attendance
      </button>

      {message && <p className="mt-2 text-red-500">{message}</p>}
    </div>
  );
};

export default AttendanceSheet;
