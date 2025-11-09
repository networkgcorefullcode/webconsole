export function isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
}

export function isEmail(value: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
}

export function isNumber(value: string): boolean {
    return !isNaN(Number(value));
}

export function isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
}

export function isValidUrl(value: string): boolean {
    const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}(:\d+)?(\/[^\s]*)?$/i;
    return urlRegex.test(value);
}