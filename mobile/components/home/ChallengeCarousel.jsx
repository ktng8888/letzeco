import { useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';
import SoundTouchableOpacity from '../common/SoundTouchableOpacity';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = Math.min(SCREEN_W - 78, 360);
const CARD_GAP = 2;
const SNAP_INTERVAL = CARD_W + CARD_GAP;
const SIDE_PADDING = (SCREEN_W - CARD_W) / 2;
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

const CHALLENGE_GRADIENTS = [
  '#22c55e',
  '#3b82f6',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
];

export default function ChallengeCarousel({
  challenges,
  activeSlide,
  onSlideChange,
  onJoinPress,
  onChallengePress,
}) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselItems = useMemo(
    () => (
      challenges.length > 0
        ? [...challenges, { id: 'join', isJoin: true }]
        : [{ id: 'join', isJoin: true }]
    ),
    [challenges]
  );

  const handleMomentumEnd = event => {
    const idx = Math.round(event.nativeEvent.contentOffset.x / SNAP_INTERVAL);
    onSlideChange(Math.max(0, Math.min(idx, carouselItems.length - 1)));
  };

  return (
    <View style={styles.carouselWrap}>
      <AnimatedFlatList
        data={carouselItems}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={handleMomentumEnd}
        getItemLayout={(_, index) => ({
          length: SNAP_INTERVAL,
          offset: SNAP_INTERVAL * index,
          index,
        })}
        keyExtractor={item => String(item.id)}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * SNAP_INTERVAL,
            index * SNAP_INTERVAL,
            (index + 1) * SNAP_INTERVAL,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.91, 1, 0.91],
            extrapolate: 'clamp',
          });
          const translateY = scrollX.interpolate({
            inputRange,
            outputRange: [10, 0, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.82, 1, 0.82],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.carouselItem,
                index === activeSlide && styles.carouselItemActive,
                { opacity, transform: [{ translateY }, { scale }] },
              ]}
            >
              {item.isJoin ? (
                <JoinChallengeCard onPress={onJoinPress} />
              ) : (
                <ChallengeCard
                  challenge={item}
                  index={index}
                  onPress={() => onChallengePress(item)}
                />
              )}
            </Animated.View>
          );
        }}
      />
      <View style={styles.dots}>
        {carouselItems.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeSlide && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

function JoinChallengeCard({ onPress }) {
  return (
    <SoundTouchableOpacity style={[styles.challengeCard, styles.joinCard]} onPress={onPress}>
      <View style={styles.joinIconBadge}>
        <Ionicons name="flag-outline" size={30} color={colors.primary} />
      </View>
      <View style={styles.joinCopy}>
        <Text style={styles.joinTitle}>Join a Challenge!</Text>
        <Text style={styles.joinSub}>
          Pick a goal, track progress, and earn rewards with the community.
        </Text>
      </View>
      <View style={styles.joinPerksRow}>
        <View style={styles.joinPerk}>
          <Ionicons name="people-outline" size={13} color={colors.primary} />
          <Text style={styles.joinPerkText}>Team</Text>
        </View>
        <View style={styles.joinPerk}>
          <Ionicons name="person-outline" size={13} color={colors.primary} />
          <Text style={styles.joinPerkText}>Solo</Text>
        </View>
        <View style={styles.joinPerk}>
          <Ionicons name="gift-outline" size={13} color={colors.primary} />
          <Text style={styles.joinPerkText}>Rewards</Text>
        </View>
      </View>
      <View style={styles.joinBtn}>
        <Text style={styles.joinBtnText}>Browse Challenges</Text>
        <Ionicons name="chevron-forward" size={16} color="#fff" />
      </View>
    </SoundTouchableOpacity>
  );
}

function ChallengeCard({ challenge, index, onPress }) {
  const bgColor = CHALLENGE_GRADIENTS[index % CHALLENGE_GRADIENTS.length];
  const isTeam = challenge.type === 'team';
  const challengeImageUrl = getImageUrl(challenge.challenge_image || challenge.image);
  const daysLeft = Math.max(
    0,
    Math.ceil((new Date(challenge.end_date).getTime() - Date.now()) / 86400000)
  );
  const progress = Math.min(
    ((challenge.progress_value || 0) / (challenge.target_value || 1)) * 100,
    100
  );
  const progressValue = formatOneDecimal(challenge.progress_value || 0);
  const targetValue = challenge.target_value
    ? formatOneDecimal(challenge.target_value)
    : '?';

  return (
    <SoundTouchableOpacity style={styles.challengeCard} onPress={onPress} activeOpacity={0.88}>
      <View
        style={[
          styles.challengeImageBg,
          !challengeImageUrl && { backgroundColor: bgColor },
        ]}
      >
        {challengeImageUrl ? (
          <Image
            source={{ uri: challengeImageUrl }}
            style={styles.challengeImage}
            resizeMode="cover"
          />
        ) : (
          <Ionicons name="leaf" size={38} color="#fff" />
        )}
        <View style={styles.cTypeBadge}>
          <Ionicons
            name={isTeam ? 'people-outline' : 'radio-button-on-outline'}
            size={12}
            color="#fff"
          />
          <Text style={styles.cTypeText}>{isTeam ? 'Team' : 'Solo'}</Text>
        </View>
      </View>
      <View style={styles.challengeBody}>
        <View style={styles.challengeTitleRow}>
          <View style={styles.challengeTitleBlock}>
            <Text
              style={styles.cName}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.82}
            >
              {challenge.challenge_name}
            </Text>
            <Text style={styles.cDays}>
              {daysLeft > 0 ? `${daysLeft} days left` : 'Ends today'}
            </Text>
          </View>
          <View style={styles.cViewBtn}>
            <Text style={styles.cViewBtnText}>View</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </View>
        <View style={styles.cProgressBg}>
          <View style={[styles.cProgressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.cProgressLabel}>
          {progressValue} / {targetValue}
        </Text>
      </View>
    </SoundTouchableOpacity>
  );
}

function formatOneDecimal(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '0.0';
  return num.toFixed(1);
}

const styles = StyleSheet.create({
  carouselWrap: { paddingTop: 10, paddingBottom: 4 },
  carouselContent: {
    paddingHorizontal: SIDE_PADDING - CARD_GAP / 2,
  },
  carouselItem: {
    width: CARD_W,
    marginHorizontal: CARD_GAP / 2,
    zIndex: 1,
    elevation: 1,
  },
  carouselItemActive: {
    zIndex: 3,
    elevation: 3,
  },
  challengeCard: {
    width: '100%',
    borderRadius: 22,
    minHeight: 230,
    overflow: 'hidden',
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinCard: {
    backgroundColor: '#f7fff9',
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 13,
    paddingHorizontal: 22,
    paddingVertical: 20,
  },
  joinIconBadge: {
    width: 62,
    height: 62,
    borderRadius: 18,
    backgroundColor: colors.bgWhite,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  joinCopy: {
    alignItems: 'center',
    gap: 5,
  },
  joinTitle: { fontSize: 18, fontWeight: '800', color: colors.primary },
  joinSub: {
    fontSize: 12,
    lineHeight: 17,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 250,
  },
  joinPerksRow: {
    flexDirection: 'row',
    gap: 7,
  },
  joinPerk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: '#d9fbe5',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  joinPerkText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  joinBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  challengeImageBg: {
    height: 145,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  challengeImage: {
    width: '100%',
    height: '100%',
  },
  cTypeBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(17,24,39,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cTypeText: { fontSize: 11, fontWeight: '600', color: '#fff' },
  challengeBody: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 7,
    position: 'relative',
  },
  challengeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  challengeTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
  cName: { fontSize: 18, fontWeight: '800', color: colors.textPrimary },
  cDays: { fontSize: 12, color: colors.textSecondary },
  cProgressBg: {
    height: 7,
    backgroundColor: colors.bgGrey,
    borderRadius: 999,
    overflow: 'hidden',
  },
  cProgressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 999 },
  cProgressLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  cViewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexShrink: 0,
  },
  cViewBtnText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: colors.primary, width: 16 },
});
