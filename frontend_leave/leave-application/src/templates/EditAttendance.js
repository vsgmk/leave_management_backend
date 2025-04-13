import { useState, useEffect } from "react";
import { getAttendance, editAttendance } from "../services/api";

const EditAttendance = ({ date, slot }) => {
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    getAttendance(date, slot).then((data) => setAttendance(data));
  }, [date, slot]);

  const handleChange = (id, status) => {
    setAttendance((prev) => prev.map((att) => (att.id === id ? { ...att, status } : att)));
  };

  const handleSave = async () => {
    await editAttendance(date, slot, attendance);
    alert("Attendance updated!");
  };

  return (
    <div>
      <h2>Edit Attendance</h2>
      {attendance.map((att) => (
        <div key={att.id}>
          <span>{att.name} - {att.roll_number}</span>
          <select value={att.status} onChange={(e) => handleChange(att.id, e.target.value)}>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>
      ))}
      <button onClick={handleSave}>Save Changes</button>
    </div>
  );
};

export default EditAttendance;
