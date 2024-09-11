import { db } from '@/firebase/config';
import { getDocs, collection } from 'firebase/firestore';

const getAllLocations = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'Locations'));
    const locationsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return locationsData;
  } catch (e) {
    console.log(e);
    return [];
  }
};

const getLocationById = async (locationId) => {
    try {
      const locationRef = doc(db, 'Locations', locationId);
      const locationDoc = await getDoc(locationRef);
      return locationDoc.exists() ? { id: locationDoc.id, ...locationDoc.data() } : null;
    } catch (e) {
      console.log(e);
      return null;
    }
  };

export { getAllLocations, getLocationById };
