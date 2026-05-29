import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import { BadgeUnlockedModal, LevelUpModal } from '../../components/modals';
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';
import { playClickSound } from '../../services/audioService';

export default function ActionCompleteScreen() {
  const router = useRouter();
  const { result } = useLocalSearchParams();
  const { updateUser } = useAuthStore();

  const [data, setData] = useState(null);
  const [modalQueue, setModalQueue] = useState([]);
  const [activeModalIndex, setActiveModalIndex] = useState(-1);

  // Animation
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result) {
      playClickSound('actionComplete');
      const parsed = JSON.parse(result);
      setData(parsed);

      // Update user store with new XP/level
      if (parsed.xp) {
        updateUser({
          level_xp: parsed.xp.new_level_xp,
          total_xp: parsed.xp.new_total_xp,
          weekly_xp: parsed.xp.new_weekly_xp,
          level: parsed.new_level,
          streak: parsed.streak?.new_streak,
        });
      }

      // Animate in
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }).start();

      const queue = buildModalQueue(parsed);

      // Show reward modals after short delay, one at a time.
      setTimeout(() => {
        setModalQueue(queue);
        setActiveModalIndex(queue.length > 0 ? 0 : -1);
      }, 800);
    }
  }, [result]);

  const handleRewardModalClose = () => {
    setActiveModalIndex((current) => {
      const next = current + 1;
      return next < modalQueue.length ? next : -1;
    });
  };

  if (!data) return null;

  const { user_action, xp, streak, streak_reward } = data;
  
  const baseXp = user_action?.base_xp ?? 0;  
  const bonusXp = user_action?.bonus_xp_gained ?? 0;
  const totalXpGained = baseXp + bonusXp;
  
  const todayImpact = data?.today_impact || {};
  const todayActions = todayImpact.total_actions ?? data.total_actions_completed ?? 0;
  const todayXp = todayImpact.total_xp_earned ?? xp?.new_total_xp ?? 0;
  const todayCo2 = todayImpact.total_co2_saved ?? user_action?.co2_saved ?? 0;
  const todayLitre = todayImpact.total_litre_saved ?? user_action?.litre_saved ?? 0;
  const todayKwh = todayImpact.total_kwh_saved ?? user_action?.kwh_saved ?? 0;
  const activeModal = activeModalIndex >= 0 ? modalQueue[activeModalIndex] : null;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* Confetti Header */}
        <View style={styles.topSection}>
          <Text style={styles.congrats}>Congrats!</Text>
          <Text style={styles.actionLogged}>Action Logged</Text>

          {/* XP Gained */}
          <Animated.View style={[
            styles.xpBubble,
            { transform: [{ scale: scaleAnim }] }
          ]}>
            <Text style={styles.xpGained}>+{totalXpGained} XP</Text>
            {bonusXp > 0 && (
              <Text style={styles.xpBreakdown}>
                ({baseXp} XP + {bonusXp} bonus XP)
              </Text>
            )}
          </Animated.View>

          {/* Level progress */}
          <Text style={styles.levelProgress}>
            Lv. {data.new_level}  {xp?.new_level_xp} / {getLevelMax(data.new_level)} XP
          </Text>
        </View>

        {/* Today's Impact */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>Your Impact Today</Text>
          <View style={styles.impactGrid}>
            <ImpactRow
              label="Actions Logged"
              value={`${todayActions} Actions`}
              icon="checkmark-circle-outline"
              iconColor={colors.success}
            />
            <ImpactRow
              label="Total XP Earned"
              value={`${todayXp} XP`}
              icon="star-outline"
              iconColor={colors.xpColor}
            />
            {parseFloat(todayCo2) > 0 && (
              <ImpactRow
                label="CO₂ Saved"
                value={`${todayCo2} Kg`}
                icon="leaf-outline"
                iconColor={colors.primary}
              />
            )}
            {parseFloat(todayLitre) > 0 && (
              <ImpactRow
                label="Water Saved"
                value={`${todayLitre} L`}
                icon="water-outline"
                iconColor={colors.info}
              />
            )}
            {parseFloat(todayKwh) > 0 && (
              <ImpactRow
                label="Energy Saved"
                value={`${todayKwh} kWh`}
                icon="flash-outline"
                iconColor={colors.xpColor}
              />
            )}
          </View>
        </View>

        {/* Streak Reward */}
        {streak_reward && (
          <View style={styles.streakCard}>
            <Ionicons name="flame-outline" size={30} color={colors.streakColor} />
            <Text style={styles.streakCardTitle}>
              Day {streak_reward.day} Streak Reward Unlocked!
            </Text>
            <Text style={styles.streakCardText}>
              Claim +{streak_reward.xp_reward} XP from Home.
            </Text>
          </View>
        )}

        {/* Motivational Message */}
        <Text style={styles.motivation}>
          Keep Going! Let's make the world better by logging one more action.
        </Text>

        {/* Buttons */}
        <SoundTouchableOpacity
          style={styles.logAnotherBtn}
          onPress={() => router.replace('/(tabs)/log-action')}
        >
          <Text style={styles.logAnotherText}>Log Another Action</Text>
        </SoundTouchableOpacity>

        <SoundTouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </SoundTouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      <LevelUpModal
        visible={activeModal?.type === 'level-up'}
        level={activeModal?.level}
        onClose={handleRewardModalClose}
      />

      <BadgeUnlockedModal
        visible={activeModal?.type === 'badge'}
        badge={activeModal?.badge}
        onClose={handleRewardModalClose}
      />
    </View>
  );
}

function buildModalQueue(result) {
  const queue = [];

  if (result?.level_up) {
    queue.push({ type: 'level-up', level: result.new_level });
  }

  getUnlockedBadges(result).forEach((badge) => {
    queue.push({ type: 'badge', badge });
  });

  return queue;
}

function getUnlockedBadges(result) {
  const badges = Array.isArray(result?.new_badges)
    ? result.new_badges
    : result?.new_badge
      ? [result.new_badge]
      : [];

  const seen = new Set();
  return badges.filter((badge) => {
    if (!badge) return false;
    const key = badge.id || `${badge.badge_name}:${badge.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function ImpactRow({ label, value, icon, iconColor }) {
  return (
    <View style={styles.impactRow}>
      <View style={styles.impactRowLeft}>
        <Ionicons name={icon} size={18} color={iconColor} />
        <Text style={styles.impactRowLabel}>{label}</Text>
      </View>
      <Text style={styles.impactRowValue}>{value}</Text>
    </View>
  );
}

function getLevelMax(level) {
  const table = {
    1: 100, 2: 200, 3: 300, 4: 400, 5: 500,
    6: 600, 7: 700, 8: 800, 9: 900, 10: 1000,
  };
  return table[level] || 1000;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgWhite },
  content: { padding: 20 },
  topSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  congrats: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 4,
  },
  actionLogged: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  xpBubble: {
    backgroundColor: colors.xpBg,
    borderRadius: 50,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginBottom: 8,
  },
  xpGained: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.xpColor,
  },
  xpBreakdown: {
    fontSize: 13,
    color: colors.xpColor,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  levelProgress: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  impactCard: {
    backgroundColor: colors.bgGrey,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  impactTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  impactGrid: { gap: 10 },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  impactRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  impactRowLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  impactRowValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  streakCard: {
    backgroundColor: colors.streakBg,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  streakCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.streakColor,
  },
  streakCardText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  motivation: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  logAnotherBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  logAnotherText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  homeBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeBtnText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});
