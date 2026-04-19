import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl, Modal,
  ActivityIndicator
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import actionService from '../../services/actionService';
import useActionStore from '../../store/actionStore';

import ScreenHeader from '../../components/common/ScreenHeader';
import LoadingScreen from '../../components/common/LoadingScreen';
import SectionHeader from '../../components/common/SectionHeader';
import EmptyState from '../../components/common/EmptyState';
import CategoryCard from '../../components/logAction/CategoryCard';
import ActionCard from '../../components/logAction/ActionCard';
import ActionInProgressBar from '../../components/logAction/ActionInProgressBar';
import colors from '../../constants/colors';

export default function LogActionScreen() {
  const router = useRouter();
  const { currentAction, setCurrentAction } = useActionStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('categories');
  // tabs: 'categories' | 'recommended' | 'favourites'

  const [categories, setCategories] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [favourites, setFavourites] = useState([]);

  const loadData = async () => {
    try {
      const [catData, todayData] = await Promise.all([
        actionService.getCategories(),
        actionService.getTodayActions(),
      ]);

      setCategories(catData.data || []);

      // Set current in-progress action
      if (todayData.data.current_logging) {
        setCurrentAction(todayData.data.current_logging);
      } else {
        setCurrentAction(null);
      }

    } catch (err) {
      console.error('Load log action error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const loadTabData = async (tab) => {
    try {
      if (tab === 'recommended' && recommended.length === 0) {
        const data = await actionService.getRecommended();
        setRecommended(data.data || []);
      }
      if (tab === 'favourites') {
        const data = await actionService.getFavourites();
        setFavourites(data.data || []);
      }
    } catch (err) {
      console.error('Load tab data error:', err);
    }
  };

  // Reload when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadTabData(tab);
  };

  const handleFavouriteToggle = async (action) => {
    try {
      if (action.is_favourite) {
        await actionService.removeFavourite(action.id);
      } else {
        await actionService.addFavourite(action.id);
      }
      // Reload favourites
      const data = await actionService.getFavourites();
      setFavourites(data.data || []);
      // Update recommended list too
      setRecommended(prev =>
        prev.map(a => a.id === action.id
          ? { ...a, is_favourite: !a.is_favourite }
          : a
        )
      );
    } catch (err) {
      console.error('Toggle favourite error:', err);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <View style={styles.container}>

      {/* Header */}
      <ScreenHeader title="Log Daily Eco Actions" />

      {/* In Progress Banner */}
      {currentAction && (
        <ActionInProgressBar currentAction={currentAction} />
      )}

      {/* Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabs}
        >
          <TabButton
            label="Categories"
            count={categories.length > 0 ? categories.length : null}
            active={activeTab === 'categories'}
            onPress={() => handleTabChange('categories')}
          />
          <TabButton
            label="Recommended"
            count={recommended.length > 0 ? recommended.length : null}
            active={activeTab === 'recommended'}
            onPress={() => handleTabChange('recommended')}
          />
          <TabButton
            label="My Favourites"
            count={favourites.length > 0 ? favourites.length : null}
            active={activeTab === 'favourites'}
            onPress={() => handleTabChange('favourites')}
          />
        </ScrollView>
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
        {/* History Button */}
        <TouchableOpacity
          style={styles.historyBtn}
          onPress={() => router.push('/screens/log-history')}
        >
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>

        {/* Content */}
        {activeTab === 'categories' && (
          <View style={styles.content}>
            <Text style={styles.sectionLabel}>
              Choose a category to log your action
            </Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onPress={() => router.push({
                    pathname: '/screens/category-actions',
                    params: { categoryId: cat.id, categoryName: cat.name }
                  })}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'recommended' && (
          <View style={styles.content}>
            {recommended.length === 0 ? (
              <EmptyState
                title="No recommendations yet"
                subtitle="Complete more actions to get personalised recommendations!"
              />
            ) : (
              recommended.map((action) => (
                <ActionCard
                  key={action.id}
                  action={action}
                  onPress={() => router.push({
                    pathname: '/screens/action-detail',
                    params: { actionId: action.id }
                  })}
                  onFavouriteToggle={handleFavouriteToggle}
                />
              ))
            )}
          </View>
        )}

        {activeTab === 'favourites' && (
          <View style={styles.content}>
            {favourites.length === 0 ? (
              <EmptyState
                title="No favourites yet"
                subtitle="Tap the heart icon on any action to add it here!"
              />
            ) : (
              favourites.map((fav) => (
                <ActionCard
                  key={fav.id}
                  action={{
                    ...fav,
                    id: fav.action_id,
                    name: fav.action_name,
                    image: fav.action_image,
                    user_log_count: fav.user_log_count ?? 0,
                    is_favourite: true,
                  }}
                  onPress={() => router.push({
                    pathname: '/screens/action-detail',
                    params: { actionId: fav.action_id }
                  })}
                  onFavouriteToggle={handleFavouriteToggle}
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

function TabButton({ label, count, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
        {count !== null && ` (${count})`}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgLight,
  },
  tabsWrapper: {
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.bgGrey,
  },
  tabActive: {
    backgroundColor: colors.primaryBg,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  historyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  historyText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 14,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});