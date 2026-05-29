import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import challengeService from '../../services/challengeService';
import LoadingScreen from '../../components/common/LoadingScreen';
import EligibleActionsList from '../../components/challenges/EligibleActionsList';
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../../components/common/SoundTouchableOpacity';

export default function ChallengeActionsScreen() {
  const router = useRouter();
  const { challengeId, challengeName } = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [challenge, setChallenge] = useState(null);

  const loadData = async () => {
    try {
      const data = await challengeService.getById(challengeId);
      setChallenge(data.data);
    } catch (err) {
      console.error('Load challenge eligible actions error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [challengeId])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [challengeId]);

  if (isLoading) return <LoadingScreen />;

  const actions = challenge?.eligible_actions || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SoundTouchableOpacity style={styles.backBtn} onPress={() => router.back()} soundType="back">
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </SoundTouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Eligible Actions
        </Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.intro}>
        <Text style={styles.challengeName} numberOfLines={2}>
          {challenge?.name || challengeName}
        </Text>
        <Text style={styles.subtitle}>
          Only these actions count toward this challenge.
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        <EligibleActionsList actions={actions} />
        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 56,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  intro: {
    backgroundColor: colors.bgWhite,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  content: {
    padding: 16,
  },
});
