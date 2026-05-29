import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Badge from '../common/Badge';
import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';
import SoundTouchableOpacity from '../common/SoundTouchableOpacity';

export default function EligibleActionsList({
  actions,
  scrollable = false,
  maxHeight = 360,
}) {
  const router = useRouter();

  if (!actions || actions.length === 0) {
    return (
      <Text style={styles.empty}>No eligible actions defined</Text>
    );
  }

  const list = (
    <View style={styles.container}>
      {actions.map((action) => {
        const imageUrl = getImageUrl(
          action.action_image || action.category_image
        );
        const xpReward = action.xp_reward || 10;

        return (
          <SoundTouchableOpacity
            key={action.id}
            style={styles.actionRow}
            activeOpacity={0.75}
            onPress={() => router.push({
              pathname: '/screens/action-detail',
              params: { actionId: action.action_id }
            })}
          >
            <View style={styles.imageWrap}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.actionImage}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="leaf-outline" size={24} color={colors.primary} />
              )}
            </View>

            <View style={styles.actionLeft}>
              <Badge
                text={action.category_name}
                bgColor={action.tag_bg_colour_code}
                textColor={action.tag_text_colour_code}
                size="sm"
              />
              <Text style={styles.actionName} numberOfLines={2}>
                {action.action_name}
              </Text>
            </View>
            <View style={styles.actionRight}>
              <Text style={styles.actionXp}>{xpReward} XP+</Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textLight}
              />
            </View>
          </SoundTouchableOpacity>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <View style={[styles.scrollArea, { maxHeight }]}>
        <ScrollView
          nestedScrollEnabled
          showsVerticalScrollIndicator={actions.length > 3}
          contentContainerStyle={styles.scrollContent}
        >
          {list}
        </ScrollView>
      </View>
    );
  }

  return (
    list
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  scrollArea: {
    backgroundColor: colors.bgWhite,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  scrollContent: {
    padding: 8,
  },
  empty: {
    fontSize: 13,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8faf9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eef2ef',
    padding: 14,
    minHeight: 84,
  },
  imageWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#e8f4ec',
    overflow: 'hidden',
  },
  actionImage: {
    width: 50,
    height: 50,
  },
  actionLeft: { gap: 4, flex: 1 },
  actionName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginLeft: 10,
  },
  actionXp: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.xpColor,
  },
});
