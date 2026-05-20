import {
  View, Text, Image, TouchableOpacity, StyleSheet
} from 'react-native';
import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BASE_URL } from '../../constants/api';
import colors from '../../constants/colors';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'currentTier', label: 'Current tier' },
  { key: 'unlocked', label: 'Unlocked' },
  { key: 'locked', label: 'Locked' },
];

const getGroupKey = (badge) => [
  badge.type || '',
  badge.type === 'log' ? badge.action_category_id || '' : '',
  badge.type === 'log_specific_action' ? badge.action_id || '' : '',
].join(':');

const getGroupOrder = (badges) => {
  const order = new Map();

  badges.forEach((badge) => {
    const key = getGroupKey(badge);
    if (!order.has(key)) order.set(key, order.size);
  });

  return order;
};

const sortBadgesByGroup = (badges, groupOrder) =>
  [...badges].sort((a, b) => {
    const groupDiff = (groupOrder.get(getGroupKey(a)) ?? 0)
      - (groupOrder.get(getGroupKey(b)) ?? 0);

    if (groupDiff !== 0) return groupDiff;

    return Number(a.target_value || 0) - Number(b.target_value || 0);
  });

const getCurrentTierBadges = (badges) => {
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
  const [filters, setFilters] = useState(['currentTier']);

  const allBadges = useMemo(
    () => [
      ...unlocked.map(badge => ({ ...badge, is_unlocked: true })),
      ...locked.map(badge => ({ ...badge, is_unlocked: false })),
    ],
    [unlocked, locked]
  );

  const groupOrder = useMemo(
    () => getGroupOrder(allBadges),
    [allBadges]
  );

  const sortedUnlocked = useMemo(
    () => sortBadgesByGroup(
      unlocked.map(badge => ({ ...badge, is_unlocked: true })),
      groupOrder
    ),
    [unlocked, groupOrder]
  );

  const sortedLocked = useMemo(
    () => sortBadgesByGroup(
      locked.map(badge => ({ ...badge, is_unlocked: false })),
      groupOrder
    ),
    [locked, groupOrder]
  );

  const currentTierBadges = useMemo(
    () => sortBadgesByGroup(getCurrentTierBadges(allBadges), groupOrder),
    [allBadges, groupOrder]
  );

  const goToDetail = (achievementId) => {
    router.push({
      pathname: '/screens/achievement-detail',
      params: { achievementId },
    });
  };

  const toggleFilter = (key) => {
    if (key === 'all') {
      setFilters(['all']);
      return;
    }

    setFilters((current) => {
      const withoutAll = current.filter(item => item !== 'all');
      const next = withoutAll.includes(key)
        ? withoutAll.filter(item => item !== key)
        : [...withoutAll, key];

      return next.length > 0 ? next : ['all'];
    });
  };

  const getFilterCount = (key) => {
    if (key === 'all') return allBadges.length;
    if (key === 'currentTier') return currentTierBadges.length;
    if (key === 'unlocked') return unlocked.length;
    if (key === 'locked') return locked.length;
    return 0;
  };

  const renderBadgeCard = (badge) => {
    const progress = Math.min(
      ((badge.current_progress || 0) / (badge.target_value || 1)) * 100,
      100
    );
    const progressLabel = badge.is_unlocked
      ? 'Completed'
      : `${badge.current_progress || 0} / ${badge.target_value}`;

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
              <Ionicons
                name={badge.is_unlocked ? 'ribbon' : 'lock-closed'}
                size={26}
                color={badge.is_unlocked ? colors.primary : colors.textSecondary}
              />
            </View>
          )}

          {badge.is_unlocked ? (
            <View style={styles.checkDot}>
              <Ionicons name="checkmark" size={11} color="#fff" />
            </View>
          ) : (
            <View style={styles.lockDot}>
              <Ionicons name="lock-closed" size={10} color="#fff" />
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

        <Text style={[
          styles.progressText,
          badge.is_unlocked && styles.progressTextDone,
        ]}>
          {progressLabel}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSection = (title, badges) => (
    badges?.length > 0 && (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Text style={styles.sectionCount}>{badges.length}</Text>
        </View>
        <View style={styles.grid}>
          {badges.map(renderBadgeCard)}
        </View>
      </View>
    )
  );

  const activeFilters = filters.includes('all') ? ['all'] : filters;
  const isEmpty = activeFilters.every((filter) => {
    if (filter === 'all') return allBadges.length === 0;
    if (filter === 'unlocked') return unlocked.length === 0;
    if (filter === 'locked') return locked.length === 0;
    if (filter === 'currentTier') return currentTierBadges.length === 0;
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <CountCard label="Total" value={allBadges.length} />
        <CountCard label="Unlocked" value={unlocked.length} color={colors.primary} />
        <CountCard label="Locked" value={locked.length} />
        <CountCard label="Current" value={currentTierBadges.length} color={colors.xpColor} />
      </View>

      <View style={styles.filterOptions}>
        {FILTERS.map((item) => {
          const active = filters.includes(item.key);
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.filterOption,
                active && styles.filterOptionActive,
              ]}
              onPress={() => toggleFilter(item.key)}
              activeOpacity={0.75}
            >
              <View style={[
                styles.checkbox,
                active && styles.checkboxActive,
              ]}>
                {active && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
              <Text style={[
                styles.filterLabel,
                active && styles.filterLabelActive,
              ]}>
                {item.label}
              </Text>
              <Text style={[
                styles.filterCount,
                active && styles.filterCountActive,
              ]}>
                {getFilterCount(item.key)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {activeFilters.includes('all') && (
        <>
          {renderSection('Unlocked', sortedUnlocked)}
          {renderSection('Locked', sortedLocked)}
        </>
      )}

      {activeFilters.includes('unlocked') && renderSection(
        'Unlocked',
        sortedUnlocked
      )}

      {activeFilters.includes('locked') && renderSection(
        'Locked',
        sortedLocked
      )}

      {activeFilters.includes('currentTier') && renderSection(
        'Current Tier',
        currentTierBadges
      )}

      {isEmpty && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No badges to show</Text>
        </View>
      )}
    </View>
  );
}

function CountCard({ label, value, color = colors.textPrimary }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 8,
  },
  summaryItem: {
    flex: 1,
    backgroundColor: colors.bgWhite,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionActive: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.primaryBg,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgWhite,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
    flex: 1,
  },
  filterLabelActive: {
    color: colors.textPrimary,
  },
  filterCount: {
    minWidth: 24,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.bgGrey,
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    overflow: 'hidden',
  },
  filterCountActive: {
    backgroundColor: colors.bgWhite,
    color: colors.primary,
  },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  sectionCount: {
    minWidth: 28,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
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
    backgroundColor: colors.bgWhite,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badgeImgWrap: {
    width: 58,
    height: 58,
    position: 'relative',
  },
  badgeImg: {
    width: 58,
    height: 58,
    borderRadius: 29,
  },
  badgeImgFallback: {
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImgLocked: {
    opacity: 0.28,
  },
  badgeImgFallbackLocked: {
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  lockDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeName: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 13,
    minHeight: 26,
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
  progressTextDone: {
    color: colors.primary,
    fontWeight: '700',
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
