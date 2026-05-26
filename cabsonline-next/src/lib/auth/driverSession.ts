const driverSessionKey = "cabsonline_driver_session";
const driverProfileIdKey = "cabsonline_driver_profile_id";
export const driverSessionChangedEvent = "cabsonline_driver_session_changed";

export function isDriverSessionActive() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(driverSessionKey) === "active";
}

export function getDriverProfileId() {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_DRIVER_PROFILE_ID ?? null;
  }

  return (
    window.localStorage.getItem(driverProfileIdKey) ??
    process.env.NEXT_PUBLIC_DRIVER_PROFILE_ID ??
    null
  );
}

export function startDriverSession(profileId?: string | null) {
  window.localStorage.setItem(driverSessionKey, "active");

  if (profileId) {
    window.localStorage.setItem(driverProfileIdKey, profileId);
  }

  window.dispatchEvent(new Event(driverSessionChangedEvent));
}

export function endDriverSession() {
  window.localStorage.removeItem(driverSessionKey);
  window.localStorage.removeItem(driverProfileIdKey);
  window.dispatchEvent(new Event(driverSessionChangedEvent));
}
