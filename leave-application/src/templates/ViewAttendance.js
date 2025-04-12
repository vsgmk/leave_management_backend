import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer"; // ✅ Import Footer
import "./ViewAttendance.css";

const ViewAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [date, setDate] = useState("");
    const [error, setError] = useState("");
    const [isTeacher, setIsTeacher] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const fetchAttendance = async () => {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setError("❌ No access token found! Please log in.");
            return;
        }

        if (!date) {
            setError("❌ Please select a date!");
            return;
        }

        try {
            const response = await axios.get(`https://leave-management-backend-8.onrender.com/api/get_attendance/?date=${date}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (Array.isArray(response.data) && response.data.length > 0) {
                setAttendance(response.data.map(entry => ({
                    roll_number: entry.roll_number,
                    full_name: entry.full_name,
                    email: entry.email,
                    date: entry.date,
                    time_slot: entry.time_slot,
                    status: entry.status
                })));

                setError("");
                setIsTeacher(response.data[0]?.email !== undefined);
                setIsEditing(false);
            } else {
                setAttendance([]);
                setError("❌ No attendance records found for the selected date.");
            }
        } catch (error) {
            console.error("❌ Error fetching attendance:", error);
            setError("❌ Unauthorized access or invalid date. Please try again.");
        }
    };

    const handleStatusChange = (index, newStatus) => {
        const updatedAttendance = [...attendance];
        updatedAttendance[index].status = newStatus;
        setAttendance(updatedAttendance);
    };

    const updateAttendance = async () => {
        const token = localStorage.getItem("access_token");

        const payload = {
            date: date,
            time_slot: attendance[0]?.time_slot,
            attendance: attendance.map(entry => ({
                roll_number: entry.roll_number,
                status: entry.status,
            })),
        };

        try {
            const response = await axios.put(
                "https://leave-management-backend-8.onrender.com/api/edit_attendance/",
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 200) {
                alert("✅ Attendance updated successfully!");
                setIsEditing(false);
            }
        } catch (error) {
            console.error("❌ Error updating attendance:", error);
            if (error.response) {
                alert(`❌ Update failed: ${JSON.stringify(error.response.data)}`);
            } else {
                alert("❌ Network or server issue! Please try again.");
            }
        }
    };

    return (
        <div>
            <Navbar />
            <Sidebar />
            <div className="attendance-container">
                <h2>View Attendance</h2>

                <label>Select Date:</label>
                <div className="input-container">
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                    />
                    <button onClick={fetchAttendance}>Get Attendance</button>
                </div>

                {error && <p className="error">{error}</p>}

                {attendance.length > 0 && (
                    <>
                        {isTeacher && (
                            <button 
                                onClick={() => setIsEditing(!isEditing)} 
                                className="edit-btn"
                            >
                                {isEditing ? "Cancel Edit" : "Edit Attendance"}
                            </button>
                        )}

                        <table border="1">
                            <thead>
                                <tr>
                                    <th>Roll Number</th>
                                    <th>Full Name</th>
                                    {isTeacher && <th>Email ID</th>}
                                    <th>Date</th>
                                    <th>Time Slot</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((entry, index) => (
                                    <tr key={index}>
                                        <td>{entry.roll_number}</td>
                                        <td>{entry.full_name}</td>
                                        {isTeacher && <td>{entry.email}</td>}
                                        <td>{entry.date}</td>
                                        <td>{entry.time_slot}</td>
                                        <td>
                                            {isEditing ? (
                                                <select 
                                                    value={entry.status} 
                                                    onChange={(e) => handleStatusChange(index, e.target.value)}
                                                >
                                                    <option value="Present">Present</option>
                                                    <option value="Absent">Absent</option>
                                                </select>
                                            ) : (
                                                entry.status
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {isEditing && (
                            <button 
                                onClick={updateAttendance} 
                                className="update-btn"
                            >
                                Update Attendance
                            </button>
                        )}
                    </>
                )}
            </div>
            <Footer /> {/* ✅ Add Footer Here */}
        </div>
    );
};

export default ViewAttendance;
