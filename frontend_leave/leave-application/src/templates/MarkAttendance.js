import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import "./MarkAttendance.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2"; // Import SweetAlert2

const MarkAttendance = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [error, setError] = useState(null); // ✅ Added
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [division, setDivision] = useState("");
  const [sessionType, setSessionType] = useState("");
  const [batch, setBatch] = useState("");
  const [editMode, setEditMode] = useState(false);

  const divisionsFY = ["A", "B", "C", "D", "E", "F"];
  const branches = ["Computer", "IT", "Mechanical", "ENTC"];
  const divisionsSY = ["S1", "S2", "S3"];
  const divisionsTY = ["T1", "T2", "T3"];
  const divisionsBE = ["B1", "B2", "B3"];

  const accessToken = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await axios.get(
          `http://127.0.0.1:8000/api/get_students/?year=${year}&division=${division}&batch=${batch}&session_type=${sessionType}&branch=${branch}`,
          {
            headers: {
              Authorization: `Bearer ${token}`, // ✅ This is the correct format for JWT
            },
          }
        );

        if (response.status === 200) {
          const data = response.data;
          if (data.length === 0) {
            setError("No students found for the selected criteria.");
            setStudents([]);
          } else {
            setStudents(data);
            setError(null);
          }
        } else {
          setError("Failed to fetch students: Server returned an error.");
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        setError("An error occurred while fetching students.");
      }
    };

    if (year && division && sessionType) {
      fetchStudents();
    }
  }, [year, branch, division, sessionType, batch]);

  useEffect(() => {
    let filtered = [];

    if (year === "1" && sessionType === "Lecture") {
      filtered = students.filter((s) => s.year === 1 && s.division === division);
    } else if (year === "1" && sessionType === "Practical" && batch) {
      filtered = students.filter((s) => s.year === 1 && s.division === division && s.batch === batch);
    } else if (["2", "3", "4"].includes(year) && branch && division && sessionType) {
      if (sessionType === "Lecture") {
        filtered = students.filter(
          (s) => s.year === parseInt(year) && s.branch === branch && s.division === division
        );
      } else if (sessionType === "Practical" && batch) {
        filtered = students.filter(
          (s) =>
            s.year === parseInt(year) &&
            s.branch === branch &&
            s.division === division &&
            s.batch === batch
        );
      }
    }

    setFilteredStudents(filtered);
    const defaultAttendance = filtered.reduce((acc, student) => {
      acc[student.roll_number] = "Present";
      return acc;
    }, {});
    setAttendance(defaultAttendance);
  }, [students, year, branch, division, sessionType, batch]);

  const handleAttendanceChange = (rollNumber, status) => {
    setAttendance((prev) => ({ ...prev, [rollNumber]: status }));
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTimeSlot || !year || !division || !sessionType) {
      return Swal.fire({
        icon: 'warning',
        title: 'Missing Fields',
        text: 'Please fill in all required fields before submitting.',
      });
    }

    if (!accessToken) {
      Swal.fire({
        icon: 'error',
        title: 'Authentication Error',
        text: 'User not authenticated!',
      });
      return navigate("/login");
    }

    const requestData = {
      date: selectedDate,
      time_slot: selectedTimeSlot,
      year,
      branch,
      division,
      session_type: sessionType,
      batch,
      attendance,
      edit: editMode,
    };

    try {
      setIsSubmitting(true);
      const response = await axios.post("http://localhost:8000/api/mark_attendance/", requestData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: response.data.message,
      });
    } catch (error) {
      console.error("Error submitting:", error.response?.data || error);
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Session Expired',
          text: 'Session expired. Please login again.',
        });
        localStorage.removeItem("access_token");
        navigate("/login");
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Attendance Already Filled',
          text: 'The attendance has already been filled for this session.',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const showStudentTable = () => {
    if (!sessionType || !division) return false;
    if (sessionType === "Lecture") return true;
    if (sessionType === "Practical" && batch) return true;
    return false;
  };

  return (
    <div className="attendance-container">
      <Sidebar />
      <div className="attendance-main">
        <Navbar />
        <div className="attendance-content">
          <h2>Mark Attendance</h2>

          {/* Form Inputs */}
          <div className="input-group">
            <label>Date:</label>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>

          <div className="input-group">
            <label>Time Slot:</label>
            <select value={selectedTimeSlot} onChange={(e) => setSelectedTimeSlot(e.target.value)}>
              <option value="">Select</option>
              <option value="9:00 AM - 9:55 AM">9:00 AM - 9:55 AM</option>
              <option value="9:56 AM - 10:50 AM">9:56 AM - 10:50 AM</option>
              <option value="11:10 AM - 12:05 PM">11:10 AM - 12:05 PM</option>
              <option value="12:06 PM - 1:00 PM">12:06 PM - 1:00 PM</option>
              <option value="2:00 PM - 3:00 PM">2:00 PM - 3:00 PM</option>
              <option value="3:00 PM - 4:00 PM">3:00 PM - 4:00 PM</option>
              <option value="4:00 PM - 5:00 PM">4:00 PM - 5:00 PM</option>
            </select>
          </div>

          <div className="input-group">
            <label>Year:</label>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setBranch("");
                setDivision("");
                setSessionType("");
                setBatch("");
              }}
            >
              <option value="">Select</option>
              <option value="1">FY</option>
              <option value="2">SY</option>
              <option value="3">TY</option>
              <option value="4">BE</option>
            </select>
          </div>

          {year === "1" && (
            <div className="input-group">
              <label>Division:</label>
              <select
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value);
                  setBatch("");
                  setSessionType("");
                }}
              >
                <option value="">Select</option>
                {divisionsFY.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {["2", "3", "4"].includes(year) && (
            <>
              <div className="input-group">
                <label>Branch:</label>
                <select
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    setBatch("");
                    setSessionType("");
                  }}
                >
                  <option value="">Select</option>
                  {branches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Division:</label>
                <select
                  value={division}
                  onChange={(e) => {
                    setDivision(e.target.value);
                    setBatch("");
                    setSessionType("");
                  }}
                >
                  <option value="">Select</option>
                  {(year === "2" ? divisionsSY : year === "3" ? divisionsTY : divisionsBE).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {division && (
            <div className="input-group">
              <label>Session Type:</label>
              <select
                value={sessionType}
                onChange={(e) => {
                  setSessionType(e.target.value);
                  setBatch("");
                }}
              >
                <option value="">Select</option>
                <option value="Lecture">Lecture</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
          )}

          {sessionType === "Practical" && (
            <div className="input-group">
              <label>Batch:</label>
              <select value={batch} onChange={(e) => setBatch(e.target.value)}>
                <option value="">Select</option>
                <option value={`${division}1`}>{division}1</option>
                <option value={`${division}2`}>{division}2</option>
                <option value={`${division}3`}>{division}3</option>
              </select>
            </div>
          )}

          {/* Attendance Table */}
          {showStudentTable() && (
            <div className="attendance-table">
              <table>
                <thead>
                  <tr>
                    <th>Roll Number</th>
                    <th>Name</th>
                    <th>Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student.roll_number}>
                      <td>{student.roll_number}</td>
                      <td>{student.name}</td>
                      <td>
                        <select
                          value={attendance[student.roll_number]}
                          onChange={(e) => handleAttendanceChange(student.roll_number, e.target.value)}
                        >
                          <option value="Present">Present</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Submit Button */}
          <button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Attendance"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
