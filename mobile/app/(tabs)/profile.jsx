import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import profileService from '../../services/profileService';
import useAuthStore from '../../store/authStore';

import LoadingScreen from '../../components/common/LoadingScreen';
import ProfileHeader from '../../components/profile/ProfileHeader';
import BadgeGrid from '../../components/profile/BadgeGrid';
import ImpactStats from '../../components/profile/ImpactStats';
import StatsSummary from '../../components/profile/StatsSummary';
import colors from '../../constants/colors';
import progressService from '../../services/progressService';

const TABS = ['Badge', 'Impact', 'Stat'];

export default function ProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Badge');
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState(null);
  const [impact, setImpact] = useState(null);

  const loadData = async () => {
    try {
      const [profileData, badgesData, impactData] = await Promise.all([
        profileService.getProfile(),
        profileService.getBadges(),
        progressService.getProgress('all_time'),
      ]);
      setProfile(profileData.data);
      updateUser(profileData.data);
      setBadges(badgesData.data);
      setImpact(impactData.data?.environmental_impact);
    } catch (err) {
      console.error('Load profile error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => { loadData(); }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>

      {/* Header with Settings */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>
          {user?.username}
        </Text>
        <View style={styles.topBarRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/screens/friends')}
          >
            <Ionicons
              name="people-outline"
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/screens/settings')}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={colors.textPrimary}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Profile Header */}
        <ProfileHeader
          user={profile}
          totalBadges={badges?.total_unlocked || 0}
          totalActions={profile?.total_actions || 0}
          totalFriends={profile?.total_friends || 0}
          isOwnProfile
          onEditPress={() => router.push('/screens/edit-profile')}
        />

        {/* Tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.tabActive
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {activeTab === 'Badge' && badges && (
          <BadgeGrid
            unlocked={badges.unlocked}
            locked={badges.locked}
          />
        )}

        {activeTab === 'Impact' && (
          <ImpactStats impact={impact} />
        )}

        {activeTab === 'Stat' && (
          <StatsSummary
            user={profile}
            totalBadges={badges?.total_unlocked || 0}
          />
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  topBar: {
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
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  topBarRight: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    padding: 6,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});