import React, { useEffect, useState } from "react";
import "./YourLeaves.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer"; // ✅ Import Footer

const YourLeaves = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState(null);

  const fetchStudentLeaves = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Unauthorized access. Please login again.");
        return;
      }

      const response = await fetch("https://leave-management-backend-8.onrender.com/api/student_leaves/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Raw Response:", response);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Parsed Response Data:", data); 

      if (!data.leaves || !Array.isArray(data.leaves)) {
        throw new Error("Expected 'leaves' array in response, but got something else.");
      }

      setLeaveRequests(data.leaves);
    } catch (error) {
      console.error("Fetch error:", error.message);
      setError("Failed to fetch leave requests.");
    }
  };

  useEffect(() => {
    fetchStudentLeaves();
  }, []);

  return (
    <div className="your-leaves-container">
      <Navbar />
      <div className="content-wrapper">
        <Sidebar />
        <div className="main-content">
          <h2 className="text-xl font-bold mb-4">Your Leave Requests</h2>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <table className="leave-table">
              <thead>
                <tr>
                  <th>From Date</th>
                  <th>To Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Approved By</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((leave) => (
                  <tr key={leave.id}>
                    <td>{leave.from_date}</td>
                    <td>{leave.to_date}</td>
                    <td>{leave.reason}</td>
                    <td className={`status ${leave.status.toLowerCase()}`}>
                      {leave.status}
                    </td>
                    <td>{leave.teachers__username || "Pending"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Footer /> {/* ✅ Footer added here */}
    </div>
  );
};

export default YourLeaves;
