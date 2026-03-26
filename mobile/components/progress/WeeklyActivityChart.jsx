import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function WeeklyActivityChart({ data }) {
  const allDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date().getDay();
  // Sunday = 0, convert to Mon=0 index
  const todayIndex = today === 0 ? 6 : today - 1;

  // Build map from API data
  const dataMap = {};
  data?.forEach(item => {
    dataMap[item.day] = parseInt(item.action_count);
  });

  const maxCount = Math.max(...Object.values(dataMap), 1);

  return (
    <View style={styles.container}>
      <View style={styles.barsRow}>
        {allDays.map((day, index) => {
          const count = dataMap[day] || 0;
          const heightPercent = (count / maxCount) * 100;
          const isToday = index === todayIndex;

          return (
            <View key={day} style={styles.barColumn}>
              {/* Count label */}
              {count > 0 && (
                <Text style={styles.countLabel}>{count}</Text>
              )}
              {/* Bar */}
              <View style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${Math.max(heightPercent, 4)}%`,
                      backgroundColor: isToday
                        ? colors.primary
                        : count > 0
                          ? colors.primaryLight
                          : colors.bgGrey,
                    }
                  ]}
                />
              </View>
              {/* Day label */}
              <Text style={[
                styles.dayLabel,
                isToday && styles.dayLabelToday
              ]}>
                {day}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {Object.values(dataMap).reduce((a, b) => a + b, 0)} actions this week
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
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
  dayLabel: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  dayLabelToday: {
    color: colors.primary,
    fontWeight: '700',
  },
  summaryRow: {
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});