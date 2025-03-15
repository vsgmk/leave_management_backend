import React, { useEffect, useState } from "react";
import "./LeaveRequest.css"; // Importing CSS

const LeaveRequest = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [error, setError] = useState(null);

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("Unauthorized access. Please login again.");
        return;
      }

      const response = await fetch("http://localhost:8000/api/leave_requests/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error("Fetch error:", error.message);
      setError("Failed to fetch leave requests.");
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Function to update leave status (Approve/Reject)
  const handleStatusUpdate = async (leaveId, status) => {
    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`http://localhost:8000/api/approve_leave/${leaveId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update leave status.");
      }

      // Update UI immediately
      setLeaveRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === leaveId ? { ...request, status } : request
        )
      );

      alert(`Leave request ${status.toLowerCase()} successfully!`);
    } catch (error) {
      console.error("Error updating leave status:", error);
      alert("Failed to update leave status.");
    }
  };

  return (
    <div className="leave-requests-container">
      <h2 className="leave-requests-title">Leave Requests</h2>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <table className="leave-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Email</th>
              <th>From Date</th>
              <th>To Date</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.student__first_name}</td>
                <td>{leave.student__email}</td>
                <td>{leave.from_date}</td>
                <td>{leave.to_date}</td>
                <td>{leave.reason}</td>
                <td className={`status ${leave.status.toLowerCase()}`}>{leave.status}</td>
                <td>
                  {leave.status === "Pending" && (
                    <>
                      <button
                        className="approve-btn"
                        onClick={() => handleStatusUpdate(leave.id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleStatusUpdate(leave.id, "Rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaveRequest;
