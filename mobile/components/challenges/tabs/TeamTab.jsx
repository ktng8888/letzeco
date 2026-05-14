import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Alert
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../../constants/api';
import useAuthStore from '../../../store/authStore';
import colors from '../../../constants/colors';

export default function TeamTab({ team }) {
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
          isYou={member.user_id === user?.id}
          currentUserId={user?.id}
        />
      ))}

      {team.code && (
        <CodeCard code={team.code} />
      )}
    </View>
  );
}

function MemberRow({ member, isYou, currentUserId }) {
  const router = useRouter();

  const handlePress = () => {
    if (isYou) {
      router.push('/(tabs)/profile');
    } else {
      router.push(`/screens/user-profile?userId=${member.user_id}`);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.memberRow, isYou && styles.memberRowYou]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      {member.profile_image ? (
        <Image
          source={{ uri: `${BASE_URL}/${member.profile_image}` }}
          style={styles.memberAvatar}
        />
      ) : (
        <View style={[styles.memberAvatar, styles.memberAvatarFallback]}>
          <Text style={styles.memberAvatarInitial}>
            {member.username?.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Name */}
      <Text style={styles.memberName}>
        {member.username}
        {isYou && (
          <Text style={styles.youTag}> (You)</Text>
        )}
      </Text>

      {/* Chevron */}
      <Ionicons
        name="chevron-forward"
        size={16}
        color={colors.textLight}
      />
    </TouchableOpacity>
  );
}

// Copyable team code card
function CodeCard({ code }) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(code);
    Alert.alert('Copied!', `Team code "${code}" copied to clipboard.`);
  };

  return (
    <View style={styles.codeCard}>
      <Text style={styles.codeLabel}>Share Code with Friends</Text>

      <TouchableOpacity
        style={styles.codeRow}
        onPress={handleCopy}
        activeOpacity={0.7}
      >
        <Text style={styles.code}>{code}</Text>
        <View style={styles.copyBtn}>
          <Ionicons name="copy-outline" size={18} color={colors.primary} />
          <Text style={styles.copyText}>Copy</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.codeHint}>
        Tap the code to copy · Members can use this to join your team
      </Text>
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

  // ── Member row ──
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    padding: 12,
    gap: 12,
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
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  memberAvatarFallback: {
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  memberAvatarInitial: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary,
  },
  memberName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  youTag: {
    fontSize: 13,
    fontWeight: '400',
    color: colors.primary,
  },

  // ── Code card ──
  codeCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  code: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 5,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgWhite,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  copyText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  codeHint: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});