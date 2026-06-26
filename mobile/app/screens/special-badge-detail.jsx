import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet
} from 'react-native';
import { useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getImageUrl } from '../../utils/imageUrl';
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';

export default function SpecialBadgeDetailScreen() {
  const router = useRouter();
  const { badge } = useLocalSearchParams();

  const current = useMemo(() => {
    try {
      return badge ? JSON.parse(badge) : null;
    } catch (err) {
      console.error('Parse special badge detail error:', err);
      return null;
    }
  }, [badge]);

  if (!current) return null;

  const badgeName = current.badge_name || 'Special Badge';
  const challengeName = current.challenge_name || 'Challenge Reward';
  const rewardType = getRewardTypeLabel(current);
  const obtainedTime = formatDateTime(current.claimed_date || current.obtain_date);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SoundTouchableOpacity onPress={() => router.back()} soundType="back">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </SoundTouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {badgeName}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroSection}>
          <View style={styles.badgeGlow}>
            {current.badge_image ? (
              <Image
                source={{ uri: getImageUrl(current.badge_image) }}
                style={styles.badgeImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.badgeFallback}>
                <Ionicons name="ribbon" size={76} color={colors.primary} />
              </View>
            )}
            <View style={styles.claimedDot}>
              <Ionicons name="checkmark" size={16} color={colors.textWhite} />
            </View>
          </View>

          <View style={styles.typePill}>
            <Ionicons name={getRewardTypeIcon(current)} size={15} color={colors.primary} />
            <Text style={styles.typePillText}>{rewardType}</Text>
          </View>

          <Text style={styles.badgeName}>{badgeName}</Text>
          <Text style={styles.challengeName}>{challengeName}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow
            icon="flag-outline"
            label="Source Challenge"
            value={challengeName}
          />
          <InfoRow
            icon={getRewardTypeIcon(current)}
            label="Reward"
            value={rewardType}
          />
          {current.xp_reward !== null && current.xp_reward !== undefined && (
            <InfoRow
              icon="flash"
              label="XP Reward"
              value={`+${current.xp_reward} XP`}
              valueColor={colors.xpColor}
            />
          )}
          {obtainedTime && (
            <InfoRow
              icon="calendar-outline"
              label="Claimed At"
              value={obtainedTime}
            />
          )}
        </View>

        <View style={styles.descCard}>
          <Text style={styles.descTitle}>Special Badge</Text>
          <Text style={styles.descText}>
            This badge was earned from a challenge reward. Keep it as a marker
            of your progress and participation.
          </Text>
        </View>

        <View style={{ height: 36 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value, valueColor = colors.textPrimary }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, { color: valueColor }]} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function getRewardTypeLabel(badge = {}) {
  if (badge.type === 'completion') return 'Completion Reward';
  if (badge.type === 'ranking') {
    const rank = Number(badge.top_value);
    if (rank === 1) return 'Top 1 Reward';
    if (rank > 1) return `Top ${rank} Reward`;
    return 'Ranking Reward';
  }
  return 'Challenge Reward';
}

function getRewardTypeIcon(badge = {}) {
  if (badge.type === 'ranking') return 'trophy';
  if (badge.type === 'completion') return 'checkmark-circle';
  return 'ribbon';
}

function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: {
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    backgroundColor: colors.primaryBg,
  },
  badgeGlow: {
    width: 166,
    height: 166,
    borderRadius: 83,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 6,
    marginBottom: 16,
  },
  badgeImage: {
    width: 142,
    height: 142,
    borderRadius: 71,
  },
  badgeFallback: {
    width: 142,
    height: 142,
    borderRadius: 71,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBg,
  },
  claimedDot: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 3,
    borderColor: colors.bgWhite,
  },
  typePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgWhite,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginBottom: 12,
  },
  typePillText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
  },
  badgeName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 30,
  },
  challengeName: {
    marginTop: 8,
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: colors.bgWhite,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBg,
  },
  infoTextWrap: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  descCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: colors.bgWhite,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  descTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
  },
});
