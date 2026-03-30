/** Daily Challenge utilities */

/** Get today's date in UTC as YYYY-MM-DD */
export function getTodayUTC(): string {
  return new Date().toISOString().split("T")[0];
}

/** Get or create a persistent device ID for leaderboard dedup */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("drydock_device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("drydock_device_id", id);
  }
  return id;
}

/** Check if player already attempted today's challenge */
export function hasAttemptedToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`daily_attempted_${getTodayUTC()}`) === "true";
}

/** Mark today's challenge as attempted */
export function markAttempted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`daily_attempted_${getTodayUTC()}`, "true");
}

/** Check if player already submitted score today */
export function hasSubmittedToday(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(`daily_submitted_${getTodayUTC()}`) === "true";
}

/** Mark today's score as submitted */
export function markSubmitted(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(`daily_submitted_${getTodayUTC()}`, "true");
}
