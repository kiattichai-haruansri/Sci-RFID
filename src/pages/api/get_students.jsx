import { db } from '@/firebase/config';
import { getDocs, collection, query, where } from 'firebase/firestore';

const getStudents = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'Students'));
    const studentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return studentsData;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const getStudentByRFId = async (studentRFId) => {
  try {
    const snapshot = await getDocs(collection(db, 'Students'));
    const studentDoc = snapshot.docs.find(doc => doc.id === studentRFId);
    return studentDoc?.data();
  } catch (e) {
    console.log(e);
    return null;
  }
};

const getStudentByStudentNumber = async (studentNumber) => {
  try {
    const q = query(collection(db, 'Students'), where('student_number', '==', studentNumber));
    const snapshot = await getDocs(q);
    const studentDoc = snapshot.docs[0];
    return studentDoc?.data();
  } catch (e) {
    console.log(e);
    return null;
  }
};

export { getStudents, getStudentByRFId, getStudentByStudentNumber };