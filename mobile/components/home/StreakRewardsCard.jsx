import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';

export default function StreakRewardsCard({
  streak,
  rewards,
  todayLoggedCount,
  onRewardPress,
}) {
  const hasUnclaimed = rewards.some(
    reward => reward.is_earned && reward.claim_status === 'unclaimed'
  );

  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>🔥 {streak} Day Streak</Text>
      <Text style={styles.streakMotiv}>{getMotivation(streak)}</Text>

      {hasUnclaimed && todayLoggedCount === 0 && (
        <View style={styles.banner}>
          <Ionicons name="information-circle-outline" size={14} color={colors.primary} />
          <Text style={styles.bannerText}>Log an action today to claim rewards!</Text>
        </View>
      )}
      {hasUnclaimed && todayLoggedCount > 0 && (
        <View style={[styles.banner, styles.readyBanner]}>
          <Ionicons name="gift-outline" size={14} color="#f59e0b" />
          <Text style={[styles.bannerText, styles.readyBannerText]}>
            Rewards ready! Tap to claim.
          </Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.rewardsContent}
      >
        {rewards.map(reward => (
          <StreakRewardDay
            key={reward.day}
            reward={reward}
            streak={streak}
            todayLoggedCount={todayLoggedCount}
            onPress={() => onRewardPress(reward)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function StreakRewardDay({ reward, streak, todayLoggedCount, onPress }) {
  const claimed = reward.claim_status === 'claimed';
  const earned = reward.is_earned;
  const canClaim = earned && reward.claim_status === 'unclaimed' && todayLoggedCount > 0;
  const canUnlockToday = !earned && reward.day === streak + 1 && todayLoggedCount === 0;

  return (
    <TouchableOpacity
      style={styles.dayCol}
      onPress={onPress}
      disabled={!(earned && !claimed) && !canUnlockToday}
    >
      <Text style={styles.dayLabel}>Day {reward.day}</Text>
      <View
        style={[
          styles.dayBox,
          claimed && styles.dayBoxClaimed,
          canClaim && styles.dayBoxCanClaim,
          canUnlockToday && styles.dayBoxToday,
        ]}
      >
        {claimed ? (
          <Ionicons name="checkmark" size={16} color="#fff" />
        ) : canClaim ? (
          <Ionicons name="gift" size={16} color="#f59e0b" />
        ) : canUnlockToday ? (
          <Ionicons name="lock-open-outline" size={16} color={colors.primary} />
        ) : reward.badge_image ? (
          <Image source={{ uri: getImageUrl(reward.badge_image) ?? undefined }} style={styles.dayImg} />
        ) : earned ? (
          <Text style={styles.fallbackReward}>⭐</Text>
        ) : null}
      </View>
      <Text style={[styles.dayXp, claimed && styles.claimedXp]}>
        {reward.xp_reward}XP
      </Text>
    </TouchableOpacity>
  );
}

function getMotivation(streak) {
  if (!streak) return 'Start today!';
  if (streak < 3) return 'Great start! Keep going!';
  if (streak < 7) return "You're on fire! 🔥";
  if (streak < 14) return 'Keep it up! Amazing!';
  return 'Eco legend! 🌍';
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  streakMotiv: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
    marginTop: 2,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryBg,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 10,
  },
  bannerText: { fontSize: 12, color: colors.primary, flex: 1 },
  readyBanner: { backgroundColor: '#fef3c7' },
  readyBannerText: { color: '#92400e' },
  rewardsContent: { gap: 8, paddingVertical: 4 },
  dayCol: {
    alignItems: 'center',
    width: 52,
  },
  dayLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginBottom: 5,
    fontWeight: '500',
  },
  dayBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  dayBoxClaimed: { backgroundColor: colors.primary, borderColor: colors.primary },
  dayBoxCanClaim: { backgroundColor: '#fef3c7', borderColor: '#f59e0b', borderWidth: 2 },
  dayBoxToday: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primaryLight,
    borderWidth: 2,
  },
  dayImg: { width: 24, height: 24, borderRadius: 12 },
  fallbackReward: { fontSize: 12 },
  dayXp: { fontSize: 9, color: colors.textSecondary, fontWeight: '600' },
  claimedXp: { color: colors.primary },
});
