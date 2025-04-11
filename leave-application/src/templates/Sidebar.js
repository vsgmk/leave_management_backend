import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const [userType, setUserType] = useState(null);
  const [userName, setUserName] = useState("User");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserType(user.is_teacher ? "teacher" : "student");
      setUserName(user.name || "User");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const studentLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Your Leaves", path: "/your-leaves" },
    { name: "View Attendance", path: "/view-attendance" },
    { name: "Profile", path: "/profile" },
  ];

  const teacherLinks = [
    { name: "Dashboard", path: "/teacher_dashboard" },
    { name: "Mark Attendance", path: "/mark-attendance" },
    { name: "View Attendance", path: "/view-attendance" },
    { name: "Profile", path: "/profile" },
  ];

  const links = userType === "teacher" ? teacherLinks : studentLinks;

  return (
    <div className="custom-sidebar">
      <h2 className="custom-sidebar-title">{userType?.toUpperCase() || "USER"}</h2>
      <ul className="custom-sidebar-links">
        {links.map((link) => (
          <li key={link.name}>
            <Link to={link.path} className="custom-sidebar-link">
              {link.name}
            </Link>
          </li>
        ))}
      </ul>
      <button className="custom-logout-btn" onClick={handleLogout}>
        <LogOut className="mr-2" /> Logout
      </button>
    </div>
  );
};

export default Sidebar;
