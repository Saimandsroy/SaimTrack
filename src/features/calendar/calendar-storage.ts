import { doc, getDoc, setDoc } from "firebase/firestore";
import type { CalendarEvent, CalendarState } from "@/features/calendar/calendar-types";
import { createSeedEvents } from "@/features/calendar/calendar-utils";
import { db } from "@/lib/firebase";

const STORAGE_KEY = "careeros.calendar.v1";

export const defaultCalendarState: CalendarState = {
  events: [],
};

export async function loadCalendarState(userId: string): Promise<CalendarState> {
  if (!db || !userId) return { events: createSeedEvents(new Date()) };
  
  try {
    const docRef = doc(db, "users", userId, "calendar", "state");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        events: Array.isArray(data.events) ? (data.events as CalendarEvent[]) : [],
      };
    }
  } catch (error) {
    console.error("Failed to load calendar from Firestore:", error);
  }
  
  return { events: createSeedEvents(new Date()) };
}

export async function saveCalendarState(userId: string, state: CalendarState) {
  if (!db || !userId) return;
  
  try {
    const docRef = doc(db, "users", userId, "calendar", "state");
    await setDoc(docRef, state, { merge: true });
  } catch (error) {
    console.error("Failed to save calendar to Firestore:", error);
  }
}
