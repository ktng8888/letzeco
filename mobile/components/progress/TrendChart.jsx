import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function TrendChart({ data, growthPercent }) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Not enough data yet</Text>
      </View>
    );
  }

  const maxCount = Math.max(...data.map(d => parseInt(d.action_count)), 1);
  const isGrowth = growthPercent >= 0;

  return (
    <View style={styles.container}>
      {/* Growth badge */}
      <View style={[
        styles.growthBadge,
        { backgroundColor: isGrowth ? colors.primaryBg : '#fef2f2' }
      ]}>
        <Ionicons
          name={isGrowth ? 'trending-up' : 'trending-down'}
          size={14}
          color={isGrowth ? colors.primary : colors.error}
        />
        <Text style={[
          styles.growthText,
          { color: isGrowth ? colors.primary : colors.error }
        ]}>
          {isGrowth ? '+' : ''}{growthPercent}% growth over 6 months
        </Text>
      </View>

      {/* Bars */}
      <View style={styles.barsRow}>
        {data.map((item, index) => {
          const heightPercent = (parseInt(item.action_count) / maxCount) * 100;
          const isLast = index === data.length - 1;

          return (
            <View key={index} style={styles.barColumn}>
              <Text style={styles.countLabel}>
                {item.action_count}
              </Text>
              <View style={styles.barContainer}>
                <View style={[
                  styles.bar,
                  {
                    height: `${Math.max(heightPercent, 4)}%`,
                    backgroundColor: isLast
                      ? colors.primary
                      : colors.primaryLight,
                  }
                ]} />
              </View>
              <Text style={styles.monthLabel}>{item.month}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  empty: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 6,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  countLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  barContainer: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
    minHeight: 4,
  },
  monthLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});