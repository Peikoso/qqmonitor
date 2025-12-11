export function validateTimeFormat(time) {
    const regex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    return regex.test(time);
}

export function validateTimestampFormat(timestamp) {
  const regex = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;
  if (!regex.test(timestamp)) {
    return false;
  }

  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    return false;
  }

  return true;
}


export function isValidUuid(uuid) {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return regex.test(uuid);
}