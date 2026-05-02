import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Modal, Animated
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '../../store/authStore';
import colors from '../../constants/colors';

export default function ActionCompleteScreen() {
  const router = useRouter();
  const { result } = useLocalSearchParams();
  const { updateUser } = useAuthStore();

  const [data, setData] = useState(null);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showBadge, setShowBadge] = useState(false);

  // Animation
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (result) {
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

      // Show modals after short delay
      setTimeout(() => {
        if (parsed.level_up) {
          setShowLevelUp(true);
        } else if (parsed.badge_unlocked) {
          setShowBadge(true);
        }
      }, 800);
    }
  }, [result]);

  const handleLevelUpClose = () => {
    setShowLevelUp(false);
    if (data?.badge_unlocked) {
      setTimeout(() => setShowBadge(true), 300);
    }
  };

  if (!data) return null;

  const { user_action, xp, streak, streak_reward, new_badge } = data;
  
  const baseXp = user_action?.base_xp ?? 0;  
  const bonusXp = user_action?.bonus_xp_gained ?? 0;
  const totalXpGained = baseXp + bonusXp;
  
  const todayImpact = data?.today_impact || {};
  const todayActions = todayImpact.total_actions ?? data.total_actions_completed ?? 0;
  const todayXp = todayImpact.total_xp_earned ?? xp?.new_total_xp ?? 0;
  const todayCo2 = todayImpact.total_co2_saved ?? user_action?.co2_saved ?? 0;
  const todayLitre = todayImpact.total_litre_saved ?? user_action?.litre_saved ?? 0;
  const todayKwh = todayImpact.total_kwh_saved ?? user_action?.kwh_saved ?? 0;

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
              icon="✅"
            />
            <ImpactRow
              label="Total XP Earned"
              value={`${todayXp} XP`}
              icon="⭐"
            />
            {parseFloat(todayCo2) > 0 && (
              <ImpactRow
                label="CO₂ Saved"
                value={`${todayCo2} Kg`}
                icon="🌿"
              />
            )}
            {parseFloat(todayLitre) > 0 && (
              <ImpactRow
                label="Water Saved"
                value={`${todayLitre} L`}
                icon="💧"
              />
            )}
            {parseFloat(todayKwh) > 0 && (
              <ImpactRow
                label="Energy Saved"
                value={`${todayKwh} kWh`}
                icon="⚡"
              />
            )}
          </View>
        </View>

        {/* Streak Reward */}
        {streak_reward && (
          <View style={styles.streakCard}>
            <Text style={styles.streakCardIcon}>🔥</Text>
            <Text style={styles.streakCardTitle}>
              {streak_reward.day} Day Streak!
            </Text>
            <Text style={styles.streakCardText}>
              +{streak_reward.xp_reward} XP bonus earned!
            </Text>
          </View>
        )}

        {/* Motivational Message */}
        <Text style={styles.motivation}>
          Keep Going! Let's make the world better by logging one more action 🌍
        </Text>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.logAnotherBtn}
          onPress={() => router.replace('/(tabs)/log-action')}
        >
          <Text style={styles.logAnotherText}>Log Another Action</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/(tabs)/home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Level Up Modal */}
      <Modal
        visible={showLevelUp}
        transparent
        animationType="fade"
        onRequestClose={handleLevelUpClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Congratulations!</Text>
            <Text style={styles.modalSubtitle}>Level Up!</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>Lv.</Text>
              <Text style={styles.levelBadgeNumber}>{data.new_level}</Text>
            </View>
            <Text style={styles.modalText}>
              You reached Level {data.new_level}!{'\n'}
              Keep going, eco warrior! 🌿
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={handleLevelUpClose}
            >
              <Text style={styles.modalBtnText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Badge Unlocked Modal */}
      <Modal
        visible={showBadge}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBadge(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalEmoji}>🏅</Text>
            <Text style={styles.modalTitle}>Badge Unlocked!</Text>
            <View style={styles.badgeDisplay}>
              <Text style={styles.badgeName}>
                {new_badge?.badge_name}
              </Text>
              <Text style={styles.badgeAchievement}>
                {data.new_badge?.name}
              </Text>
            </View>
            {new_badge?.bonus_xp > 0 && (
              <View style={styles.bonusXpBadge}>
                <Text style={styles.bonusXpText}>
                  +{new_badge.bonus_xp} XP Bonus!
                </Text>
              </View>
            )}
            <Text style={styles.modalText}>
              You're making real change with every eco-friendly trip!
              Keep rolling towards a greener planet!
            </Text>
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setShowBadge(false)}
            >
              <Text style={styles.modalBtnText}>Keep Going!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function ImpactRow({ label, value, icon }) {
  return (
    <View style={styles.impactRow}>
      <View style={styles.impactRowLeft}>
        <Text style={styles.impactRowIcon}>{icon}</Text>
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
  impactRowIcon: { fontSize: 18 },
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
  streakCardIcon: { fontSize: 28, marginBottom: 4 },
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
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.bgWhite,
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
  },
  modalEmoji: { fontSize: 52, marginBottom: 8 },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryBg,
    borderRadius: 60,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 12,
    gap: 4,
  },
  levelBadgeText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  levelBadgeNumber: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
  },
  modalText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  modalBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  modalBtnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  badgeDisplay: {
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: 14,
    padding: 16,
    width: '100%',
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  badgeAchievement: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  bonusXpBadge: {
    backgroundColor: colors.xpBg,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 12,
  },
  bonusXpText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.xpColor,
  },
});
