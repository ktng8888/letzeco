import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, RefreshControl
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import profileService from '../../services/profileService';
import friendService from '../../services/friendService';
import ProfileHeader from '../../components/profile/ProfileHeader';
import BadgeGrid from '../../components/profile/BadgeGrid';
import ImpactStats from '../../components/profile/ImpactStats';
import LoadingScreen from '../../components/common/LoadingScreen';
import colors from '../../constants/colors';

const TABS = ['Badge', 'Impact', 'Stat'];

export default function UserProfileScreen() {
  const router = useRouter();
  const { userId } = useLocalSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [badges, setBadges] = useState(null);
  const [activeTab, setActiveTab] = useState('Badge');
  const [friendshipStatus, setFriendshipStatus] = useState('none');
  const [friendshipId, setFriendshipId] = useState(null);

  const loadData = async () => {
    try {
      const [profileData, badgesData] = await Promise.all([
        friendService.getFriendProfile(userId),
        profileService.getFriendBadges(userId),
      ]);

      setProfile(profileData.data);
      setBadges(badgesData.data);
      setFriendshipStatus(profileData.data.friendship_status);
      setFriendshipId(profileData.data.friendship_id);

    } catch (err) {
      console.error('Load user profile error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, [userId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleFriendAction = async () => {
    try {
      if (friendshipStatus === 'none') {
        await friendService.sendRequest(userId);
        setFriendshipStatus('request_sent');
        Alert.alert('Success', 'Friend request sent!');
      } else if (friendshipStatus === 'request_received') {
        await friendService.approve(friendshipId);
        setFriendshipStatus('friends');
        Alert.alert('Success', 'Friend request approved!');
      } else if (friendshipStatus === 'friends') {
        Alert.alert(
          'Remove Friend',
          'Are you sure you want to remove this friend?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                await friendService.removeFriend(friendshipId);
                setFriendshipStatus('none');
                setFriendshipId(null);
              }
            }
          ]
        );
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed.');
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {profile?.username}
        </Text>
        <View style={{ width: 24 }} />
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
          isOwnProfile={false}
          friendshipStatus={friendshipStatus}
          onFriendPress={handleFriendAction}
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
          <ImpactStats user={profile} />
        )}

        {activeTab === 'Stat' && (
          <View style={styles.statPlaceholder}>
            <Text style={styles.statPlaceholderText}>
              Stats coming soon
            </Text>
          </View>
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
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
  tabActive: { borderBottomColor: colors.primary },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  statPlaceholder: {
    padding: 40,
    alignItems: 'center',
  },
  statPlaceholderText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});