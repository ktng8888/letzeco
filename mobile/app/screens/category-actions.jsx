import {
  View, Text, ScrollView, StyleSheet,
  RefreshControl, Modal, TouchableOpacity,
  Alert
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import actionService from '../../services/actionService';
import useActionStore from '../../store/actionStore';

import LoadingScreen from '../../components/common/LoadingScreen';
import ActionCard from '../../components/logAction/ActionCard';
import ActionInProgressBar from '../../components/logAction/ActionInProgressBar';
import { useCountdown, timeLimitToSeconds } from '../../hooks/useCountdown';
import colors from '../../constants/colors';

export default function CategoryActionsScreen() {
  const router = useRouter();
  const { categoryId, categoryName } = useLocalSearchParams();
  const { currentAction, setCurrentAction, clearCurrentAction }
    = useActionStore();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actions, setActions] = useState([]);
  const [loggedToday, setLoggedToday] = useState(0);
  const [totalInCategory, setTotalInCategory] = useState(0);

  // Blocked popup
  const [showBlocked, setShowBlocked] = useState(false);

  const loadData = async () => {
    try {
      const [catData, todayData] = await Promise.all([
        actionService.getByCategory(categoryId),
        actionService.getTodayActions(),
      ]);

      setActions(catData.data.actions || []);
      setTotalInCategory(catData.data.actions?.length || 0);

      if (todayData.data.current_logging) {
        setCurrentAction(todayData.data.current_logging);
      }

      // Count today's logged in this category
      /*
      const todayInCat = todayData.data.actions?.filter(
        a => a.status === 'completed'
      ).length || 0;
      setLoggedToday(todayInCat);
      */

      // Count unique action types logged today in this category
      const categoryActionIds = catData.data.actions.map(a => a.id);

      const uniqueActions = new Set(
        todayData.data.actions
          ?.filter(a =>
            a.status === 'completed' &&
            categoryActionIds.includes(a.action_id)
          )
          .map(a => a.action_id)
      );

      setLoggedToday(uniqueActions.size);

    } catch (err) {
      console.error('Load category actions error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [categoryId])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleSelectAction = (action) => {
    // If another action is in progress — show blocked popup
    if (currentAction && currentAction.action_id !== action.id) {
      setShowBlocked(true);
      return;
    }
    // Go to action detail
    router.push({
      pathname: '/screens/action-detail',
      params: { actionId: action.id }
    });
  };

  const handleFavouriteToggle = async (action) => {
    try {
      if (action.is_favourite) {
        await actionService.removeFavourite(action.id);
      } else {
        await actionService.addFavourite(action.id);
      }
      setActions(prev =>
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Progress text */}
      <View style={styles.progressRow}>
        {/*
        <Text style={styles.progressText}>
          Logged {loggedToday}/{totalInCategory} {categoryName} Actions Today
        </Text>
        */}

        <Text style={styles.progressText}>
            Logged {loggedToday} {categoryName} Action Type(s) Today
        </Text>
      </View>

      {/* In Progress Banner */}
      {currentAction && (
        <ActionInProgressBar currentAction={currentAction} />
      )}

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
        {actions.map((action) => {
          const isThisLogging = currentAction?.action_id === action.id;
          const seconds = timeLimitToSeconds(action.time_limit);

          return (
            <ActionCardWithTimer
              key={action.id}
              action={action}
              isLogging={isThisLogging}
              startTime={isThisLogging ? currentAction.start_time : null}
              timeLimitSeconds={isThisLogging ? seconds : 0}
              onPress={() => handleSelectAction(action)}
              onFavouriteToggle={handleFavouriteToggle}
            />
          );
        })}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Blocked Popup */}
      <Modal
        visible={showBlocked}
        transparent
        animationType="fade"
        onRequestClose={() => setShowBlocked(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowBlocked(false)}
        >
          <View style={styles.blockedPopup}>
            <Text style={styles.blockedTitle}>Whoa there, speedy! 🚀</Text>
            <Text style={styles.blockedText}>
              You're already logging an action.{'\n'}
              Let's finish that one first before starting a new one.
            </Text>
            <TouchableOpacity
              style={styles.blockedBtn}
              onPress={() => {
                setShowBlocked(false);
                router.push({
                  pathname: '/screens/action-in-progress',
                  params: { userActionId: currentAction?.id }
                });
              }}
            >
              <Text style={styles.blockedBtnText}>
                View Current Action
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.blockedBtnSecondary}
              onPress={() => setShowBlocked(false)}
            >
              <Text style={styles.blockedBtnSecondaryText}>OK</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

// Wrapper to show timer on ActionCard while logging
function ActionCardWithTimer({
  action, isLogging, startTime, timeLimitSeconds, onPress, onFavouriteToggle
}) {
  const { formatted } = useCountdown(startTime, timeLimitSeconds);
  return (
    <ActionCard
      action={action}
      onPress={onPress}
      onFavouriteToggle={onFavouriteToggle}
      isLogging={isLogging}
      timeLeft={isLogging ? formatted + ' left' : null}
    />
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
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressRow: {
    backgroundColor: colors.bgWhite,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    padding: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  blockedPopup: {
    backgroundColor: colors.bgWhite,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  blockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  blockedText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  blockedBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  blockedBtnText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  blockedBtnSecondary: {
    paddingVertical: 10,
  },
  blockedBtnSecondaryText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
});