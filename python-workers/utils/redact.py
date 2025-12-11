import re

def redact(data):
    if isinstance(data, Exception):
        return {
            'type': type(data).__name__,
            'message': redact(str(data)),
            'args': redact(data.args)
        }
    
    
    if isinstance(data, str):
        result = data
        result = re.sub(r'password["\s:]*["\']?([^"\']+)["\']?', 'password: [REDACTED]', result, flags=re.IGNORECASE)
        result = re.sub(r'token["\s:]*["\']?([^"\']+)["\']?', 'token: [REDACTED]', result, flags=re.IGNORECASE)
        result = re.sub(r'apikey["\s:]*["\']?([^"\']+)["\']?', 'apikey: [REDACTED]', result, flags=re.IGNORECASE)
        result = re.sub(r'secret["\s:]*["\']?([^"\']+)["\']?', 'secret: [REDACTED]', result, flags=re.IGNORECASE)
        result = re.sub(r'authorization["\s:]*["\']?Bearer\s+([^"\']+)["\']?', 'authorization: Bearer [REDACTED]', result, flags=re.IGNORECASE)
        result = re.sub(r'Bearer\s+[^\s]+', 'Bearer [REDACTED]', result, flags=re.IGNORECASE)
        result = re.sub(r'(mongodb|postgres|mysql|mssql)://[^\s]+', '[DATABASE_URL_REDACTED]', result, flags=re.IGNORECASE)
        return result
    
    if isinstance(data, dict):
        redacted = {}
        sensitive_keys = [
            'password', 'pwd', 'secret', 'token', 'apikey', 'api_key',
            'authorization', 'bearer', 'privatekey', 'private_key',
            'refresh_token', 'refreshtoken', 'access_token', 'accesstoken'
        ]
        
        for key, value in data.items():
            if any(k in key.lower() for k in sensitive_keys):
                redacted[key] = '[REDACTED]'
            elif isinstance(value, dict) or isinstance(value, list):
                redacted[key] = redact(value)
            elif isinstance(value, str):
                redacted[key] = redact(value)
            else:
                redacted[key] = value
        return redacted
    
    if isinstance(data, list):
        return [redact(item) for item in data]
    
    return data
