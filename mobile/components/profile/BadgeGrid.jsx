import {
  View, Text, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { BASE_URL } from '../../constants/api';
import colors from '../../constants/colors';

const FILTERS = [
  { key: 'all', label: 'Show all' },
  { key: 'unlocked', label: 'Show unlocked' },
  { key: 'locked', label: 'Show locked' },
  { key: 'current', label: 'Show current status' },
];

const getGroupKey = (badge) => [
  badge.type || '',
  badge.type === 'log' ? badge.action_category_id || '' : '',
  badge.type === 'log_specific_action' ? badge.action_id || '' : '',
].join(':');

const getCurrentStatusBadges = (badges) => {
  const groups = new Map();

  badges.forEach((badge) => {
    const key = getGroupKey(badge);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(badge);
  });

  return Array.from(groups.values()).map((group) => {
    const tiers = group.sort((a, b) => a.target_value - b.target_value);
    const nextLocked = tiers.find(badge => !badge.is_unlocked);
    return nextLocked || tiers[tiers.length - 1];
  }).filter(Boolean);
};

export default function BadgeGrid({ unlocked = [], locked = [] }) {
  const router = useRouter();
  const [filter, setFilter] = useState('all');

  const allBadges = useMemo(
    () => [
      ...unlocked.map(badge => ({ ...badge, is_unlocked: true })),
      ...locked.map(badge => ({ ...badge, is_unlocked: false })),
    ],
    [unlocked, locked]
  );

  const currentStatus = useMemo(
    () => getCurrentStatusBadges(allBadges),
    [allBadges]
  );

  const goToDetail = (achievementId) => {
    router.push({
      pathname: '/screens/achievement-detail',
      params: { achievementId },
    });
  };

  const renderBadgeCard = (badge) => {
    const progress = Math.min(
      ((badge.current_progress || 0) / (badge.target_value || 1)) * 100,
      100
    );

    return (
      <TouchableOpacity
        key={badge.id}
        style={styles.badgeCard}
        onPress={() => goToDetail(badge.id)}
        activeOpacity={0.75}
      >
        <View style={styles.badgeImgWrap}>
          {badge.badge_image ? (
            <Image
              source={{ uri: `${BASE_URL}/${badge.badge_image}` }}
              style={[
                styles.badgeImg,
                !badge.is_unlocked && styles.badgeImgLocked,
              ]}
              resizeMode="contain"
            />
          ) : (
            <View style={[
              styles.badgeImg,
              badge.is_unlocked
                ? styles.badgeImgFallback
                : styles.badgeImgFallbackLocked,
            ]}>
              <Text style={styles.fallbackEmoji}>
                {badge.is_unlocked ? '🏅' : '🔒'}
              </Text>
            </View>
          )}

          {badge.is_unlocked ? (
            <View style={styles.checkDot}>
              <Text style={styles.checkDotText}>✓</Text>
            </View>
          ) : (
            <View style={styles.lockOverlay}>
              <Text style={styles.lockIcon}>🔒</Text>
            </View>
          )}
        </View>

        <Text style={[
          styles.badgeName,
          !badge.is_unlocked && styles.badgeNameLocked,
        ]} numberOfLines={2}>
          {badge.badge_name}
        </Text>

        <View style={styles.progressBar}>
          <View style={[
            styles.progressFill,
            { width: badge.is_unlocked ? '100%' : `${progress}%` }
          ]} />
        </View>

        {!badge.is_unlocked && (
          <Text style={styles.progressText}>
            {badge.current_progress || 0} / {badge.target_value}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderSection = (title, badges) => (
    badges?.length > 0 && (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.grid}>
          {badges.map(renderBadgeCard)}
        </View>
      </View>
    )
  );

  const isEmpty =
    (filter === 'all' && allBadges.length === 0) ||
    (filter === 'unlocked' && unlocked.length === 0) ||
    (filter === 'locked' && locked.length === 0) ||
    (filter === 'current' && currentStatus.length === 0);

  return (
    <View style={styles.container}>
      <View style={styles.filterHeader}>
        <Text style={styles.filterInfo}>
          {unlocked.length} unlocked · {locked.length} locked
        </Text>
        <View style={styles.filterOptions}>
          {FILTERS.map((item) => {
            const active = filter === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.filterOption}
                onPress={() => setFilter(item.key)}
                activeOpacity={0.75}
              >
                <View style={[
                  styles.checkbox,
                  active && styles.checkboxActive,
                ]}>
                  {active && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={[
                  styles.filterLabel,
                  active && styles.filterLabelActive,
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {filter === 'all' && (
        <>
          {renderSection('Unlocked', unlocked.map(badge => ({
            ...badge,
            is_unlocked: true,
          })))}
          {renderSection('Locked', locked.map(badge => ({
            ...badge,
            is_unlocked: false,
          })))}
        </>
      )}

      {filter === 'unlocked' && renderSection(
        'Unlocked',
        unlocked.map(badge => ({ ...badge, is_unlocked: true }))
      )}

      {filter === 'locked' && renderSection(
        'Locked',
        locked.map(badge => ({ ...badge, is_unlocked: false }))
      )}

      {filter === 'current' && renderSection(
        'Current Status',
        currentStatus
      )}

      {isEmpty && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No badges to show</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  filterHeader: {
    gap: 10,
  },
  filterInfo: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTick: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  filterLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: colors.textPrimary,
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  badgeCard: {
    width: '22%',
    alignItems: 'center',
    gap: 5,
  },
  badgeImgWrap: {
    width: 64,
    height: 64,
    position: 'relative',
  },
  badgeImg: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  badgeImgFallback: {
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImgLocked: {
    opacity: 0.25,
  },
  badgeImgFallbackLocked: {
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  fallbackEmoji: { fontSize: 28 },
  checkDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  checkDotText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  lockOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: { fontSize: 20 },
  badgeName: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
  },
  badgeNameLocked: {
    color: colors.textSecondary,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.bgGrey,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
