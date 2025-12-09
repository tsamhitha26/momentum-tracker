function minutesToMilliseconds(minutes) {
  return minutes * 60 * 1000;
}

function formatTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function getRemainingTime(endTime) {
  const now = new Date().getTime();
  const remainingTime = endTime - now;
  return remainingTime > 0 ? remainingTime : 0;
}

export { minutesToMilliseconds, formatTime, getRemainingTime };

export function formatMMSS(totalSeconds) {
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const ss = Math.floor(totalSeconds % 60).toString().padStart(2, "0");
  return `${mm}:${ss}`;
}