import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, RefreshControl,
  ActivityIndicator, Alert
} from 'react-native';
import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import friendService from '../../services/friendService';
import useAuthStore from '../../store/authStore';
import LoadingScreen from '../../components/common/LoadingScreen';
import colors from '../../constants/colors';

const TABS = ['Friend', 'Sent Request', 'Pending Request'];

export default function FriendsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Friend');
  const [friends, setFriends] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const loadData = async () => {
    try {
      const [friendsData, sentData, pendingData] = await Promise.all([
        friendService.getFriends(),
        friendService.getSentRequests(),
        friendService.getPendingRequests(),
      ]);
      setFriends(friendsData.data.friends || []);
      setSentRequests(sentData.data.requests || []);
      setPendingRequests(pendingData.data.requests || []);
    } catch (err) {
      console.error('Load friends error:', err);
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

  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await friendService.searchUsers(query);
      setSearchResults(data.data.users || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (userId) => {
    try {
      await friendService.sendRequest(userId);
      // Refresh search results
      handleSearch(searchQuery);
      Alert.alert('Success', 'Friend request sent!');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed.');
    }
  };

  const handleApprove = async (friendshipId) => {
    try {
      await friendService.approve(friendshipId);
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed.');
    }
  };

  const handleReject = async (friendshipId) => {
    try {
      await friendService.reject(friendshipId);
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed.');
    }
  };

  const handleCancel = async (friendshipId) => {
    try {
      await friendService.cancelRequest(friendshipId);
      loadData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed.');
    }
  };

  const handleRemove = async (friendshipId) => {
    Alert.alert(
      'Remove Friend',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await friendService.removeFriend(friendshipId);
              loadData();
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
        <TouchableOpacity
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons
            name={showSearch ? 'close' : 'person-add-outline'}
            size={22}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Add Friend</Text>
          <Text style={styles.searchSubtitle}>
            User ID: {user?.id}
          </Text>
          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={18}
              color={colors.textSecondary}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by User ID or Username"
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
            {isSearching && (
              <ActivityIndicator size="small" color={colors.primary} />
            )}
          </View>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <View style={styles.searchResults}>
              <Text style={styles.searchResultsLabel}>
                Search results: {searchResults.length} results
              </Text>
              {searchResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  user={result}
                  onViewPress={() => router.push({
                    pathname: '/screens/user-profile',
                    params: { userId: result.id }
                  })}
                  onActionPress={() => {
                    if (result.friendship_status === 'none') {
                      handleSendRequest(result.id);
                    }
                  }}
                />
              ))}
            </View>
          )}

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <Text style={styles.noResults}>
              Search results: 0 results
            </Text>
          )}
        </View>
      )}

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
            ]} numberOfLines={1}>
              {tab}
              {tab === 'Pending Request' && pendingRequests.length > 0
                ? ` (${pendingRequests.length})`
                : ''
              }
            </Text>
          </TouchableOpacity>
        ))}
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
        {/* Friends Tab */}
        {activeTab === 'Friend' && (
          <View style={styles.listSection}>
            {friends.length === 0 ? (
              <EmptyFriends
                message="No friends yet. Search and add friends!"
              />
            ) : (
              friends.map((f) => (
                <FriendCard
                  key={f.friendship_id}
                  user={{
                    id: f.friend_id,
                    username: f.friend_username,
                    level: f.friend_level,
                    profile_image: f.friend_profile_image,
                    weekly_xp: f.friend_weekly_xp,
                  }}
                  onViewPress={() => router.push({
                    pathname: '/screens/user-profile',
                    params: { userId: f.friend_id }
                  })}
                  onRemovePress={() => handleRemove(f.friendship_id)}
                  primaryAction="View"
                  secondaryAction="Remove"
                />
              ))
            )}
          </View>
        )}

        {/* Sent Requests Tab */}
        {activeTab === 'Sent Request' && (
          <View style={styles.listSection}>
            {sentRequests.length === 0 ? (
              <EmptyFriends message="No sent requests." />
            ) : (
              sentRequests.map((r) => (
                <FriendCard
                  key={r.friendship_id}
                  user={{
                    id: r.receiver_id,
                    username: r.receiver_username,
                    level: r.receiver_level,
                  }}
                  onViewPress={() => router.push({
                    pathname: '/screens/user-profile',
                    params: { userId: r.receiver_id }
                  })}
                  onRemovePress={() => handleCancel(r.friendship_id)}
                  primaryAction="View"
                  secondaryAction="Cancel"
                />
              ))
            )}
          </View>
        )}

        {/* Pending Requests Tab */}
        {activeTab === 'Pending Request' && (
          <View style={styles.listSection}>
            {pendingRequests.length === 0 ? (
              <EmptyFriends message="No pending requests." />
            ) : (
              pendingRequests.map((r) => (
                <PendingCard
                  key={r.friendship_id}
                  user={{
                    id: r.sender_id,
                    username: r.sender_username,
                    level: r.sender_level,
                  }}
                  onApprove={() => handleApprove(r.friendship_id)}
                  onReject={() => handleReject(r.friendship_id)}
                  onViewPress={() => router.push({
                    pathname: '/screens/user-profile',
                    params: { userId: r.sender_id }
                  })}
                />
              ))
            )}
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

    </View>
  );
}

