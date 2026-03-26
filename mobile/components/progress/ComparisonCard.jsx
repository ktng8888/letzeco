import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function ComparisonCard({ data }) {
  if (!data) return null;

  const { week, month } = data;
  const weekChange = week?.percent_change || 0;
  const monthChange = month?.percent_change || 0;

  return (
    <View style={styles.container}>
      <ComparisonRow
        label="This Week vs Last Week"
        current={week?.this_week || 0}
        previous={week?.last_week || 0}
        change={weekChange}
        unit="actions"
      />
      <View style={styles.divider} />
      <ComparisonRow
        label="This Month vs Last Month"
        current={month?.this_month || 0}
        previous={month?.last_month || 0}
        change={monthChange}
        unit="actions"
      />
    </View>
  );
}

function ComparisonRow({ label, current, previous, change, unit }) {
  const isUp = change >= 0;
  const isZero = change === 0;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
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
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
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