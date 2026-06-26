import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import SoundTouchableOpacity from '../../common/SoundTouchableOpacity';
import { getImageUrl } from '../../../utils/imageUrl';
import { formatProgress } from '../../../utils/challengeHelpers';
import colors from '../../../constants/colors';

export default function ParticipantInfoModal({
  selected,
  challenge,
  sendingUserId,
  onClose,
  onFriendAction,
}) {
  if (!selected) return null;

  const selectedType = selected.type;

  return (
    <Modal
      visible={!!selected}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selectedType === 'team' ? 'Team Info' : 'Participant'}
            </Text>
            <SoundTouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </SoundTouchableOpacity>
          </View>

          {selectedType === 'solo' && selected.data && (
            <UserSummary
              user={selected.data}
              progress={formatProgress(
                selected.data.progress_value,
                challenge?.target_type,
                challenge?.unit
              )}
              onFriendAction={onFriendAction}
              isSending={sendingUserId === selected.data.user_id}
            />
          )}

          {selectedType === 'team' && selected.data && (
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.teamModalSummary}>
                <View style={styles.teamModalCopy}>
                  <Text style={styles.teamModalName}>
                    {selected.data.team_name}
                  </Text>
                  <Text style={styles.modalMeta}>
                    {formatProgress(
                      selected.data.team_progress,
                      challenge?.target_type,
                      challenge?.unit
                    )} · {(selected.data.members || []).length} members
                  </Text>
                </View>
              </View>

              <Text style={styles.memberTitle}>Members</Text>
              {(selected.data.members || []).map(member => (
                <UserSummary
                  key={member.user_id}
                  user={member}
                  compact
                  progress={formatProgress(
                    member.contribution || 0,
                    challenge?.target_type,
                    challenge?.unit
                  )}
                  onFriendAction={onFriendAction}
                  isSending={sendingUserId === member.user_id}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

function UserSummary({ user, progress, compact, onFriendAction, isSending }) {
  const username = user.username || user.friend_username;
  const profileImage = user.profile_image || user.friend_profile_image;
  const status = user.friendship_status || 'none';

  return (
    <View style={[styles.userSummary, compact && styles.userSummaryCompact]}>
      <View style={styles.modalAvatar}>
        {profileImage ? (
          <Image
            source={{ uri: getImageUrl(profileImage) }}
            style={styles.modalAvatarImg}
          />
        ) : (
          <Text style={styles.modalAvatarText}>
            {username?.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.userSummaryInfo}>
        <Text style={styles.modalUserName}>{username}</Text>
        <Text style={styles.modalMeta}>{progress}</Text>
      </View>

      <FriendButton
        status={status}
        disabled={isSending || status === 'self'}
        onPress={() => onFriendAction(user)}
      />
    </View>
  );
}

function FriendButton({ status, disabled, onPress }) {
  if (status === 'self') return null;

  if (status === 'friends') {
    return (
      <View style={styles.friendStatusPill}>
        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
        <Text style={styles.friendStatusText}>Friend</Text>
      </View>
    );
  }

  const label = status === 'request_sent'
    ? 'Sent'
    : status === 'request_received'
    ? 'Accept'
    : 'Add';

  return (
    <SoundTouchableOpacity
      style={[
        styles.friendActionBtn,
        status === 'request_sent' && styles.friendActionBtnMuted,
      ]}
      onPress={onPress}
      disabled={disabled || status === 'request_sent'}
    >
      <Text style={[
        styles.friendActionText,
        status === 'request_sent' && styles.friendActionTextMuted,
      ]}>
        {disabled && status !== 'request_sent' ? '...' : label}
      </Text>
    </SoundTouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '78%',
    backgroundColor: colors.bgWhite,
    borderRadius: 18,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgGrey,
  },
  userSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f8faf9',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userSummaryCompact: {
    marginBottom: 8,
  },
  modalAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  modalAvatarImg: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  modalAvatarText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
  },
  userSummaryInfo: {
    flex: 1,
    minWidth: 0,
  },
  modalUserName: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  modalMeta: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },
  teamModalSummary: {
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: 14,
  },
  teamModalCopy: {
    minWidth: 0,
  },
  teamModalName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  memberTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  friendStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primaryBg,
  },
  friendStatusText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  friendActionBtn: {
    minWidth: 62,
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primary,
  },
  friendActionBtnMuted: {
    backgroundColor: colors.bgGrey,
  },
  friendActionText: {
    color: colors.textWhite,
    fontSize: 12,
    fontWeight: '800',
  },
  friendActionTextMuted: {
    color: colors.textSecondary,
  },
});
