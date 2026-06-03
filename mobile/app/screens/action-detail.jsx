import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Image,
  Linking
} from 'react-native';
import { useState, useEffect, useCallback} from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import actionService from '../../services/actionService';
import useActionStore from '../../store/actionStore';
import Badge from '../../components/common/Badge';
import LoadingScreen from '../../components/common/LoadingScreen';
import { getImageUrl } from '../../utils/imageUrl';
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';

export default function ActionDetailScreen() {
  const router = useRouter();
  const { actionId } = useLocalSearchParams();
  const { currentAction, setCurrentAction } = useActionStore();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [action, setAction] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadAction();
    }, [actionId])
  );

  const loadAction = async () => {
    try {
      const data = await actionService.getById(actionId);
      setAction(data.data);
      setIsFavourite(data.data.is_favourite);
    } catch (err) {
      console.error('Load action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavouriteToggle = async () => {
    try {
      if (isFavourite) {
        await actionService.removeFavourite(actionId);
      } else {
        await actionService.addFavourite(actionId);
      }
      setIsFavourite(!isFavourite);
    } catch (err) {
      console.error('Toggle favourite error:', err);
    }
  };

  const handleLogAction = async () => {
    if (currentAction && currentAction.action_id !== parseInt(actionId)) {
      Alert.alert(
        'Action In Progress',
        'You already have an action in progress. Complete or cancel it first.',
        [
          { text: 'View Current', onPress: () => router.push({
            pathname: '/screens/action-in-progress',
            params: { userActionId: currentAction.id }
          })},
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }
    setIsStarting(true);
    try {
      const data = await actionService.startAction(actionId);
      setCurrentAction({
        id: data.data.user_action_id,
        action_id: parseInt(actionId),
        action_name: data.data.action_name,
        time_limit: data.data.time_limit,
        xp_reward: data.data.xp_reward,
        start_time: data.data.start_time,
      });
      router.replace({
        pathname: '/screens/action-in-progress',
        params: { userActionId: data.data.user_action_id }
      });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to start action.');
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!action) return null;

  const timeLimitText = getTimeLimitText(action.time_limit);
  const isCurrentlyLogging = currentAction?.action_id === parseInt(actionId);
  const imageUrl = getImageUrl(action.image);
  const hasImpact = action.co2_saved || action.litre_saved || action.kwh_saved;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <SoundTouchableOpacity style={styles.backBtn} onPress={() => router.back()} soundType="back">
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </SoundTouchableOpacity>

        {timeLimitText && (
          <View style={styles.timeLimitBadge}>
            <Ionicons name="time-outline" size={13} color={colors.primary} />
            <Text style={styles.timeLimitText}>Max Time: {timeLimitText}</Text>
          </View>
        )}

        <SoundTouchableOpacity onPress={handleFavouriteToggle} style={styles.heartBtn}>
          <Ionicons
            name={isFavourite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavourite ? colors.error : colors.textLight}
          />
        </SoundTouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Action Hero */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadgeWrap}>
            <Badge
              text={action.category_name}
              bgColor={action.tag_bg_colour_code}
              textColor={action.tag_text_colour_code}
            />
          </View>
          <View style={styles.heroRow}>
            {imageUrl && (
              <Image source={{ uri: imageUrl }} style={styles.actionIcon} />
            )}
            <Text style={styles.actionName}>{action.name}</Text>
          </View>
          <Text style={styles.logCount}>
            I logged {action.user_log_count} times •{' '}
            Global logged {action.global_log_count} times
          </Text>
        </View>

        {/* Description + Why This Matters Card */}
        <View style={styles.card}>
          <View style={styles.cardSection}>
            <View style={styles.cardSectionHeader}>
              <View style={styles.descDot} />
              <Text style={styles.cardSectionTitle}>Description</Text>
            </View>
            <Text style={styles.cardBodyText}>{action.description}</Text>
          </View>

          {action.importance && (
            <View style={[styles.cardSection, {
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingTop: 14
            }]}>
              <View style={styles.cardSectionHeader}>
                <Ionicons name="heart" size={14} color={colors.primary} />
                <Text style={styles.cardSectionTitle}>Why This Matters</Text>
              </View>
              <Text style={styles.cardBodyText}>{action.importance}</Text>
            </View>
          )}
        </View>

        {/* Reward */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles" size={16} color={colors.primary} />
            <Text style={styles.sectionTitle}>Reward</Text>
          </View>
          <View style={styles.rewardRow}>
            <View style={styles.rewardBox}>
              <Text style={styles.rewardValue}>{action.xp_reward} XP</Text>
            </View>
            {action.proof && (
              <View style={[styles.rewardBox, { backgroundColor: '#fff7ed' }]}>
                <Text style={[styles.rewardValue, { color: colors.streakColor }]}>
                  +{action.proof.bonus_xp} XP
                </Text>
                <Text style={styles.rewardLabel}>Proof Bonus</Text>
              </View>
            )}
          </View>
        </View>

        {/* Environmental Impact */}
        {hasImpact && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="leaf-outline" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Environmental Impact</Text>
            </View>

            <View style={styles.impactRow}>
              <ImpactCard
                icon="co2"
                value={action.co2_saved}
                unit="Kg CO₂"
                label="Saved"
                active={!!action.co2_saved}
              />
              <ImpactCard
                icon="water"
                value={action.litre_saved}
                unit="L Water"
                label="Saved"
                active={!!action.litre_saved}
              />
              <ImpactCard
                icon="flash"
                value={action.kwh_saved}
                unit="kWh Energy"
                label="Saved"
                active={!!action.kwh_saved}
              />
            </View>

            {(action.calc_info || action.source) && (
              <SoundTouchableOpacity
                style={styles.calcBtn}
                onPress={() => setShowCalcModal(true)}
              >
                <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
                <Text style={styles.calcBtnText}>How is this calculated?</Text>
              </SoundTouchableOpacity>
            )}
          </View>
        )}

        {/* Proof Section */}
        {action.proof && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera" size={16} color={colors.primary} />
              <Text style={styles.sectionTitle}>Provide Proof (Optional)</Text>
            </View>
            <View style={styles.proofCard}>
              <Text style={styles.proofRequirement}>
                {action.proof.requirement}
              </Text>
              <Text style={styles.proofBonus}>
                (bonus +{action.proof.bonus_xp} XP)
              </Text>

              {/* Disabled camera placeholder */}
              <View style={styles.proofPhotoDisabled}>
                <Ionicons name="camera-outline" size={32} color={colors.textLight} />
                <Text style={styles.proofPhotoDisabledText}>Take Photo</Text>
              </View>

              <Text style={styles.proofNote}>
                You can upload proof after starting the action
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: Math.max(insets.bottom + 104, 116) }} />
      </ScrollView>

      {/* Log Action Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom + 12, 24) }]}>
        <SoundTouchableOpacity
          style={[
            styles.logBtn,
            isCurrentlyLogging && styles.logBtnActive,
            isStarting && styles.logBtnDisabled
          ]}
          onPress={isCurrentlyLogging
            ? () => router.push({
                pathname: '/screens/action-in-progress',
                params: { userActionId: currentAction.id }
              })
            : handleLogAction
          }
          disabled={isStarting}
        >
          {isStarting ? (
            <ActivityIndicator color={colors.textWhite} />
          ) : (
            <Text style={styles.logBtnText}>
              {isCurrentlyLogging ? 'View Action In Progress' : 'Log Action'}
            </Text>
          )}
        </SoundTouchableOpacity>
      </View>

      {/* How is this calculated Modal */}
      <Modal
        visible={showCalcModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalcModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Ionicons name="information-circle-outline" size={40} color={colors.primary} />
            <Text style={styles.modalTitle}>How is this calculated?</Text>

            {action.calc_info && (
              <Text style={styles.modalBody}>{action.calc_info}</Text>
            )}

            {action.source && (
              <View style={styles.modalSourceBox}>
                <Text style={styles.modalSourceLabel}>Source:</Text>
                <Text
                  style={styles.modalSourceLink}
                  onPress={() => Linking.openURL(action.source)}
                >
                  {action.source}
                </Text>
              </View>
            )}

            <SoundTouchableOpacity
              style={styles.modalBtn}
              onPress={() => setShowCalcModal(false)}
            >
              <Text style={styles.modalBtnText}>Got it!</Text>
            </SoundTouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function ImpactCard({ icon, value, unit, label, active }) {
  const getIcon = () => {
    if (icon === 'co2') return <Ionicons name="cloud-outline" size={28} color={active ? colors.primary : colors.textLight} />;
    if (icon === 'water') return <Ionicons name="water-outline" size={28} color={active ? '#3b82f6' : colors.textLight} />;
    if (icon === 'flash') return <Ionicons name="flash-outline" size={28} color={active ? '#f59e0b' : colors.textLight} />;
  };

  const getActiveColor = () => {
    if (icon === 'co2') return colors.primary;
    if (icon === 'water') return '#3b82f6';
    if (icon === 'flash') return '#f59e0b';
    return colors.primary;
  };

  const activeColor = getActiveColor();

  return (
    <View style={[
      styles.impactCard,
      active && { borderColor: activeColor, borderWidth: 1.5 }
    ]}>
      <View style={[
        styles.impactIconWrap,
        active && {
          backgroundColor: `${activeColor}18`,
          borderColor: activeColor,
        }
      ]}>
        {getIcon()}
      </View>
      <Text style={[styles.impactValue, active && { color: activeColor }]}>
        {active ? value : '--'}
      </Text>
      <Text style={styles.impactUnit}>{unit}</Text>
      <Text style={styles.impactLabel}>{label}</Text>
    </View>
  );
}

function getTimeLimitText(timeLimit) {
  if (!timeLimit) return null;
  if (typeof timeLimit === 'object') {
    const h = timeLimit.hours || 0;
    const m = timeLimit.minutes || 0;
    if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
    if (m > 0) return `${m} min`;
  }
  if (typeof timeLimit === 'string') {
    const [h, m] = timeLimit.split(':').map(Number);
    if (h > 0) return `${h} hr${h > 1 ? 's' : ''}`;
    if (m > 0) return `${m} min`;
  }
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartBtn: { padding: 4 },
  timeLimitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  timeLimitText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  // Hero
  heroSection: {
    backgroundColor: colors.bgWhite,
    padding: 16,
    paddingBottom: 20,
    gap: 8,
    alignItems: 'center',
  },
  heroBadgeWrap: {
    alignSelf: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: colors.bgGrey,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  actionName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.primary,
    lineHeight: 28,
    textAlign: 'center',
  },
  logCount: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Card
  card: {
    backgroundColor: colors.bgWhite,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSection: { gap: 8 },
  cardSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  descDot: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: colors.textLight,
  },
  cardSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
  },
  cardBodyText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },

  // Reward
  rewardRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  rewardBox: {
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  rewardValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  rewardLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Impact
  impactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  impactCard: {
    flex: 1,
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  impactIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  impactUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  impactLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Calc button
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    alignSelf: 'center',
  },
  calcBtnText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
  },

  // Proof
  proofCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  proofRequirement: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  proofBonus: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  proofPhotoDisabled: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
    opacity: 0.5,
  },
  proofPhotoDisabledText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  proofNote: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.bgWhite,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  logBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtnActive: { backgroundColor: colors.streakColor },
  logBtnDisabled: { backgroundColor: colors.primaryLight },
  logBtnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.bgWhite,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'center',
  },
  modalBody: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalSourceBox: {
    alignItems: 'center',
    gap: 4,
  },
  modalSourceLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSourceLink: {
    fontSize: 13,
    color: '#3b82f6',
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 12,
    marginTop: 4,
  },
  modalBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textWhite,
  },
});
