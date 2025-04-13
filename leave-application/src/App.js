import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./templates/Home";
import Login from "./templates/Login";
import Register from "./templates/Register";
import VerifyOTP from "./templates/VerifyOTP";
import Dashboard from "./templates/Dashboard";  // Import Dashboard
import TeacherDashboard from "./templates/TeacherDashboard";
import YourLeaves from "./templates/YourLeaves";
import Profile from "./templates/Profile";
import MarkAttendance from "./templates/MarkAttendance";
import ViewAttendance from "./templates/ViewAttendance"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teacher_dashboard" element={<TeacherDashboard />} />
        <Route path="/your-leaves" element={<YourLeaves />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/teacher_dashboard" element={<TeacherDashboard />} />
        <Route path="/mark-attendance" element={<MarkAttendance />} />
        <Route path="/view-attendance" element={<ViewAttendance />} />


      </Routes>
    </Router>
  );
}

export default App;
