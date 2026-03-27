import {
  View, Text, TouchableOpacity, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../../constants/colors';

export default function TeamCard({ team, onJoin, showJoinBtn }) {
  const memberCount = parseInt(team.member_count) || 0;
  const isFull = memberCount >= 5;
  const progress = parseFloat(team.total_progress) || 0;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamLed}>
            Led by {team.leader_username}
          </Text>
        </View>
        {showJoinBtn && (
          <TouchableOpacity
            style={[
              styles.joinBtn,
              isFull && styles.joinBtnDisabled
            ]}
            onPress={onJoin}
            disabled={isFull}
          >
            <Text style={[
              styles.joinBtnText,
              isFull && styles.joinBtnTextDisabled
            ]}>
              {isFull ? 'Full' : 'Join Team'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Ionicons
            name="people-outline"
            size={13}
            color={colors.textSecondary}
          />
          <Text style={styles.metaText}>
            {memberCount}/5 members
          </Text>
        </View>
        {progress > 0 && (
          <View style={styles.metaItem}>
            <Text style={styles.progressText}>
              {progress.toFixed(1)} progress
            </Text>
          </View>
        )}
      </View>

      {/* Member dots */}
      <View style={styles.memberDots}>
        {Array.from({ length: 5 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i < memberCount && styles.dotFilled
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgWhite,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  teamInfo: { flex: 1 },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  teamLed: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  joinBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  joinBtnDisabled: {
    backgroundColor: colors.bgGrey,
  },
  joinBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textWhite,
  },
  joinBtnTextDisabled: {
    color: colors.textSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  progressText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  memberDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.bgGrey,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dotFilled: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
});