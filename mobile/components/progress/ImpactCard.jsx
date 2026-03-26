import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import colors from '../../constants/colors';

export default function ImpactCard({
  icon, value, unit, label, onPress
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{formatValue(value)}</Text>
      <Text style={styles.unit}>{unit}</Text>
      <Text style={styles.label}>{label}</Text>
      {onPress && (
        <Text style={styles.tapHint}>Tap for details</Text>
      )}
    </TouchableOpacity>
  );
}

function formatValue(val) {
  if (!val && val !== 0) return '-';
  const num = parseFloat(val);
  if (isNaN(num)) return '-';
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num % 1 === 0 ? num.toString() : num.toFixed(1);
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 2,
  },
  icon: { fontSize: 26, marginBottom: 4 },
  value: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  unit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  tapHint: {
    fontSize: 10,
    color: colors.primary,
    marginTop: 4,
  },
});