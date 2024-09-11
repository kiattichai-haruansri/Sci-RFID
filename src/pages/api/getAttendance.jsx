import { db } from "@/firebase/config";
import { getDocs, collection } from "firebase/firestore";

// Fetch all attendance records
export const getAttendanceRecords = async () => {
  try {
    const snapshot = await getDocs(collection(db, "Attendance"));
    const attendanceData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return attendanceData;
  } catch (e) {
    console.error(e);
    return [];
  }
};

// Fetch student data by RFID
export const getStudentByRFID = async (rfid) => {
  try {
    const snapshot = await getDocs(collection(db, "Students"));
    const studentDoc = snapshot.docs.find((doc) => doc.id === rfid);
    return studentDoc ? { id: studentDoc.id, ...studentDoc.data() } : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

// Fetch location data by ID
export const getLocationById = async (locationId) => {
  try {
    const snapshot = await getDocs(collection(db, "Locations"));
    const locationDoc = snapshot.docs.find((doc) => doc.id === locationId);
    return locationDoc ? { id: locationDoc.id, ...locationDoc.data() } : null;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default async function handler(req, res) {
  try {
    const attendanceRecords = await getAttendanceRecords();

    const detailedRecords = await Promise.all(
      attendanceRecords.map(async (record) => {
        const student = await getStudentByRFID(record.RFID);
        const location = await getLocationById(record.location_id);
        return {
          ...record,
          studentName: student?.name || "Unknown",
          studentNumber: student?.student_number || "Unknown",
          locationName: location?.name || "Unknown",
          locationDescription: location?.description || "Unknown",
        };
      })
    );

    res.status(200).json(detailedRecords);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Failed to fetch attendance data" });
  }
}
