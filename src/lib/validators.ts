export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return phone.startsWith('+') && phone.length >= 5;
}

export function isValidFieldName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

export function isValidUrl(url: string): boolean {
  return url.startsWith('https://') && url.length > 10;
}
