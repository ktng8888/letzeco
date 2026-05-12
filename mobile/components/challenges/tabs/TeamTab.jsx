import { View, Text, StyleSheet } from 'react-native';
import { formatProgress } from '../../../utils/challengeHelpers';
import useAuthStore from '../../../store/authStore';
import colors from '../../../constants/colors';

export default function TeamTab({ team, targetType, unit }) {
  const { user } = useAuthStore();
  if (!team) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>
        Team Members ({team.member_count}/5)
      </Text>

      {team.members?.map((member) => (
        <MemberRow
          key={member.user_id}
          member={member}
          targetType={targetType}
          unit={unit}
          isYou={member.user_id === user?.id}
        />
      ))}

      {team.code && (
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>Share Code with Friends</Text>
          <Text style={styles.code}>{team.code}</Text>
          <Text style={styles.codeHint}>
            Members can use this code to join your team
          </Text>
        </View>
      )}
    </View>
  );
}

function MemberRow({ member, targetType, unit, isYou }) {
  return (
    <View style={[styles.memberRow, isYou && styles.memberRowYou]}>
      <View style={styles.memberAvatar}>
        <Text style={styles.memberAvatarText}>
          {member.username?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>
          {member.username}
          {isYou && (
            <Text style={styles.youTag}> (You)</Text>
          )}
        </Text>
        <Text style={styles.memberMeta}>Lv. {member.level}</Text>
      </View>
      {member.contribution != null && (
        <Text style={styles.memberContrib}>
          {formatProgress(member.contribution, targetType, unit)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 8,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  memberRowYou: {
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  memberInfo: { flex: 1 },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  youTag: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.primary,
  },
  memberMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  memberContrib: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  codeCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  codeLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
  },
  codeHint: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});