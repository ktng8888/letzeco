function normalizeTimeLimit(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const stringValue = String(value).trim();

  if (stringValue === '') {
    return null;
  }

  if (typeof value === 'number' || /^\d+(\.\d+)?$/.test(stringValue)) {
    return minutesToInterval(value);
  }

  const timeParts = stringValue.match(/^(\d+):(\d+)(?::(\d+))?$/);
  if (timeParts) {
    const [, hours, minutes, seconds = 0] = timeParts;
    return secondsToInterval(
      Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds)
    );
  }

  const unitParts = stringValue.match(
    /^(\d+(?:\.\d+)?)\s*(second|seconds|minute|minutes|hour|hours)$/i
  );
  if (unitParts) {
    const amount = Number(unitParts[1]);
    const unit = unitParts[2].toLowerCase();
    let multiplier = 1;

    if (unit.startsWith('hour')) {
      multiplier = 3600;
    } else if (unit.startsWith('minute')) {
      multiplier = 60;
    }

    return secondsToInterval(Math.round(amount * multiplier));
  }

  throwTimeLimitError();
}

function minutesToInterval(minutes) {
  const totalSeconds = Math.round(Number(minutes) * 60);
  return secondsToInterval(totalSeconds);
}

function secondsToInterval(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    throwTimeLimitError();
  }

  return `${totalSeconds} seconds`;
}

function throwTimeLimitError() {
  const error = new Error('Time limit must be a valid number of minutes.');
  error.statusCode = 400;
  throw error;
}

module.exports = {
  normalizeTimeLimit,
};
