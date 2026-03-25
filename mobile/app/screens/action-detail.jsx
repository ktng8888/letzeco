import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import actionService from '../../services/actionService';
import useActionStore from '../../store/actionStore';
import Badge from '../../components/common/Badge';
import LoadingScreen from '../../components/common/LoadingScreen';
import colors from '../../constants/colors';

export default function ActionDetailScreen() {
  const router = useRouter();
  const { actionId } = useLocalSearchParams();
  const { currentAction, setCurrentAction } = useActionStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [action, setAction] = useState(null);
  const [isFavourite, setIsFavourite] = useState(false);

  useEffect(() => {
    loadAction();
  }, []);

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
    // Check if already logging something else
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

      // Save to store
      setCurrentAction({
        id: data.data.user_action_id,
        action_id: parseInt(actionId),
        action_name: data.data.action_name,
        time_limit: data.data.time_limit,
        xp_reward: data.data.xp_reward,
        start_time: data.data.start_time,
      });

      // Navigate to in-progress screen
      router.replace({
        pathname: '/screens/action-in-progress',
        params: { userActionId: data.data.user_action_id }
      });

    } catch (err) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to start action.'
      );
    } finally {
      setIsStarting(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!action) return null;

  const timeLimitText = getTimeLimitText(action.time_limit);
  const isCurrentlyLogging = currentAction?.action_id === parseInt(actionId);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        {timeLimitText && (
          <View style={styles.timeLimitBadge}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.timeLimitText}>Max Time: {timeLimitText}</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleFavouriteToggle}>
          <Ionicons
            name={isFavourite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavourite ? colors.error : colors.textLight}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Category Badge */}
        <Badge
          text={action.category_name}
          bgColor={action.tag_bg_colour_code}
          textColor={action.tag_text_colour_code}
          size="lg"
        />

        {/* Action Name */}
        <Text style={styles.actionName}>{action.name}</Text>

        {/* Log count */}
        <Text style={styles.logCount}>
          I logged {action.user_log_count} times •{' '}
          Global logged {action.global_log_count} times
        </Text>

        {/* Description */}
        <Section title="Description">
          <Text style={styles.bodyText}>{action.description}</Text>
        </Section>

        {/* Why This Matters */}
        {action.importance && (
          <Section title="Why This Matters">
            <Text style={styles.bodyText}>{action.importance}</Text>
          </Section>
        )}

        {/* Rewards */}
        <Section title="Rewards">
          <View style={styles.rewardRow}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardValue}>{action.xp_reward} XP</Text>
              <Text style={styles.rewardLabel}>Base Reward</Text>
            </View>
            {action.proof && (
              <View style={styles.rewardItem}>
                <Text style={styles.rewardValue}>
                  +{action.proof.bonus_xp} XP
                </Text>
                <Text style={styles.rewardLabel}>Proof Bonus</Text>
              </View>
            )}
          </View>
        </Section>

        {/* Environmental Impact */}
        <Section title="Environmental Impact">
          <View style={styles.impactRow}>
            {action.co2_saved && (
              <ImpactItem
                value={action.co2_saved}
                unit="Kg CO₂"
                label="Saved"
                icon="🌿"
              />
            )}
            {action.litre_saved && (
              <ImpactItem
                value={action.litre_saved}
                unit="L Water"
                label="Saved"
                icon="💧"
              />
            )}
            {action.kwh_saved && (
              <ImpactItem
                value={action.kwh_saved}
                unit="kWh"
                label="Saved"
                icon="⚡"
              />
            )}
          </View>
        </Section>

        {/* Proof Section */}
        {action.proof && (
          <Section title="Provide Proof (Optional)">
            <View style={styles.proofCard}>
              <Text style={styles.proofRequirement}>
                📷 {action.proof.requirement}
              </Text>
              <Text style={styles.proofBonus}>
                (bonus +{action.proof.bonus_xp} XP)
              </Text>
              <Text style={styles.proofNote}>
                You can upload proof after starting the action
              </Text>
            </View>
          </Section>
        )}

        {/* Source */}
        {action.source && (
          <Text style={styles.source}>Source: {action.source}</Text>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Log Action Button */}
      <View style={styles.footer}>
        <TouchableOpacity
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
        </TouchableOpacity>
      </View>

    </View>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function ImpactItem({ value, unit, label, icon }) {
  return (
    <View style={styles.impactItem}>
      <Text style={styles.impactIcon}>{icon}</Text>
      <Text style={styles.impactValue}>{value}</Text>
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
  timeLimitBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgGrey,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeLimitText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  content: {
    padding: 20,
  },
  actionName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 4,
  },
  logCount: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  rewardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  rewardItem: {
    backgroundColor: colors.xpBg,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  rewardValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.xpColor,
  },
  rewardLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  impactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  impactItem: {
    backgroundColor: colors.primaryBg,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    flex: 1,
  },
  impactIcon: { fontSize: 20, marginBottom: 4 },
  impactValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  impactUnit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  impactLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  proofCard: {
    backgroundColor: colors.bgGrey,
    borderRadius: 10,
    padding: 14,
    gap: 4,
  },
  proofRequirement: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  proofBonus: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  proofNote: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  source: {
    fontSize: 11,
    color: colors.textLight,
    marginBottom: 20,
  },
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
  logBtnActive: {
    backgroundColor: colors.streakColor,
  },
  logBtnDisabled: {
    backgroundColor: colors.primaryLight,
  },
  logBtnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
});