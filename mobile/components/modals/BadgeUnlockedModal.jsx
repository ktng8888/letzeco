import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';
import RewardModal from './RewardModal';

export default function BadgeUnlockedModal({ visible, badge, onClose }) {
  return (
    <RewardModal
      visible={visible}
      icon="ribbon"
      iconColor={colors.primary}
      title="Badge Unlocked!"
      primaryText="Keep Going!"
      onPrimary={onClose}
      onRequestClose={onClose}
    >
      <View style={styles.badgeArtFrame}>
        <View style={styles.badgeHalo} />
        {badge?.badge_image ? (
          <Image
            source={{ uri: getImageUrl(badge.badge_image) }}
            style={styles.badgeImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.badgeFallback}>
            <Ionicons name="ribbon" size={42} color={colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.badgeDisplay}>
        <Text style={styles.badgeName}>{badge?.badge_name}</Text>
        <Text style={styles.badgeAchievement}>{badge?.name}</Text>
      </View>

      {badge?.bonus_xp > 0 && (
        <View style={styles.bonusXpBadge}>
          <Text style={styles.bonusXpText}>+{badge.bonus_xp} XP Bonus!</Text>
        </View>
      )}

      <Text style={styles.text}>
        You're making real change with every eco-friendly trip!
        Keep rolling towards a greener planet!
      </Text>
    </RewardModal>
  );
}

const styles = StyleSheet.create({
  badgeArtFrame: {
    width: 126,
    height: 126,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  badgeHalo: {
    position: 'absolute',
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  badgeImage: {
    width: 112,
    height: 112,
  },
  badgeFallback: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  badgeDisplay: {
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: 18,
    padding: 16,
    width: '100%',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  badgeName: {
    fontSize: 21,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  badgeAchievement: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  bonusXpBadge: {
    backgroundColor: colors.xpBg,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  bonusXpText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.xpColor,
  },
  text: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 4,
  },
});
