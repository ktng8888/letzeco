import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function ChallengeProgress({
  current,
  target,
  targetType,
  unit,
  label,
  showPercent = true,
  showValues = true,
  showTargetValue = true,
  showRemaining = true,
  showCompleteBadge = true,
}) {
  const percent = target > 0
    ? Math.min((current / target) * 100, 100)
    : 0;

  const isComplete = percent >= 100;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label || 'Progress'}</Text>
        {showPercent && (
          <Text style={[
            styles.percent,
            isComplete && styles.percentComplete
          ]}>
            {Math.round(percent)}%
          </Text>
        )}
      </View>

      <View style={styles.barBg}>
        <View style={[
          styles.barFill,
          { width: `${percent}%` },
          isComplete && styles.barFillComplete
        ]} />
      </View>

      {showValues && (
        <View style={styles.valueRow}>
          <Text style={styles.currentValue}>
            {formatValue(current, targetType, unit)}
          </Text>
          {showTargetValue && (
            <>
              <Text style={styles.separator}>/</Text>
              <Text style={styles.targetValue}>
                {formatValue(target, targetType, unit)}
              </Text>
            </>
          )}
          {showTargetValue && showRemaining && target > current && (
            <Text style={styles.remaining}>
              ({formatValue(target - current, targetType, unit)} left)
            </Text>
          )}
        </View>
      )}

      {showCompleteBadge && isComplete && (
        <View style={styles.completeBadge}>
          <Ionicons name="checkmark-circle-outline" size={13} color={colors.success} />
          <Text style={styles.completeText}>Goal Reached!</Text>
        </View>
      )}
    </View>
  );
}

// If admin provided a custom unit, use it.
// Otherwise fall back to the built-in label per target_type.
function formatValue(value, type, unit) {
  if (!value && value !== 0) return '0';
  const num = parseFloat(value);

  if (unit) {
    const normalizedUnit = String(unit).toLowerCase();
    const isWholeNumberUnit = type === 'count'
      || normalizedUnit === 'actions'
      || normalizedUnit === 'items';
    const rounded = isWholeNumberUnit
      ? Math.round(num)
      : Number.isInteger(num) ? Math.round(num) : num.toFixed(1);
    return `${rounded} ${unit}`;
  }

  // Fallback defaults
  switch (type) {
    case 'co2_kg': return `${num.toFixed(1)} kg CO₂`;
    case 'count':  return `${Math.round(num)} items`;
    case 'litre':  return `${num.toFixed(1)} L`;
    case 'kwh':    return `${num.toFixed(1)} kWh`;
    default:       return Math.round(num).toString();
  }
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: { fontSize: 13, color: colors.textSecondary },
  percent: { fontSize: 14, fontWeight: '700', color: colors.primary },
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
  currentValue: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  separator:    { fontSize: 13, color: colors.textSecondary },
  targetValue:  { fontSize: 13, color: colors.textSecondary },
  remaining:    { fontSize: 12, color: colors.primary, fontWeight: '500' },
  completeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  completeText: { fontSize: 13, fontWeight: '600', color: colors.success },
});
