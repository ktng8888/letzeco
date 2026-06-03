// mobile/utils/challengeHelpers.js

export function getDaysLeft(endDate) {
  if (!endDate) return 0;
  const diff = Math.ceil(
    (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, diff);
}

export function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function getTargetLabel(type) {
  switch (type) {
    case 'co2_kg': return 'kg CO₂';
    case 'count':  return 'items';
    case 'litre':  return 'L';
    case 'kwh':    return 'kWh';
    default:       return '';
  }
}

export function formatProgress(value, targetType, unit) {
  if (!value && value !== 0) return '0';
  const num = parseFloat(value);
  if (unit) {
    const normalizedUnit = String(unit).toLowerCase();
    const isWholeNumberUnit = targetType === 'count'
      || normalizedUnit === 'actions'
      || normalizedUnit === 'items';
    const rounded = isWholeNumberUnit
      ? Math.round(num)
      : Number.isInteger(num) ? Math.round(num) : num.toFixed(1);
    return `${rounded} ${unit}`;
  }
  switch (targetType) {
    case 'co2_kg': return `${num.toFixed(1)} kg CO₂`;
    case 'count':  return `${Math.round(num)} items`;
    case 'litre':  return `${num.toFixed(1)} L`;
    case 'kwh':    return `${num.toFixed(1)} kWh`;
    default:       return Math.round(num).toString();
  }
}
