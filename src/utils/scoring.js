import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase'; 

export const awardNeuralPower = async (uid, points) => {
  if (!uid) {
    console.warn("Scoring Engine: No UID provided. Cannot award points.");
    return;
  }
  
  try {
    const safePoints = parseInt(points, 10); 
    console.log(`[MATRIX SYNC] Injecting ${safePoints > 0 ? '+' : ''}${safePoints} Power to Agent ${uid}.`);
    const userRef = doc(db, 'directory', uid);
    
    await setDoc(userRef, {
      score: increment(safePoints)
    }, { merge: true });
    
  } catch (error) {
    console.error("Scoring Engine Error - Failed to sync power to the Matrix:", error);
  }
};