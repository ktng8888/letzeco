import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function ComparisonCard({ data, period = 'this_week' }) {
  if (!data) return null;

  const rows = [];

  if (period === 'today' || period === 'all_time') {
    rows.push({
      label: 'Today vs Yesterday',
      current: data.today?.today || 0,
      previous: data.today?.yesterday || 0,
      change: data.today?.percent_change || 0,
      unit: 'actions',
    });
  }

  if (period === 'this_week' || period === 'all_time') {
    rows.push({
      label: 'This Week vs Last Week',
      current: data.week?.this_week || 0,
      previous: data.week?.last_week || 0,
      change: data.week?.percent_change || 0,
      unit: 'actions',
    });
  }

  if (period === 'this_month' || period === 'all_time') {
    rows.push({
      label: 'This Month vs Last Month',
      current: data.month?.this_month || 0,
      previous: data.month?.last_month || 0,
      change: data.month?.percent_change || 0,
      unit: 'actions',
    });
  }

  if (rows.length === 0) return null;

  return (
    <View style={styles.container}>
      {rows.map((row, idx) => (
        <View key={row.label}>
          <ComparisonRow
            label={row.label}
            current={row.current}
            previous={row.previous}
            change={row.change}
            unit={row.unit}
          />
          {idx < rows.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  );
}

function ComparisonRow({ label, current, previous, change, unit }) {
  const isUp = change >= 0;
  const isZero = change === 0;
  const [leftLabel = label, rightLabel = ''] = label.split(' vs ');

  return (
    <View style={styles.row}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, styles.labelLeft]} numberOfLines={1}>
          {leftLabel}
        </Text>
        <Text style={styles.labelVs}>vs</Text>
        <Text style={[styles.label, styles.labelRight]} numberOfLines={1}>
          {rightLabel}
        </Text>
      </View>
      <View style={styles.valuesRow}>
        <View style={styles.valueBox}>
          <Text style={styles.valueMain}>{current}</Text>
          <Text style={styles.valueUnit}>{unit}</Text>
        </View>

        <View style={styles.arrowContainer}>
          {!isZero && (
            <Ionicons
              name={isUp ? 'arrow-up' : 'arrow-down'}
              size={14}
              color={isUp ? colors.success : colors.error}
            />
          )}
          <Text style={[
            styles.changeText,
            { color: isZero
              ? colors.textSecondary
              : isUp ? colors.success : colors.error
            }
          ]}>
            {isZero ? '=' : `${Math.abs(change)}%`}
          </Text>
        </View>

        <View style={styles.valueBox}>
          <Text style={[styles.valueMain, styles.valuePrev]}>
            {previous}
          </Text>
          <Text style={styles.valueUnit}>{unit}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  row: { gap: 8 },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  labelLeft: {
    flex: 1,
    textAlign: 'left',
  },
  labelVs: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  labelRight: {
    flex: 1,
    textAlign: 'right',
  },
  valuesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueBox: { alignItems: 'center', minWidth: 60 },
  valueMain: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  valuePrev: {
    color: colors.textSecondary,
  },
  valueUnit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  changeText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
