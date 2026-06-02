import { doc, getDoc, setDoc } from "firebase/firestore";
import type { DsaProblem } from "@/features/dsa-tracker/dsa-tracker-types";
import { db } from "@/lib/firebase";

export async function loadDsaProblems(userId: string): Promise<DsaProblem[]> {
  if (!db || !userId) return [];
  try {
    const docRef = doc(db, "users", userId, "dsa-tracker", "state");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().problems || [];
    }
  } catch (error) {
    console.error("Failed to load DSA problems from Firestore:", error);
  }
  return [];
}

export async function saveDsaProblems(userId: string, problems: DsaProblem[]) {
  if (!db || !userId) return;
  try {
    const docRef = doc(db, "users", userId, "dsa-tracker", "state");
    await setDoc(docRef, { problems }, { merge: true });
  } catch (error) {
    console.error("Failed to save DSA problems to Firestore:", error);
  }
}
