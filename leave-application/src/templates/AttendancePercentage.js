import { useState, useEffect } from "react";
import { getAttendancePercentage } from "../services/api";

const AttendancePercentage = ({ studentId }) => {
  const [percentage, setPercentage] = useState(0);

  useEffect(() => {
    getAttendancePercentage(studentId).then((data) => setPercentage(data.percentage));
  }, [studentId]);

  return (
    <div>
      <h2>Attendance Percentage</h2>
      <p>{percentage}%</p>
    </div>
  );
};

export default AttendancePercentage;
