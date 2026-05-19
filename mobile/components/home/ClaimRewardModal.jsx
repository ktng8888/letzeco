import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import colors from '../../constants/colors';

export default function ClaimRewardModal({
  visible,
  reward,
  isClaiming,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modal}>
          <Text style={styles.modalIcon}>🎁</Text>
          <Text style={styles.modalTitle}>Claim Reward!</Text>
          <Text style={styles.modalSub}>Day {reward?.day} Streak</Text>
          <Text style={styles.modalXp}>+{reward?.xp_reward} XP</Text>
          {reward?.badge_name && (
            <Text style={styles.modalBadge}>🏅 {reward.badge_name}</Text>
          )}
          <TouchableOpacity
            style={styles.modalBtn}
            onPress={onConfirm}
            disabled={isClaiming}
          >
            <Text style={styles.modalBtnText}>
              {isClaiming ? 'Claiming...' : 'Claim Now!'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel}>
            <Text style={styles.modalCancel}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    width: '100%',
    gap: 8,
  },
  modalIcon: { fontSize: 52 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  modalSub: { fontSize: 14, color: colors.textSecondary },
  modalXp: { fontSize: 26, fontWeight: '700', color: colors.xpColor },
  modalBadge: { fontSize: 14, color: colors.textSecondary },
  modalBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  modalBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  modalCancel: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },
});
