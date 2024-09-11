import { db } from '@/firebase/config';
import { getDocs, collection, query, where } from 'firebase/firestore';

const getAllAttendance = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'Attendance'));
      const attendanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return attendanceData;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

const getAttendanceById = async (attendanceId) => {
    try {
      const attendanceRef = doc(db, 'Attendance', attendanceId);
      const attendanceDoc = await getDoc(attendanceRef);
      return attendanceDoc.exists() ? { id: attendanceDoc.id, ...attendanceDoc.data() } : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

const getAttendanceByRFID = async (RFID) => {
    try {
      const q = query(collection(db, 'Attendance'), where('RFID', '==', RFID));
      const snapshot = await getDocs(q);
      const attendanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return attendanceData;
    } catch (e) {
      console.log(e);
      return [];
    }
  };

const getAttendanceByLocationId = async (locationId) => {
  try {
    const q = query(collection(db, 'Attendance'), where('location_id', '==', locationId));
    const snapshot = await getDocs(q);
    const attendanceData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return attendanceData;
  } catch (e) {
    console.log(e);
    return [];
  }
};

export { getAllAttendance ,getAttendanceById ,getAttendanceByRFID, getAttendanceByLocationId };
