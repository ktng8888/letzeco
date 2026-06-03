import {
  View,
  Text,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getImageUrl } from '../../utils/imageUrl';
import colors from '../../constants/colors';
import SoundTouchableOpacity from '../common/SoundTouchableOpacity';

const MAX_EMBLEMS = 3;

export default function EmblemSection({
  emblems = [],
  selectableEmblems = [],
  isOwnProfile = false,
  onSave,
}) {
  const insets = useSafeAreaInsets();
  const [visible, setVisible] = useState(false);
  const [detailEmblem, setDetailEmblem] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedIds(emblems.map(item => item.user_badge_id));
  }, [emblems]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const orderedSelection = useMemo(
    () => selectedIds
      .map(id => selectableEmblems.find(item => item.user_badge_id === id))
      .filter(Boolean),
    [selectedIds, selectableEmblems]
  );

  const openPicker = () => {
    if (!isOwnProfile) return;
    setSelectedIds(emblems.map(item => item.user_badge_id));
    setVisible(true);
  };

  const toggleBadge = (badge) => {
    setSelectedIds((current) => {
      if (current.includes(badge.user_badge_id)) {
        return current.filter(id => id !== badge.user_badge_id);
      }
      if (current.length >= MAX_EMBLEMS) {
        Alert.alert('Limit reached', 'You can select up to 3 emblems.');
        return current;
      }
      return [...current, badge.user_badge_id];
    });
  };

  const save = async () => {
    if (!onSave) {
      setVisible(false);
      return;
    }

    try {
      setIsSaving(true);
      await onSave(selectedIds);
      setVisible(false);
    } catch (err) {
      Alert.alert(
        'Unable to update emblems',
        err.response?.data?.message || 'Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const displayEmblems = emblems.slice(0, MAX_EMBLEMS);
  const detailTitle = detailEmblem?.badge_name || 'Emblem';
  const detailSource = detailEmblem?.achievement_name
    || detailEmblem?.challenge_name
    || (detailEmblem?.badge_type === 'special' ? 'Special Badge' : 'Achievement Badge');
  const ownershipLabel = detailEmblem?.owned_by_viewer === false
    ? 'Not owned'
    : 'Owned';
  const modalBottomPadding = Math.max(insets.bottom, 20) + 22;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Emblems</Text>
        {isOwnProfile && (
          <SoundTouchableOpacity style={styles.editBtn} onPress={openPicker}>
            <Ionicons name="create-outline" size={14} color={colors.primary} />
          </SoundTouchableOpacity>
        )}
      </View>

      <View style={styles.emblemRow}>
        {Array.from({ length: MAX_EMBLEMS }).map((_, index) => {
          const emblem = displayEmblems[index];
          return (
            <SoundTouchableOpacity
              key={index}
              style={styles.emblemSlot}
              onPress={() => {
                if (emblem) {
                  setDetailEmblem(emblem);
                } else {
                  openPicker();
                }
              }}
              disabled={!emblem && !isOwnProfile}
              activeOpacity={0.8}
            >
              {emblem ? (
                <EmblemImage emblem={emblem} size={54} />
              ) : (
                <View style={styles.emptySlot}>
                  <Ionicons name="add" size={22} color={colors.textLight} />
                </View>
              )}
            </SoundTouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalCard,
            { paddingBottom: modalBottomPadding },
          ]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Emblems</Text>
              <SoundTouchableOpacity
                style={styles.closeBtn}
                onPress={() => setVisible(false)}
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </SoundTouchableOpacity>
            </View>

            <View style={styles.selectedStrip}>
              {Array.from({ length: MAX_EMBLEMS }).map((_, index) => {
                const emblem = orderedSelection[index];
                return (
                  <View key={index} style={styles.selectedSlot}>
                    {emblem ? (
                      <EmblemImage emblem={emblem} size={48} />
                    ) : (
                      <Ionicons name="ellipse-outline" size={28} color={colors.textLight} />
                    )}
                  </View>
                );
              })}
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {selectableEmblems.length > 0 ? (
                <View style={styles.grid}>
                  {selectableEmblems.map((badge) => {
                    const selected = selectedSet.has(badge.user_badge_id);
                    return (
                      <SoundTouchableOpacity
                        key={badge.user_badge_id}
                        style={[
                          styles.badgeOption,
                          selected && styles.badgeOptionSelected,
                        ]}
                        onPress={() => toggleBadge(badge)}
                        activeOpacity={0.82}
                      >
                        <EmblemImage emblem={badge} size={66} />
                        {selected && (
                          <View style={styles.selectedDot}>
                            <Ionicons name="checkmark" size={14} color="#fff" />
                          </View>
                        )}
                      </SoundTouchableOpacity>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="ribbon-outline" size={34} color={colors.textLight} />
                  <Text style={styles.emptyText}>No unlocked badges yet</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.modalActions}>
              <SoundTouchableOpacity
                style={styles.removeBtn}
                onPress={() => setSelectedIds([])}
              >
                <Text style={styles.removeText}>Remove All</Text>
              </SoundTouchableOpacity>
              <SoundTouchableOpacity
                style={[styles.okBtn, isSaving && styles.okBtnDisabled]}
                onPress={save}
                disabled={isSaving}
              >
                <Text style={styles.okText}>{isSaving ? 'Saving...' : 'OK'}</Text>
              </SoundTouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!detailEmblem}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailEmblem(null)}
      >
        <View style={styles.detailOverlay}>
          <View style={styles.detailCard}>
            <View style={styles.detailImageWrap}>
              {detailEmblem && <EmblemImage emblem={detailEmblem} size={112} />}
            </View>

            <View style={[
              styles.ownershipPill,
              detailEmblem?.owned_by_viewer === false && styles.ownershipPillMuted,
            ]}>
              <Text style={[
                styles.ownershipText,
                detailEmblem?.owned_by_viewer === false && styles.ownershipTextMuted,
              ]}>
                {ownershipLabel}
              </Text>
            </View>

            <Text style={styles.detailTitle} numberOfLines={3}>
              {detailTitle}
            </Text>
            <Text style={styles.detailDescription}>
              {detailEmblem?.badge_type === 'special'
                ? `A special emblem obtained from ${detailSource}.`
                : `An achievement emblem earned from ${detailSource}.`}
            </Text>

            <SoundTouchableOpacity
              style={styles.detailCloseBtn}
              onPress={() => setDetailEmblem(null)}
            >
              <Ionicons name="close" size={26} color={colors.textSecondary} />
            </SoundTouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function EmblemImage({ emblem, size }) {
  if (emblem?.badge_image) {
    return (
      <Image
        source={{ uri: getImageUrl(emblem.badge_image) }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        resizeMode="contain"
      />
    );
  }

  return (
    <View style={[
      styles.fallbackBadge,
      { width: size, height: size, borderRadius: size / 2 },
    ]}>
      <Ionicons name="ribbon" size={Math.round(size * 0.42)} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
    marginTop: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  editBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryBg,
  },
  emblemRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    minHeight: 58,
  },
  emblemSlot: {
    width: 58,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySlot: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: colors.bgGrey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackBadge: {
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    maxHeight: '82%',
    backgroundColor: colors.bgWhite,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgGrey,
  },
  selectedStrip: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: colors.bgLight,
    borderRadius: 14,
  },
  selectedSlot: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgWhite,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 8,
  },
  scrollContent: {
    paddingBottom: 8,
  },
  badgeOption: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgLight,
  },
  badgeOptionSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  selectedDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bgWhite,
  },
  emptyState: {
    paddingVertical: 50,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
  },
  removeBtn: {
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgGrey,
  },
  removeText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  okBtn: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  okBtnDisabled: {
    opacity: 0.7,
  },
  okText: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textWhite,
  },
  detailOverlay: {
    flex: 1,
    backgroundColor: 'rgba(180, 210, 230, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  detailCard: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    backgroundColor: colors.bgWhite,
    borderRadius: 22,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 8,
  },
  detailImageWrap: {
    width: 118,
    height: 118,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  ownershipPill: {
    minWidth: 88,
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: colors.primaryBg,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    marginBottom: 18,
  },
  ownershipPillMuted: {
    backgroundColor: colors.bgGrey,
    borderColor: colors.border,
  },
  ownershipText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  ownershipTextMuted: {
    color: colors.textSecondary,
  },
  detailTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 25,
    marginBottom: 12,
  },
  detailDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  detailCloseBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
