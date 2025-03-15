import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { registerStudent, registerTeacher } from "../services/api";
import "./Register.css"; // ✅ Importing the CSS file

const Register = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userType, setUserType] = useState("student"); // Default to student
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    ...(userType === "student" && {
      roll_number: "",
      branch: "",
      batch: "",
      year: "",
    }),
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type === "teacher") {
      setUserType("teacher");
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response =
        userType === "student"
          ? await registerStudent(formData)
          : await registerTeacher(formData);

      alert(response.data.message);
      navigate("/verify-otp", { state: { email: formData.email, formData } });
    } catch (error) {
      setError(error.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="register-container"> {/* ✅ Applied CSS class */}
      <div className="register-box"> {/* ✅ Applied CSS class */}
        <h2>{userType === "student" ? "Student" : "Teacher"} Register</h2>
        {error && <p className="error-message">{error}</p>} {/* ✅ Applied CSS class */}
        <form onSubmit={handleSubmit}>
          <input type="text" name="first_name" placeholder="First Name" className="input-field" onChange={handleChange} required />
          <input type="text" name="last_name" placeholder="Last Name" className="input-field" onChange={handleChange} required />
          <input type="email" name="email" placeholder="Email" className="input-field" onChange={handleChange} required />
          <input type="text" name="phone_number" placeholder="Phone Number" className="input-field" onChange={handleChange} required />
          <input type="password" name="password" placeholder="Password" className="input-field" onChange={handleChange} required />

          {userType === "student" && (
            <>
              <input type="text" name="roll_number" placeholder="Roll Number" className="input-field" onChange={handleChange} required />
              <input type="text" name="branch" placeholder="Branch" className="input-field" onChange={handleChange} required />
              <input type="text" name="batch" placeholder="Batch" className="input-field" onChange={handleChange} required />
              <input type="number" name="year" placeholder="Year" className="input-field" onChange={handleChange} required />
            </>
          )}

          <button type="submit" className="register-button">Register</button> {/* ✅ Applied CSS class */}
        </form>
      </div>
    </div>
  );
};

export default Register;
