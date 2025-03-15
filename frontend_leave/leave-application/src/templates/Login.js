import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginStudent, loginTeacher } from "../services/api";
import "./Login.css"; // Import CSS file

const Login = () => {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Determine user type from URL query params (?type=student or ?type=teacher)
  const userType = new URLSearchParams(location.search).get("type") || "student";

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      console.log("Attempting login for:", userType, credentials);
      const response =
        userType === "teacher" ? await loginTeacher(credentials) : await loginStudent(credentials);

      console.log("Login response:", response.data);
      if (!response.data.access_token || !response.data.user) {
        setError("Invalid login response");
        return;
      }

      localStorage.setItem("access_token", response.data.access_token);
      localStorage.setItem("refresh_token", response.data.refresh_token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      alert(response.data.message);
      navigate(response.data.user.is_teacher ? "/teacher_dashboard" : "/dashboard");
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      setError(error.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2 className="login-title">Login as {userType === "teacher" ? "Teacher" : "Student"}</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="login-input"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="login-input"
            onChange={handleChange}
            required
          />
          <button type="submit" className="login-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
