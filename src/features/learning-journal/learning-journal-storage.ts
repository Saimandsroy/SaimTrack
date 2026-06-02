import { doc, getDoc, setDoc } from "firebase/firestore";
import type { LearningNote } from "@/features/learning-journal/learning-journal-types";
import { db } from "@/lib/firebase";

const STORAGE_KEY = "careeros.learning-journal.v1";

export async function loadLearningNotes(userId: string): Promise<LearningNote[]> {
  if (!db || !userId) return [];
  
  try {
    const docRef = doc(db, "users", userId, "learning-journal", "state");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return Array.isArray(data.notes) ? (data.notes as LearningNote[]) : [];
    }
  } catch (error) {
    console.error("Failed to load learning notes from Firestore:", error);
  }
  
  return [];
}

export async function saveLearningNotes(userId: string, notes: LearningNote[]) {
  if (!db || !userId) return;
  
  try {
    const docRef = doc(db, "users", userId, "learning-journal", "state");
    await setDoc(docRef, { notes }, { merge: true });
  } catch (error) {
    console.error("Failed to save learning notes to Firestore:", error);
  }
}
