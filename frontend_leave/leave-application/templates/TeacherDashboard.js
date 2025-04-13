import React from "react";
import LeaveRequest from "./LeaveRequest"; // Import the LeaveRequest component
import Navbar from "./Navbar"; // Import the Navbar component
import Sidebar from "./Sidebar"; // Import the Sidebar component
import "./TeacherDashboard.css"; // Import CSS file
import Footer from "./Footer";

const TeacherDashboard = () => {
  return (
    <div className="teacher-dashboard">
      <Navbar /> {/* Navbar at the top */}

      <div className="dashboard-content">
        <Sidebar /> {/* Sidebar on the left */}

        <div className="leave-request-container">
          <LeaveRequest /> {/* Display leave requests */}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TeacherDashboard;
