import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function ChallengeCard({ challenge, onPress }) {
  const isTeam = challenge.type === 'team';
  const isParticipating = challenge.is_participating;
  const daysLeft = getDaysLeft(challenge.end_date);
  const isActive = challenge.status === 'active';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>

      {/* Type + Status Row */}
      <View style={styles.topRow}>
        <View style={[
          styles.typeBadge,
          { backgroundColor: isTeam ? '#eff6ff' : colors.primaryBg }
        ]}>
          <Text style={[
            styles.typeText,
            { color: isTeam ? '#3b82f6' : colors.primary }
          ]}>
            {isTeam ? '👥 Team' : '👤 Solo'}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: isActive ? colors.primaryBg : colors.bgGrey }
        ]}>
          <Text style={[
            styles.statusText,
            { color: isActive ? colors.primary : colors.textSecondary }
          ]}>
            {isActive ? 'Active' : challenge.status}
          </Text>
        </View>
      </View>

      {/* Name */}
      <Text style={styles.name}>{challenge.name}</Text>

      {/* Date */}
      <View style={styles.dateRow}>
        <Ionicons
          name="calendar-outline"
          size={13}
          color={colors.textSecondary}
        />
        <Text style={styles.dateText}>
          {formatDate(challenge.start_date)} -{' '}
          {formatDate(challenge.end_date)}
        </Text>
        {daysLeft > 0 && (
          <Text style={styles.daysLeft}>
            {daysLeft} days left
          </Text>
        )}
      </View>

      {/* Participants */}
      <View style={styles.metaRow}>
        <Ionicons
          name="people-outline"
          size={13}
          color={colors.textSecondary}
        />
        <Text style={styles.metaText}>
          {challenge.participants_count || 0} participants
        </Text>
      </View>

      {/* Rewards */}
      {challenge.rewards?.length > 0 && (
        <Text style={styles.reward} numberOfLines={1}>
          🎁 {challenge.rewards[0].xp_reward} XP
          {challenge.rewards[0].badge_name
            ? ` + "${challenge.rewards[0].badge_name}" Badge`
            : ''
          }
        </Text>
      )}

      {/* Progress if participating */}
      {isParticipating && (
        <View style={styles.participatingRow}>
          <View style={styles.participatingBadge}>
            <Text style={styles.participatingText}>
              ✓ Participating
            </Text>
          </View>
          <Text style={styles.progressValue}>
            {challenge.progress_value}
          </Text>
        </View>
      )}

    </TouchableOpacity>
  );
}

function getDaysLeft(endDate) {
  if (!endDate) return 0;
  const diff = Math.ceil(
    (new Date(endDate) - new Date()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, diff);
}

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  daysLeft: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  reward: {
    fontSize: 13,
    color: colors.xpColor,
    fontWeight: '500',
  },
  participatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 4,
  },
  participatingBadge: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  participatingText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
});