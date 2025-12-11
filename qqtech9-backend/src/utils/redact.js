function redact(data) {
  if (typeof data === 'string') {
    return data
        .replace(/email["\s:]*["\']?([^"\']+)["\']?/gi, 'email: [REDACTED]')
        .replace(/password["\s:]*["\']?([^"\']+)["\']?/gi, 'password: [REDACTED]')
        .replace(/token["\s:]*["\']?([^"\']+)["\']?/gi, 'token: [REDACTED]')
        .replace(/phone["\s:]*["\']?([^"\']+)["\']?/gi, 'phone: [REDACTED]')
        .replace(/apikey["\s:]*["\']?([^"\']+)["\']?/gi, 'apikey: [REDACTED]')
        .replace(/secret["\s:]*["\']?([^"\']+)["\']?/gi, 'secret: [REDACTED]')
        .replace(/authorization["\s:]*["\']?Bearer\s+([^"\']+)["\']?/gi, 'authorization: Bearer [REDACTED]')
        .replace(/Bearer\s+[^\s]+/gi, 'Bearer [REDACTED]')
        .replace(/(mongodb|postgres|mysql|mssql):\/\/[^\s]+/gi, '[DATABASE_URL_REDACTED]');
    }

  if (typeof data === 'object' && data !== null) {
    if (Array.isArray(data)) {
        return data.map(item => redact(item));
    }

    const redacted = {};
    for (const [key, value] of Object.entries(data)) {
        if (['email', 'password', 'pwd', 'secret', 'token', 'phone', 'apiKey', 'api_key', 'authorization', 'bearer', 'privateKey', 'refresh_token', 'accessToken'].some(k => key.toLowerCase().includes(k))) {
        redacted[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
        redacted[key] = redact(value);
        } else if (typeof value === 'string') {
        redacted[key] = redact(value);
        } else {
        redacted[key] = value;
        }
    }
    return redacted;
  }

  return data;
}

export { redact };
