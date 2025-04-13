import React, { useEffect, useState } from "react";
import Navbar from "./Navbar"; 
import Sidebar from "./Sidebar";
import "./Profile.css";
import Footer from "./Footer"; // Adjust path as needed
import Swal from "sweetalert2"; // Import SweetAlert2

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setError("Unauthorized access. Please login again.");
        return;
      }

      try {
        const response = await fetch("https://leave-management-backend-8.onrender.com/api/profile/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("access_token");
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }

        const data = await response.json();
        setProfile(data);
        setUpdatedProfile(data);
      } catch (error) {
        setError("Error fetching profile.");
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    setUpdatedProfile({ ...updatedProfile, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("https://leave-management-backend-8.onrender.com/api/update_profile/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile.");
      }

      setProfile(updatedProfile);
      setIsEditing(false);

      // Use SweetAlert2 for success message
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been successfully updated!",
      });
    } catch (error) {
      // Use SweetAlert2 for error message
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "There was an error updating your profile.",
      });
    }
  };

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-content">
        <Sidebar />
        <div className="profile-container">
          <h2>Profile</h2>
          {error && <p className="error">{error}</p>}
          {profile && (
            <div className="profile-details">
              {isEditing ? (
                <>
                  {/* First Name & Last Name in One Row */}
                  <div className="input-row">
                    <div className="input-group">
                      <label>First Name:</label>
                      <input
                        type="text"
                        name="first_name"
                        value={updatedProfile.first_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="input-group">
                      <label>Last Name:</label>
                      <input
                        type="text"
                        name="last_name"
                        value={updatedProfile.last_name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
    
                  {/* Email & Phone Number in One Row */}
                  <div className="input-row">
                    <div className="input-group">
                      <label>Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={updatedProfile.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="input-group">
                      <label>Phone Number:</label>
                      <input
                        type="text"
                        name="phone_number"
                        value={updatedProfile.phone_number}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
    
                  {/* Student Fields */}
                  {profile.role === "Student" && (
                    <>
                      {/* Roll Number & Branch in One Row */}
                      <div className="input-row">
                        <div className="input-group">
                          <label>Roll Number:</label>
                          <input
                            type="text"
                            name="roll_number"
                            value={updatedProfile.roll_number}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="input-group">
                          <label>Branch:</label>
                          <input
                            type="text"
                            name="branch"
                            value={updatedProfile.branch}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
    
                      {/* Batch & Year in One Row */}
                      <div className="input-row">
                        <div className="input-group">
                          <label>Batch:</label>
                          <input
                            type="text"
                            name="batch"
                            value={updatedProfile.batch}
                            onChange={handleInputChange}
                          />
                        </div>
                        <div className="input-group">
                          <label>Year:</label>
                          <input
                            type="text"
                            name="year"
                            value={updatedProfile.year}
                            onChange={handleInputChange}
                          />
                        </div>
                      </div>
                    </>
                  )}
    
                  {/* Teacher Field */}
                  {profile.role === "Teacher" && (
                    <>
                      <label>Department:</label>
                      <input
                        type="text"
                        name="department"
                        value={updatedProfile.department}
                        onChange={handleInputChange}
                      />
                    </>
                  )}
    
                  {/* Buttons */}
                  <div className="button-row">
                    <button className="save-btn" onClick={handleUpdateProfile}>
                      Save Changes
                    </button>
                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p><strong>First Name:</strong> {profile.first_name}</p>
                  <p><strong>Last Name:</strong> {profile.last_name}</p>
                  <p><strong>Email:</strong> {profile.email}</p>
                  <p><strong>Phone Number:</strong> {profile.phone_number}</p>
    
                  {profile.role === "Student" && (
                    <>
                      <p><strong>Roll Number:</strong> {profile.roll_number}</p>
                      <p><strong>Branch:</strong> {profile.branch}</p>
                      <p><strong>Batch:</strong> {profile.batch}</p>
                      <p><strong>Year:</strong> {profile.year}</p>
                    </>
                  )}
    
                  {profile.role === "Teacher" && (
                    <>
                      <p><strong>Department:</strong> {profile.department}</p>
                    </>
                  )}
    
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    Edit Profile
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer /> {/* <- Add Footer here */}
    </div>    
  );
};

export default Profile;
