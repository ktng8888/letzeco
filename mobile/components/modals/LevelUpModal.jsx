import { View, Text, StyleSheet } from 'react-native';

import colors from '../../constants/colors';
import RewardModal from './RewardModal';

export default function LevelUpModal({ visible, level, onClose }) {
  return (
    <RewardModal
      visible={visible}
      icon="sparkles"
      iconColor={colors.xpColor}
      title="Congratulations!"
      subtitle="Level Up!"
      primaryText="Got it!"
      onPrimary={onClose}
      onRequestClose={onClose}
    >
      <View style={styles.levelTrack}>
        <View style={styles.levelTrackFill} />
      </View>
      <View style={styles.levelBadge}>
        <Text style={styles.levelBadgeText}>Lv.</Text>
        <Text style={styles.levelBadgeNumber}>{level}</Text>
      </View>
      <Text style={styles.text}>
        You reached Level {level}!{'\n'}
        Keep going, eco warrior!
      </Text>
    </RewardModal>
  );
}

const styles = StyleSheet.create({
  levelTrack: {
    width: '74%',
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.bgGrey,
    overflow: 'hidden',
    marginTop: 4,
  },
  levelTrackFill: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryBg,
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 14,
    marginBottom: 4,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  levelBadgeText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
  },
  levelBadgeNumber: {
    fontSize: 46,
    fontWeight: '800',
    color: colors.primary,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
});
