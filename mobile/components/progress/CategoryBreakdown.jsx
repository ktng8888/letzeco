import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function CategoryBreakdown({ data }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No data yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.row}>
          {/* Label + Percentage */}
          <View style={styles.labelRow}>
            <Text style={styles.categoryName}>
              {item.category_name}
            </Text>
            <Text style={styles.percentage}>
              {item.percentage}%
            </Text>
          </View>
          {/* Progress Bar */}
          <View style={styles.barBg}>
            <View style={[
              styles.barFill,
              {
                width: `${item.percentage}%`,
                backgroundColor: getBarColor(index)
              }
            ]} />
          </View>
          <Text style={styles.count}>
            {item.action_count} actions
          </Text>
        </View>
      ))}
    </View>
  );
}

function getBarColor(index) {
  const palette = [
    '#22c55e', '#3b82f6', '#f59e0b',
    '#8b5cf6', '#ef4444', '#06b6d4',
  ];
  return palette[index % palette.length];
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  row: { gap: 4 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  barBg: {
    height: 8,
    backgroundColor: colors.bgGrey,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  count: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});