import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function MonthlyGoals({ goals }) {
  if (!goals) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No goals set for this month</Text>
      </View>
    );
  }

  const items = [
    {
      label: 'Log actions this month',
      current: goals.actions_logged || 0,
      target: goals.actions_target || 0,
    },
    {
      label: 'Earn XP',
      current: goals.xp_earned || 0,
      target: goals.xp_target || 0,
    },
    {
      label: 'Maintain streak',
      current: goals.streak_current || 0,
      target: goals.streak_target || 0,
    },
  ];

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const percent = item.target > 0
          ? Math.min((item.current / item.target) * 100, 100)
          : 0;

        return (
          <View key={index} style={styles.goalRow}>
            <View style={styles.labelRow}>
              <Text style={styles.goalLabel}>{item.label}</Text>
              <Text style={styles.goalPercent}>
                {Math.round(percent)}%
              </Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[
                styles.progressFill,
                { width: `${percent}%` }
              ]} />
            </View>
            <Text style={styles.goalValue}>
              {item.current} / {item.target}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },
  empty: { padding: 16, alignItems: 'center' },
  emptyText: { fontSize: 14, color: colors.textSecondary },
  goalRow: { gap: 4 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalLabel: {
    fontSize: 13,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  goalPercent: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBg: {
    height: 8,
    backgroundColor: colors.bgGrey,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  goalValue: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});