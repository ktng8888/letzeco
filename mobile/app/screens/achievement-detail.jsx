import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import profileService from '../../services/profileService';
import LoadingScreen from '../../components/common/LoadingScreen';
import colors from '../../constants/colors';

export default function AchievementDetailScreen() {
  const router = useRouter();
  const { achievementId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);
  const [current, setCurrent] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const data = await profileService.getAchievements();
      const all = data.data;
      setAchievements(all);

      // Find current achievement
      const found = all.find(a => a.id === parseInt(achievementId));
      setCurrent(found);
    } catch (err) {
      console.error('Load achievement error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!current) return null;

  // Get progression (bronze → silver → gold for same category)
  const relatedAchievements = achievements.filter(
    a => a.action_category_id === current.action_category_id
      && a.type === current.type
  ).sort((a, b) => a.target_value - b.target_value);

  const progressPercent = current.target_value > 0
    ? Math.min(
        (current.current_progress / current.target_value) * 100,
        100
      )
    : 100;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{current.badge_name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        {/* Badge Display */}
        <View style={styles.badgeSection}>
          <View style={[
            styles.badgeCircle,
            current.is_unlocked
              ? styles.badgeCircleUnlocked
              : styles.badgeCircleLocked
          ]}>
            <Text style={styles.badgeEmoji}>
              {current.is_unlocked ? '🏅' : '🔒'}
            </Text>
          </View>
          <Text style={styles.badgeName}>{current.badge_name}</Text>
          <Text style={styles.achievementName}>{current.name}</Text>

          {current.is_unlocked ? (
            <View style={styles.unlockedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={colors.success}
              />
              <Text style={styles.unlockedText}>Obtained</Text>
            </View>
          ) : (
            <Text style={styles.notObtained}>Not Obtained</Text>
          )}
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>
              {getProgressLabel(current)}
            </Text>
            <Text style={styles.progressValue}>
              {current.current_progress} / {current.target_value}
            </Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFill,
              { width: `${progressPercent}%` }
            ]} />
          </View>
        </View>

        {/* Reward */}
        <View style={styles.rewardCard}>
          <Text style={styles.rewardLabel}>Reward</Text>
          <Text style={styles.rewardValue}>
            +{current.bonus_xp} XP Bonus
          </Text>
        </View>

        {/* Progression levels (Bronze → Silver → Gold) */}
        {relatedAchievements.length > 1 && (
          <View style={styles.progressionSection}>
            <Text style={styles.progressionTitle}>Achievement Progression</Text>
            {relatedAchievements.map((ach, index) => (
              <ProgressionRow
                key={ach.id}
                achievement={ach}
                isActive={ach.id === current.id}
                onPress={() => {
                  if (ach.id !== current.id) {  // don't navigate if already on this one
                    router.replace({
                      pathname: '/screens/achievement-detail',
                      params: { achievementId: ach.id }
                    });
                  }
                }}
              />
            ))}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

function ProgressionRow({ achievement, isActive, onPress }) {
  const tierEmoji = getTierEmoji(achievement.badge_name);

  return (
    <TouchableOpacity
      style={[
        styles.progressionRow,
        isActive && styles.progressionRowActive
      ]}
      onPress={onPress} 
      activeOpacity={isActive ? 1 : 0.7}
    >
      <Text style={styles.tierEmoji}>{tierEmoji}</Text>
      <View style={styles.progressionInfo}>
        <Text style={styles.progressionName}>
          {achievement.badge_name}
        </Text>
        <Text style={styles.progressionTarget}>
          {getProgressLabel(achievement)}: {achievement.target_value}
        </Text>
      </View>
      <View style={styles.progressionRight}>
        <Text style={styles.progressionXp}>
          +{achievement.bonus_xp} XP
        </Text>
        {achievement.is_unlocked && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={colors.success}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

function getProgressLabel(achievement) {
  if (achievement.type === 'log') {
    return `Log ${achievement.category_name} actions`;
  }
  if (achievement.type === 'reach_level') {
    return 'Reach level';
  }
  return 'Progress';
}

function getTierEmoji(name) {
  if (!name) return '🏅';
  if (name.includes('Gold')) return '🥇';
  if (name.includes('Silver')) return '🥈';
  if (name.includes('Bronze')) return '🥉';
  return '🏅';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgWhite },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  content: { padding: 20 },
  badgeSection: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  badgeCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeCircleUnlocked: {
    backgroundColor: colors.primaryBg,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  badgeCircleLocked: {
    backgroundColor: colors.bgGrey,
    borderWidth: 3,
    borderColor: colors.border,
  },
  badgeEmoji: { fontSize: 48 },
  badgeName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  achievementName: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  unlockedText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: '600',
  },
  notObtained: {
    fontSize: 13,
    color: colors.textSecondary,
    backgroundColor: colors.bgGrey,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  progressSection: {
    marginBottom: 20,
    gap: 8,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: colors.bgGrey,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  rewardCard: {
    backgroundColor: colors.xpBg,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rewardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.xpColor,
  },
  progressionSection: { gap: 8 },
  progressionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  progressionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgGrey,
    borderRadius: 12,
    padding: 14,
    gap: 12,
  },
  progressionRowActive: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  tierEmoji: { fontSize: 24 },
  progressionInfo: { flex: 1 },
  progressionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  progressionTarget: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressionRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  progressionXp: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.xpColor,
  },
});