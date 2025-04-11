import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registerStudent, registerTeacher } from "../services/api";
import Swal from "sweetalert2";
import "./Register.css";

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    roll_number: "",
    branch: "",
    batch: "",
    year: "",
    division: "",
  });
  const [error, setError] = useState("");

  const divisionsByYear = {
    1: ["A", "B", "C", "D", "E", "F"],
    2: ["A", "B"],
    3: ["A", "B"],
    4: ["A", "B"],
  };

  const batchesByDivision = {
    A: ["A1", "A2", "A3"],
    B: ["B1", "B2", "B3"],
    C: ["C1", "C2", "C3"],
    D: ["D1", "D2", "D3"],
    E: ["E1", "E2", "E3"],
    F: ["F1", "F2", "F3"],
    S: ["S1", "S2", "S3"],
    T: ["T1", "T2", "T3"],
    B: ["B1", "B2", "B3"],
  };

  const departments = [
    "Computer Science and Engineering",
    "Electronics and Telecommunication",
    "Electrical",
    "Civil",
    "Mechanical",
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type === "teacher") {
      setUserType("teacher");
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Convert year to its respective number
    const yearMapping = {
      FY: "1",
      SY: "2",
      TY: "3",
      BE: "4",
    };

    setFormData({
      ...formData,
      [name]: name === "year" ? yearMapping[value] || value : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response =
        userType === "student"
          ? await registerStudent(formData)
          : await registerTeacher(formData);

      // Display success SweetAlert
      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: response.data.message,
      });

      navigate("/verify-otp", { state: { email: formData.email, formData } });
    } catch (error) {
      setError(error.response?.data?.error || "Registration failed");
      // Display error SweetAlert
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.error || "Registration failed",
      });
    }
  };

  return (
    <div className="register-container">
      <div className="register-box">
        <h2>{userType === "student" ? "Student" : "Teacher"} Register</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input type="text" name="first_name" placeholder="First Name" className="input-field" onChange={handleChange} required />
          <input type="text" name="last_name" placeholder="Last Name" className="input-field" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" className="input-field" onChange={handleChange} required />
          <input type="text" name="phone_number" placeholder="Phone Number" className="input-field" onChange={handleChange} maxLength="10" pattern="[0-9]{10}" title="Enter a valid 10-digit phone number" required />
          <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />

          {userType === "student" && (
            <>
              <select name="year" className="input-field" onChange={handleChange} required>
                <option value="">Select Year</option>
                <option value="FY">FY</option>
                <option value="SY">SY</option>
                <option value="TY">TY</option>
                <option value="BE">BE</option>
              </select>

              {formData.year && (
                <select name="division" className="input-field" onChange={handleChange} required>
                  <option value="">Select Division</option>
                  {divisionsByYear[formData.year]?.map((div) => (
                    <option key={div} value={div}>{div}</option>
                  ))}
                </select>
              )}

              {formData.division && (
                <select name="batch" className="input-field" onChange={handleChange} required>
                  <option value="">Select Batch</option>
                  {batchesByDivision[formData.division]?.map((batch) => (
                    <option key={batch} value={batch}>{batch}</option>
                  ))}
                </select>
              )}

              <input type="text" name="roll_number" placeholder="Roll Number" className="input-field" onChange={handleChange} required />

              <select name="branch" className="input-field" onChange={handleChange} required>
                <option value="">Select Branch</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </>
          )}

          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
