import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  RefreshControl
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import challengeService from '../../services/challengeService';
import LoadingScreen from '../../components/common/LoadingScreen';
import { RewardClaimedModal } from '../../components/modals';
import colors from '../../constants/colors';
import { BASE_URL } from '../../constants/api';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';

export default function GiftsScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading]     = useState(true);
  const [refreshing, setRefreshing]   = useState(false);
  const [gifts, setGifts]             = useState([]);
  const [claimingId, setClaimingId]   = useState(null);
  const [claimResult, setClaimResult] = useState(null);

  const loadGifts = async () => {
    try {
      const data = await challengeService.getGifts();
      setGifts(data.data.gifts || []);
    } catch (err) {
      console.error('Load gifts error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadGifts(); }, []));

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadGifts();
  }, []);

  const handleClaim = async (gift) => {
    setClaimingId(gift.user_challenge_reward_id);
    try {
      const res = await challengeService.claimGift(
        gift.user_challenge_reward_id
      );
      // Remove from list and show success modal
      setGifts(prev =>
        prev.filter(
          g => g.user_challenge_reward_id !== gift.user_challenge_reward_id
        )
      );
      setClaimResult(res.data);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to claim.');
    } finally {
      setClaimingId(null);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <SoundTouchableOpacity onPress={() => router.back()} soundType="back">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </SoundTouchableOpacity>
        <View style={styles.headerTitleRow}>
          <Ionicons name="gift-outline" size={19} color={colors.primary} />
          <Text style={styles.headerTitle}>Gifts</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      {gifts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="gift-outline" size={56} color={colors.borderDark} />
          <Text style={styles.emptyTitle}>No gifts yet</Text>
          <Text style={styles.emptySub}>
            Complete challenges to earn special rewards!
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
          {gifts.map((gift) => (
            <View key={gift.user_challenge_reward_id} style={styles.card}>
              {/* Badge image */}
              {gift.badge_image ? (
                <Image
                  source={{ uri: `${BASE_URL}/${gift.badge_image}` }}
                  style={styles.badgeImg}
                />
              ) : (
                <View style={styles.badgePlaceholder}>
                  <Ionicons name="ribbon-outline" size={30} color={colors.primary} />
                </View>
              )}

              <View style={styles.cardInfo}>
                <Text style={styles.challengeName} numberOfLines={1}>
                  {gift.challenge_name}
                </Text>
                <View style={styles.rewardTypeRow}>
                  <Ionicons
                    name={gift.type === 'completion' ? 'checkmark-circle-outline' : 'trophy-outline'}
                    size={13}
                    color={gift.type === 'completion' ? colors.success : colors.xpColor}
                  />
                  <Text style={styles.rewardType}>
                    {gift.type === 'completion'
                      ? 'Completion Reward'
                      : `Top ${gift.top_value} Ranking Reward`
                    }
                  </Text>
                </View>
                <View style={styles.pills}>
                  {gift.xp_reward > 0 && (
                    <View style={styles.pill}>
                      <Text style={styles.pillText}>+{gift.xp_reward} XP</Text>
                    </View>
                  )}
                  {gift.badge_name && (
                    <View style={[styles.pill, styles.pillBadge]}>
                      <Ionicons name="ribbon-outline" size={11} color={colors.xpColor} />
                      <Text style={styles.pillText}>{gift.badge_name}</Text>
                    </View>
                  )}
                </View>
              </View>

              <SoundTouchableOpacity
                style={[
                  styles.claimBtn,
                  claimingId === gift.user_challenge_reward_id
                    && styles.claimBtnDisabled
                ]}
                onPress={() => handleClaim(gift)}
                disabled={!!claimingId}
              >
                {claimingId === gift.user_challenge_reward_id ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.claimBtnText}>Claim</Text>
                )}
              </SoundTouchableOpacity>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      <RewardClaimedModal
        visible={!!claimResult}
        result={claimResult}
        onClose={() => setClaimResult(null)}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },

  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 17, fontWeight: '700', color: colors.textPrimary,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  list: { padding: 16, gap: 12 },

  card: {
    backgroundColor: colors.bgWhite, borderRadius: 16, padding: 14,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  badgeImg: { width: 56, height: 56, borderRadius: 28 },
  badgePlaceholder: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primaryBg,
    alignItems: 'center', justifyContent: 'center',
  },
  cardInfo: { flex: 1, gap: 3 },
  challengeName: {
    fontSize: 14, fontWeight: '700', color: colors.textPrimary,
  },
  rewardTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardType: { fontSize: 12, color: colors.textSecondary },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  pill: {
    backgroundColor: colors.primaryBg, borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
    flexDirection: 'row', alignItems: 'center', gap: 3,
  },
  pillBadge: { backgroundColor: '#fef3c7' },
  pillText: { fontSize: 11, fontWeight: '600', color: colors.primary },

  claimBtn: {
    backgroundColor: colors.primary, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10, minWidth: 60,
    alignItems: 'center',
  },
  claimBtnDisabled: { backgroundColor: colors.primaryLight },
  claimBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  empty: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 40, gap: 12,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  emptySub: {
    fontSize: 14, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 20,
  },

});
