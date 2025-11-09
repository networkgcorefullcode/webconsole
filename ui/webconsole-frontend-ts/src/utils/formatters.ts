export function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}

export function formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
}

export function formatString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
}