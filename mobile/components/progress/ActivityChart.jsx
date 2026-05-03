import { ScrollView, View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function ActivityChart({
  data,
  period = 'this_week',
  summaryLabel = 'this week',
}) {
  const buckets = getBuckets(data, period);
  const activeLabel = getActiveLabel(period);
  const counts = buckets.map(item => item.count);
  const maxCount = Math.max(...counts, 1);
  const isDense = buckets.length > 12;
  const totalActions = counts.reduce((a, b) => a + b, 0);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal={isDense}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.barsRow,
          isDense && styles.barsRowDense
        ]}
      >
        {buckets.map((bucket, index) => {
          const count = bucket.count;
          const heightPercent = (count / maxCount) * 100;
          const isActive = bucket.label === activeLabel;
          const shouldShowLabel = !isDense || index % 3 === 0 || isActive;

          return (
            <View
              key={bucket.label}
              style={[styles.barColumn, isDense && styles.barColumnDense]}
            >
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
                      backgroundColor: isActive
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
                isActive && styles.dayLabelToday
              ]}>
                {shouldShowLabel ? bucket.label : ''}
              </Text>

              {/* Date — this_week only */}
              {bucket.date && (
                <Text style={[styles.dateLabel, isActive && styles.dayLabelToday]}>
                  {shouldShowLabel ? bucket.date : ''}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <Text style={styles.summaryText}>
          {totalActions} actions {summaryLabel}
        </Text>
      </View>
    </View>
  );
}

/*
function getBuckets(data, period) {
  const items = data || [];
  const mapped = items.map(item => ({
    label: item.label || item.day,
    count: parseInt(item.action_count, 10) || 0,
  }));

  if (mapped.length > 0) return mapped;

  if (period === 'today') {
    return Array.from({ length: 24 }, (_, hour) => ({
      label: `${hour.toString().padStart(2, '0')}:00`,
      count: 0,
    }));
  }

  if (period === 'this_month') {
    return [1, 2, 3, 4].map(week => ({
      label: `Week ${week}`,
      count: 0,
    }));
  }

  if (period === 'all_time') {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
        label: month,
        count: 0,
      }));
  }

  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
    label: day,
    count: 0,
  }));
}
  */
function getBuckets(data, period) {
  const items = data || [];

  const getWeekDate = (dayIndex) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + dayIndex);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  const getMonthWeekDate = (weekIndex) => {
    const now = new Date();
    const m = now.getMonth() + 1;
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const weeks = [
      { start: 1,  end: 7 },
      { start: 8,  end: 14 },
      { start: 15, end: 21 },
      { start: 22, end: daysInMonth },
    ];
    const w = weeks[weekIndex];
    return w ? `${w.start}/${m}-${w.end}/${m}` : null;
  };

  const mapped = items.map((item, i) => ({
    label: item.label || item.day,
    date: period === 'this_week'
      ? getWeekDate(i)
      : period === 'this_month'
        ? getMonthWeekDate(i)
        : null,
    count: parseInt(item.action_count, 10) || 0,
  }));

  if (mapped.length > 0) return mapped;

  if (period === 'today') {
    return Array.from({ length: 24 }, (_, hour) => ({
      label: `${hour.toString().padStart(2, '0')}:00`,
      date: null,
      count: 0,
    }));
  }

  if (period === 'this_month') {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const weeks = [
      { start: 1,  end: 7 },
      { start: 8,  end: 14 },
      { start: 15, end: 21 },
      { start: 22, end: daysInMonth },
    ];
    return weeks.map((w, i) => ({
      label: `Week ${i + 1}`,
      date: `${w.start}-${w.end}`,
      count: 0,
    }));
  }

  if (period === 'all_time') {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
        label: month,
        date: null,
        count: 0,
      }));
  }

  // this_week fallback (no data)
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => ({
    label: day,
    date: getWeekDate(i),
    count: 0,
  }));
}

function getActiveLabel(period) {
  const now = new Date();

  if (period === 'today') {
    return `${now.getHours().toString().padStart(2, '0')}:00`;
  }

  if (period === 'this_month') {
    return `Week ${Math.min(4, Math.ceil(now.getDate() / 7))}`;
  }

  if (period === 'all_time') {
    return now.toLocaleString('en-US', { month: 'short' });
  }

  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 4,
    flexGrow: 1,
  },
  barsRowDense: {
    minWidth: 700,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 4,
  },
  barColumnDense: {
    width: 28,
    flex: 0,
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
  dateLabel: {
    fontSize: 9,
    color: colors.textLight,
    marginTop: -2,
  },
  summaryRow: {
    alignItems: 'center',
  },
  summaryText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});
