import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import colors from '../../constants/colors';
import { getImageUrl } from '../../utils/imageUrl';
import SoundTouchableOpacity from '../common/SoundTouchableOpacity';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - 48;

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
  const carouselItems = useMemo(
    () => (
      challenges.length > 0
        ? [...challenges, { id: 'join', isJoin: true }]
        : [{ id: 'join', isJoin: true }]
    ),
    [challenges]
  );

  return (
    <View style={styles.carouselWrap}>
      <FlatList
        data={carouselItems}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_W + 12}
        decelerationRate="fast"
        contentContainerStyle={styles.carouselContent}
        onScroll={event => {
          const idx = Math.round(event.nativeEvent.contentOffset.x / (CARD_W + 12));
          onSlideChange(idx);
        }}
        keyExtractor={item => String(item.id)}
        renderItem={({ item, index }) => (
          item.isJoin ? (
            <JoinChallengeCard onPress={onJoinPress} />
          ) : (
            <ChallengeCard
              challenge={item}
              index={index}
              onPress={() => onChallengePress(item)}
            />
          )
        )}
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
      <Ionicons name="flag-outline" size={40} color={colors.primary} />
      <Text style={styles.joinTitle}>Join a Challenge!</Text>
      <Text style={styles.joinSub}>
        Start your eco-journey by joining a community challenge
      </Text>
      <View style={styles.joinBtn}>
        <Text style={styles.joinBtnText}>Browse Challenges</Text>
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
            <Text style={styles.cName} numberOfLines={1}>
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
  carouselWrap: { paddingTop: 14, paddingBottom: 4 },
  carouselContent: { paddingHorizontal: 24, gap: 12 },
  challengeCard: {
    width: CARD_W,
    borderRadius: 22,
    minHeight: 230,
    overflow: 'hidden',
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  joinCard: {
    backgroundColor: colors.primaryBg,
    borderWidth: 2,
    borderColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  joinTitle: { fontSize: 17, fontWeight: '700', color: colors.primary },
  joinSub: { fontSize: 12, color: colors.textSecondary, textAlign: 'center' },
  joinBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 4,
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
    gap: 12,
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexShrink: 0,
  },
  cViewBtnText: { fontSize: 13, fontWeight: '800', color: colors.primary },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#d1d5db' },
  dotActive: { backgroundColor: colors.primary, width: 16 },
});
