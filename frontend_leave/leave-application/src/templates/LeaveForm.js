import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2"; // Import SweetAlert2
import { applyLeave } from "../services/api";
import "./LeaveForm.css"; // Importing CSS

const LeaveForm = () => {
  const [formData, setFormData] = useState({
    from_date: "",
    to_date: "",
    reason: "",
    teachers: [],
  });

  const [teachers, setTeachers] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/get_teachers/")
      .then((response) => setTeachers(response.data.teachers))
      .catch((error) => console.error("Error fetching teachers:", error));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTeacherSelection = (e) => {
    const teacherEmail = e.target.value;
    let updatedTeachers = [...formData.teachers];

    if (e.target.checked) {
      if (updatedTeachers.length < 3) {
        updatedTeachers.push(teacherEmail);
      } else {
        setError("You can select a maximum of 3 teachers.");
        return;
      }
    } else {
      updatedTeachers = updatedTeachers.filter((email) => email !== teacherEmail);
    }

    setError(""); // Clear error if selection is valid
    setFormData({ ...formData, teachers: updatedTeachers });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.teachers.length) {
      setError("Please select at least one teacher.");
      return;
    }

    try {
      const response = await applyLeave(formData);
      setSuccessMessage(response.data.message);
      setError("");

      // Success SweetAlert
      Swal.fire({
        icon: "success",
        title: "Leave Request Submitted",
        text: response.data.message,
      });

      setFormData({
        from_date: "",
        to_date: "",
        reason: "",
        teachers: [],
      }); // Clear form after submission
    } catch (error) {
      setError(error.response?.data?.error || "Failed to submit leave request.");
      setSuccessMessage("");

      // Error SweetAlert
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || "Failed to submit leave request.",
      });
    }
  };

  return (
    <div className="leave-form-container">
      <h2>Apply for Leave</h2>

      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}

      <form onSubmit={handleSubmit}>
        <div className="date-group">
          <div className="input-group">
            <label>From Date:</label>
            <input
              type="date"
              name="from_date"
              value={formData.from_date}
              onChange={handleChange}
              required
            />
          </div>
        
          <div className="input-group">
            <label>To Date:</label>
            <input
              type="date"
              name="to_date"
              value={formData.to_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>        

        <div className="input-group">
          <label>Reason for Leave:</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
          />
        </div>

        <div className="input-group">
          <label>Select Teachers (Max 3):</label>
          <div className="teacher-checkboxes-scroll">
            {teachers.map((teacher) => (
              <label key={teacher.id} className="teacher-checkbox">
                <input
                  type="checkbox"
                  value={teacher.email}
                  checked={formData.teachers.includes(teacher.email)}
                  onChange={handleTeacherSelection}
                />
                {teacher.name} ({teacher.email})
              </label>
            ))}
          </div>
        </div>
        <button type="submit">Submit Leave Request</button>
      </form>
    </div>
  );
};

export default LeaveForm;
