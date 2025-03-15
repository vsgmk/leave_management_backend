import React from "react";
import LeaveRequest from "./LeaveRequest"; // Import the LeaveRequest component
import Navbar from "./Navbar"; // Import the Navbar component
import Sidebar from "./Sidebar"; // Import the Sidebar component
import "./TeacherDashboard.css"; // Import CSS file

const TeacherDashboard = () => {
  return (
    <div className="teacher-dashboard">
      <Navbar /> {/* Navbar at the top */}

      <div className="dashboard-content">
        <Sidebar /> {/* Sidebar on the left */}

        <div className="leave-request-container">
          <h1>Teacher Dashboard</h1>
          <LeaveRequest /> {/* Display leave requests */}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
