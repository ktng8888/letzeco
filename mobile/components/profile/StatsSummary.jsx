import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function StatsSummary({ user, totalBadges }) {
  const stats = [
    {
      icon: 'star',
      label: 'Weekly XP',
      value: `${user?.weekly_xp || 0} WXP`,
      sub: `Best: ${user?.best_weekly_xp || user?.weekly_xp || 0} WXP`,
    },
    {
      icon: 'diamond',
      label: 'Total XP',
      value: `${user?.total_xp || 0} XP`,
    },
    {
      icon: 'trophy',
      label: 'Global Ranking',
      value: user?.global_rank ? `Rank ${user.global_rank}` : '-',
      sub: user?.best_rank ? `Best: Rank ${user.best_rank}` : null,
    },
    {
      icon: 'flame',
      label: 'Streak',
      value: `${user?.streak || 0} Day`,
      sub: `Best: ${user?.best_streak || user?.streak || 0} Day`,
    },
    {
      icon: 'ribbon',
      label: 'Badges Unlocked',
      value: `${totalBadges || 0} Badges`,
    },
    {
      icon: 'calendar',
      label: 'Joined Since',
      value: user?.created_at
        ? formatJoinDate(user.created_at)
        : '-',
    },
  ];

  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={[
          styles.row,
          index < stats.length - 1 && styles.rowBorder
        ]}>
          <View style={styles.iconContainer}>
            <Ionicons
              name={stat.icon}
              size={18}
              color={colors.primary}
            />
          </View>
          <View style={styles.info}>
            <Text style={styles.label}>{stat.label}</Text>
            {stat.sub && (
              <Text style={styles.sub}>{stat.sub}</Text>
            )}
          </View>
          <Text style={styles.value}>{stat.value}</Text>
        </View>
      ))}
    </View>
  );
}

function formatJoinDate(dateString) {
  const d = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  sub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});