import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function ChallengeProgress({
  current,
  target,
  targetType,
  label,
}) {
  const percent = target > 0
    ? Math.min((current / target) * 100, 100)
    : 0;

  const isComplete = percent >= 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label || 'Progress'}</Text>
        <Text style={[
          styles.percent,
          isComplete && styles.percentComplete
        ]}>
          {Math.round(percent)}%
        </Text>
      </View>

      <View style={styles.barBg}>
        <View style={[
          styles.barFill,
          { width: `${percent}%` },
          isComplete && styles.barFillComplete
        ]} />
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.currentValue}>
          {formatValue(current, targetType)}
        </Text>
        <Text style={styles.separator}>/</Text>
        <Text style={styles.targetValue}>
          {formatValue(target, targetType)}
        </Text>
        {target > current && (
          <Text style={styles.remaining}>
            ({formatValue(target - current, targetType)} left)
          </Text>
        )}
      </View>

      {isComplete && (
        <View style={styles.completeBadge}>
          <Text style={styles.completeText}>🎉 Goal Reached!</Text>
        </View>
      )}
    </View>
  );
}

function formatValue(value, type) {
  if (!value && value !== 0) return '0';
  const num = parseFloat(value);
  switch (type) {
    case 'co2_kg': return `${num.toFixed(1)} kg CO₂`;
    case 'count': return `${Math.round(num)} items`;
    case 'litre': return `${num.toFixed(1)} L`;
    case 'kwh': return `${num.toFixed(1)} kWh`;
    default: return Math.round(num).toString();
  }
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  percent: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  percentComplete: { color: colors.success },
  barBg: {
    height: 10,
    backgroundColor: colors.bgGrey,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  barFillComplete: { backgroundColor: colors.success },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  currentValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  separator: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  targetValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  remaining: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  completeBadge: {
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  completeText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.success,
  },
});