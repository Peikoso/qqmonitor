export function toSeconds(hours, minutes, seconds = 0) {
  return (hours * 60 + minutes) * 60 + seconds;
}

export function isWithinTimeRange(currentTime, startTime, endTime) {
    const start = toSeconds(...startTime.split(':').map(Number));
    const end = toSeconds(...endTime.split(':').map(Number));

    const now = toSeconds(...currentTime.split(':').map(Number));

    if( end < start ){
        return now >= start || now <= end;

    }

    return now >= start && now <= end;
}
