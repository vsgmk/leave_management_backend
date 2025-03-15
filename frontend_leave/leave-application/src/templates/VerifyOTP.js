import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { verifyOTP } from "../services/api";
import "./VerifyOTP.css"

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const formData = location.state?.formData;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await verifyOTP({ ...formData, email, otp });
      alert(response.data.message);
      navigate("/login"); // Redirect to login after successful verification
    } catch (error) {
      setError(error.response?.data?.error || "Invalid OTP");
    }
  };

  return (
    <div className="verify-otp-container">
      <div className="verify-otp-box">
        <h2 className="verify-otp-title">Verify OTP</h2>
        {error && <p className="verify-otp-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter OTP"
            className="verify-otp-input"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <button type="submit" className="verify-otp-button">
            Verify OTP
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOTP;
