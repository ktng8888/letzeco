import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

export default function UserCard({ user, xpToNextLevel }) {
  const xpPercent = user?.level_xp
    ? Math.min((user.level_xp / xpToNextLevel) * 100, 100)
    : 0;

  return (
    <View style={styles.card}>
      {/* XP Row */}
      <View style={styles.xpRow}>
        <XpBadge value={user?.weekly_xp || 0} label="Weekly XP" />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.levelText}>Lv. {user?.level}</Text>
        </View>
        <XpBadge value={user?.total_xp || 0} label="Total XP" />
      </View>

      {/* XP Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View
            style={[styles.progressFill, { width: `${xpPercent}%` }]}
          />
        </View>
        <Text style={styles.progressText}>
          {user?.level_xp} / {xpToNextLevel} XP
        </Text>
      </View>

      {/* Streak */}
      <View style={styles.streakRow}>
        <Text style={styles.streakIcon}>🔥</Text>
        <Text style={styles.streakText}>
          {user?.streak || 0} Day Streak
        </Text>
        <Text style={styles.streakMotivation}>
          {getMotivation(user?.streak)}
        </Text>
      </View>

      {/* Weekly Bar */}
      <WeeklyBar />
    </View>
  );
}

function XpBadge({ value, label }) {
  return (
    <View style={styles.xpBadge}>
      <Text style={styles.xpValue}>{value}</Text>
      <Text style={styles.xpLabel}>{label}</Text>
    </View>
  );
}

function WeeklyBar() {
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = new Date().getDay();

  return (
    <View style={styles.weeklyBar}>
      {days.map((day, index) => (
        <View key={day} style={styles.dayItem}>
          <Text style={[
            styles.dayLabel,
            index === today && styles.dayLabelActive
          ]}>
            {day}
          </Text>
          <View style={[
            styles.dayDot,
            index < today && styles.dayDotPast,
            index === today && styles.dayDotToday,
          ]} />
        </View>
      ))}
    </View>
  );
}

function getMotivation(streak) {
  if (!streak || streak === 0) return 'Start your streak today!';
  if (streak < 3) return 'Great start! Keep going!';
  if (streak < 7) return "You're on a roll! 🔥";
  if (streak < 14) return "Keep going! You're amazing";
  if (streak < 30) return 'Unstoppable eco warrior! 💪';
  return 'Legendary! 🌍';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgWhite,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  xpBadge: { alignItems: 'center' },
  xpValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.xpColor,
  },
  xpLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  userInfo: { alignItems: 'center' },
  username: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  levelText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressContainer: { marginBottom: 12 },
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
  progressText: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  streakIcon: { fontSize: 18 },
  streakText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.streakColor,
  },
  streakMotivation: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  weeklyBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dayItem: { alignItems: 'center', gap: 4 },
  dayLabel: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '500',
  },
  dayLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  dayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgGrey,
  },
  dayDotPast: { backgroundColor: colors.primaryLight },
  dayDotToday: { backgroundColor: colors.primary },
});