// ─────────────────────────────────────────
// SUBCOMPONENTS
// ─────────────────────────────────────────

function FriendCard({ user, onViewPress, onRemovePress, primaryAction, secondaryAction }) {
  return (
    <View style={styles.friendCard}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>
          {user.username?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{user.username}</Text>
        <Text style={styles.friendMeta}>Lv. {user.level}</Text>
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity
          style={styles.friendActionBtn}
          onPress={onViewPress}
        >
          <Text style={styles.friendActionText}>{primaryAction}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.friendActionBtn, styles.friendActionBtnSecondary]}
          onPress={onRemovePress}
        >
          <Text style={styles.friendActionTextSecondary}>
            {secondaryAction}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function PendingCard({ user, onApprove, onReject, onViewPress }) {
  return (
    <View style={styles.friendCard}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>
          {user.username?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{user.username}</Text>
        <Text style={styles.friendMeta}>Lv. {user.level}</Text>
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity
          style={[styles.friendActionBtn, styles.approveBtn]}
          onPress={onApprove}
        >
          <Text style={styles.approveBtnText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.friendActionBtn, styles.rejectBtn]}
          onPress={onReject}
        >
          <Text style={styles.rejectBtnText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function SearchResultCard({ user, onViewPress, onActionPress }) {
  const status = user.friendship_status;

  const actionLabel = status === 'friends'
    ? 'Friends'
    : status === 'request_sent'
    ? 'Sent'
    : status === 'request_received'
    ? 'Received'
    : 'Send Request';

  return (
    <View style={styles.friendCard}>
      <View style={styles.friendAvatar}>
        <Text style={styles.friendAvatarText}>
          {user.username?.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{user.username}</Text>
        <Text style={styles.friendMeta}>Lv. {user.level}</Text>
      </View>
      <View style={styles.friendActions}>
        <TouchableOpacity
          style={styles.friendActionBtn}
          onPress={onViewPress}
        >
          <Text style={styles.friendActionText}>View</Text>
        </TouchableOpacity>
        {status === 'none' && (
          <TouchableOpacity
            style={[styles.friendActionBtn, styles.sendRequestBtn]}
            onPress={onActionPress}
          >
            <Text style={styles.sendRequestText}>Add</Text>
          </TouchableOpacity>
        )}
        {status !== 'none' && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{actionLabel}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function EmptyFriends({ message }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>👫</Text>
      <Text style={styles.emptyText}>{message}</Text>
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
  searchSection: {
    backgroundColor: colors.bgWhite,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  searchSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgGrey,
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  searchResults: { marginTop: 12 },
  searchResultsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  noResults: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: colors.primary },
  tabText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  listSection: { padding: 16 },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  friendAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  friendInfo: { flex: 1 },
  friendName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  friendMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  friendActions: {
    flexDirection: 'row',
    gap: 6,
  },
  friendActionBtn: {
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  friendActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  friendActionBtnSecondary: {
    backgroundColor: '#fef2f2',
  },
  friendActionTextSecondary: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  approveBtn: { backgroundColor: colors.primaryBg },
  approveBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  rejectBtn: { backgroundColor: '#fef2f2' },
  rejectBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.error,
  },
  sendRequestBtn: { backgroundColor: colors.primary },
  sendRequestText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textWhite,
  },
  statusBadge: {
    backgroundColor: colors.bgGrey,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 10,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});