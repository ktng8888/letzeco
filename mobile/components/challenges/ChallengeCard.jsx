import {
  View,
  Text,
  StyleSheet,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';
import SoundTouchableOpacity from '../common/SoundTouchableOpacity';

export default function ChallengeCard({ challenge, onPress }) {
  const isTeam = challenge.type === 'team';
  const isParticipating = challenge.is_participating;
  const daysLeft = getDaysLeft(challenge.end_date);
  const isActive = challenge.status === 'active';
  const imageUrl = getImageUrl(challenge.image || challenge.challenge_image);
  const primaryReward = challenge.rewards?.find(r => r.type === 'ranking')
    || challenge.rewards?.[0];
  const targetLabel = challenge.target_value
    ? `${formatTargetValue(
      challenge.target_value,
      challenge.target_type,
      challenge.unit
    )} ${challenge.unit || ''}`.trim()
    : null;
  const progressValue = `${formatOneDecimal(challenge.progress_value || 0)}${
    challenge.unit ? ` ${challenge.unit}` : ''
  }`;

  return (
    <SoundTouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.86}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={[
            styles.imageFallback,
            { backgroundColor: isTeam ? '#dbeafe' : colors.primaryBg }
          ]}>
            <Ionicons
              name={isTeam ? 'people' : 'leaf'}
              size={34}
              color={isTeam ? '#2563eb' : colors.primary}
            />
          </View>
        )}

        <View/>

        <View style={[
          styles.typeBadge,
          { backgroundColor: isTeam ? '#eff6ff' : colors.primaryBg }
        ]}>
          <Ionicons
            name={isTeam ? 'people' : 'person'}
            size={13}
            color={isTeam ? '#3b82f6' : colors.primary}
          />
          <Text style={[
            styles.typeText,
            { color: isTeam ? '#3b82f6' : colors.primary }
          ]}>
            {isTeam ? 'Team' : 'Solo'}
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

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {challenge.name}
            </Text>
            {!!challenge.about && (
              <Text style={styles.about} numberOfLines={2}>
                {challenge.about}
              </Text>
            )}
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={colors.textSecondary}
          />
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText} numberOfLines={1}>
              {formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {challenge.participants_count || 0} joined
            </Text>
          </View>

          {!!targetLabel && (
            <View style={styles.infoItem}>
              <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.infoText} numberOfLines={1}>
                Goal {targetLabel}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.bottomRow}>
          {daysLeft > 0 ? (
            <View style={styles.daysPill}>
              <Ionicons name="time-outline" size={13} color={colors.primary} />
              <Text style={styles.daysLeft}>{daysLeft} days left</Text>
            </View>
          ) : (
            <View style={styles.daysPillMuted}>
              <Text style={styles.daysLeftMuted}>Ended</Text>
            </View>
          )}

          {!!primaryReward && (
            <View style={styles.rewardPill}>
              <Ionicons name="trophy-outline" size={13} color={colors.xpColor} />
              <Text style={styles.rewardText}>
                {primaryReward.xp_reward} XP
              </Text>
            </View>
          )}
        </View>

        {isParticipating && (
          <View style={styles.participatingRow}>
            <View style={styles.participatingBadge}>
              <Ionicons name="checkmark-circle" size={13} color={colors.primary} />
              <Text style={styles.participatingText}>
                Participating
              </Text>
            </View>
            <Text style={styles.progressValue}>
              {progressValue}
            </Text>
          </View>
        )}
      </View>
    </SoundTouchableOpacity>
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

function formatOneDecimal(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0.0';
  return num.toFixed(1);
}

function formatTargetValue(value, targetType, unit) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0';
  const normalizedUnit = String(unit || '').toLowerCase();
  const isWholeNumberTarget = targetType === 'count'
    || normalizedUnit === 'actions'
    || normalizedUnit === 'items';

  if (isWholeNumberTarget) return String(Math.round(num));
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  imageWrap: {
    height: 132,
    position: 'relative',
    backgroundColor: colors.bgGrey,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    right: 12,
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  body: {
    padding: 14,
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleBlock: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  about: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 3,
  },
  infoGrid: {
    gap: 6,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  daysPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  daysPillMuted: {
    backgroundColor: colors.bgGrey,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  daysLeft: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  daysLeftMuted: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  rewardPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fffbeb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  rewardText: {
    fontSize: 12,
    color: colors.xpColor,
    fontWeight: '700',
  },
  participatingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 2,
  },
  participatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  participatingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  progressValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
});
