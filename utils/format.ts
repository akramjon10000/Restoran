export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'decimal',
    maximumFractionDigits: 0,
  }).format(amount) + " so'm";
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    if(isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('uz-UZ', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (e) {
    return dateString;
  }
}