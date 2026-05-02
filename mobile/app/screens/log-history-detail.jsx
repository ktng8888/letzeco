import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Modal, Linking
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import actionService from '../../services/actionService';
import LoadingScreen from '../../components/common/LoadingScreen';
import Badge from '../../components/common/Badge';
import { getImageUrl } from '../../utils/imageUrl';
import colors from '../../constants/colors';

export default function LogHistoryDetailScreen() {
  const router = useRouter();
  const { logId } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [log, setLog] = useState(null);
  const [showCalcModal, setShowCalcModal] = useState(false);

  useEffect(() => { loadLog(); }, []);

  const loadLog = async () => {
    try {
      const data = await actionService.getHistoryById(logId);
      setLog(data.data);
    } catch (err) {
      console.error('Load log detail error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!log) return null;

  const imageUrl = getImageUrl(log.action_image);
  const hasImpact = log.co2_saved || log.litre_saved || log.kwh_saved;

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Record</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero Section ── */}
        <View style={styles.heroSection}>
          <View style={styles.heroBadgeWrap}>
            <Badge
              text={log.category_name}
              bgColor={log.tag_bg_colour_code}
              textColor={log.tag_text_colour_code}
            />
          </View>
          <View style={styles.heroRow}>
            {imageUrl ? (
              <Image source={{ uri: imageUrl }} style={styles.actionIcon} />
            ) : (
              <View style={[styles.actionIcon, styles.actionIconFallback]}>
                <Text style={{ fontSize: 26 }}>🌿</Text>
              </View>
            )}
            <Text style={styles.actionName}>{log.action_name}</Text>
          </View>
          <Text style={styles.logCountText}>
            The {ordinal(log.times_logged_this_action)} time I logged this action
            {'  •  '}
            The {ordinal(log.total_actions_completed)} logged action overall
          </Text>
        </View>

        {/* ── Time & Reward Card ── */}
        <View style={styles.card}>
          <View style={styles.cardSection}>
            <View style={styles.cardSectionHeader}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={styles.cardSectionTitle}>Time</Text>
            </View>
            <View style={styles.timeRow}>
              <View style={styles.timeItem}>
                <Text style={styles.timeItemLabel}>Started</Text>
                <Text style={styles.timeItemVal}>{formatDate(log.start_time)}</Text>
                <Text style={styles.timeItemSub}>{formatTime(log.start_time)}</Text>
              </View>
              <View style={styles.timeDivider} />
              <View style={styles.timeItem}>
                <Text style={styles.timeItemLabel}>Completed</Text>
                <Text style={styles.timeItemVal}>{formatDate(log.end_time)}</Text>
                <Text style={styles.timeItemSub}>{formatTime(log.end_time)}</Text>
              </View>
              <View style={styles.timeDivider} />
              <View style={styles.timeItem}>
                <Text style={styles.timeItemLabel}>Duration</Text>
                <Text style={[styles.timeItemVal, { color: colors.primary }]}>
                  {getDuration(log.start_time, log.end_time)}
                </Text>
              </View>
            </View>
          </View>

          {/* Reward row inside same card */}
          <View style={[styles.cardSection, styles.cardSectionBorder]}>
            <View style={styles.cardSectionHeader}>
              <Ionicons name="sparkles" size={14} color={colors.primary} />
              <Text style={styles.cardSectionTitle}>Reward</Text>
            </View>
            <View style={styles.rewardRow}>
              <View style={styles.rewardBox}>
                <Text style={styles.rewardValue}>{log.xp_gained} XP</Text>
                <Text style={styles.rewardLabel}>Earned</Text>
                  {log.proof && log.proof.status === 'approved' && (
                    <Text style={styles.rewardBreakdown}>
                      {log.xp_gained - log.proof.bonus_xp} XP + {log.proof.bonus_xp} bonus XP
                    </Text>
                  )}
              </View>
            </View>
          </View>
        </View>

        {/* ── Description + Why This Matters Card ── */}
        <View style={styles.card}>
          <View style={styles.cardSection}>
            <View style={styles.cardSectionHeader}>
              <View style={styles.descDot} />
              <Text style={styles.cardSectionTitle}>Description</Text>
            </View>
            <Text style={styles.cardBodyText}>{log.description}</Text>
          </View>

          {log.importance && (
            <View style={[styles.cardSection, styles.cardSectionBorder]}>
              <View style={styles.cardSectionHeader}>
                <Ionicons name="heart" size={14} color={colors.primary} />
                <Text style={styles.cardSectionTitle}>Why This Matters</Text>
              </View>
              <Text style={styles.cardBodyText}>{log.importance}</Text>
            </View>
          )}
        </View>

        {/* ── Environmental Impact ── */}
        {hasImpact && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={{ fontSize: 16 }}>🌿</Text>
              <Text style={styles.sectionTitle}>Environmental Impact</Text>
            </View>
            <View style={styles.impactRow}>
              <ImpactCard
                icon="co2"
                value={log.co2_saved}
                unit="Kg CO₂"
                label="Saved"
                active={!!log.co2_saved}
              />
              <ImpactCard
                icon="water"
                value={log.litre_saved}
                unit="L Water"
                label="Saved"
                active={!!log.litre_saved}
              />
              <ImpactCard
                icon="flash"
                value={log.kwh_saved}
                unit="kWh Energy"
                label="Saved"
                active={!!log.kwh_saved}
              />
            </View>
          </View>
        )}

        {/* ── How is this calculated button ── */}
        {(log.calc_info || log.source) && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.calcBtn}
              onPress={() => setShowCalcModal(true)}
            >
              <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
              <Text style={styles.calcBtnText}>How is this calculated?</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Proof Section ── */}
        {log.proof && (
          <View style={styles.card}>
            <View style={styles.cardSection}>
              <View style={styles.cardSectionHeader}>
                <Ionicons name="camera" size={14} color={colors.primary} />
                <Text style={styles.cardSectionTitle}>Proof Submitted</Text>
              </View>

              <Text style={styles.proofRequirement}>
                📋 {log.proof.requirement}
              </Text>

              {/* Status badge */}
              <View style={[
                styles.proofStatusBadge,
                log.proof.status === 'approved'
                  ? styles.proofStatusApproved
                  : styles.proofStatusRejected
              ]}>
                <Ionicons
                  name={log.proof.status === 'approved' ? 'checkmark-circle' : 'close-circle'}
                  size={14}
                  color={log.proof.status === 'approved' ? colors.success : colors.error}
                />
                <Text style={[
                  styles.proofStatusText,
                  { color: log.proof.status === 'approved' ? colors.success : colors.error }
                ]}>
                  {log.proof.status === 'approved' ? 'Proof Accepted' : 'Proof Rejected'}
                </Text>
                {log.proof.status === 'approved' && (
                  <Text style={styles.proofBonusText}>+{log.proof.bonus_xp} XP</Text>
                )}
              </View>

              {/* Proof photo */}
              {log.proof.image && (
                <Image
                  source={{ uri: getImageUrl(log.proof.image) }}
                  style={styles.proofImage}
                  resizeMode="cover"
                />
              )}
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── How is this calculated Modal ── */}
      <Modal
        visible={showCalcModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCalcModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Ionicons name="information-circle-outline" size={40} color={colors.primary} />
            <Text style={styles.modalTitle}>How is this calculated?</Text>

            {log.calc_info && (
              <Text style={styles.modalBody}>{log.calc_info}</Text>
            )}

            {log.source && (
              <View style={styles.modalSourceBox}>
                <Text style={styles.modalSourceLabel}>Source:</Text>
                <Text
                  style={styles.modalSourceLink}
                  onPress={() => Linking.openURL(log.source)}
                >
                  {log.source}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setShowCalcModal(false)}
            >
              <Text style={styles.modalBtnText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ── Impact Card (mirrors action-detail) ──
function ImpactCard({ icon, value, unit, label, active }) {
  const getIcon = () => {
    if (icon === 'co2') return (
      <Ionicons name="cloud-outline" size={28} color={active ? colors.primary : colors.textLight} />
    );
    if (icon === 'water') return (
      <Ionicons name="water-outline" size={28} color={active ? '#3b82f6' : colors.textLight} />
    );
    if (icon === 'flash') return (
      <Ionicons name="flash-outline" size={28} color={active ? '#f59e0b' : colors.textLight} />
    );
  };

  const getActiveColor = () => {
    if (icon === 'co2') return colors.primary;
    if (icon === 'water') return '#3b82f6';
    if (icon === 'flash') return '#f59e0b';
    return colors.primary;
  };

  return (
    <View style={[
      styles.impactCard,
      active && { borderColor: getActiveColor(), borderWidth: 1.5 }
    ]}>
      <View style={styles.impactIconWrap}>{getIcon()}</View>
      <Text style={[styles.impactValue, active && { color: getActiveColor() }]}>
        {active ? value : '--'}
      </Text>
      <Text style={styles.impactUnit}>{unit}</Text>
      <Text style={styles.impactLabel}>{label}</Text>
    </View>
  );
}

// ── Helpers ──
function formatDate(dateString) {
  if (!dateString) return '—';
  const d = new Date(dateString);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

function getDuration(start, end) {
  if (!start || !end) return '—';
  const diff = Math.floor((new Date(end) - new Date(start)) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m} min`;
  return '< 1 min';
}

function ordinal(n) {
  if (!n) return '1st';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgLight },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 52,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.bgGrey,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17, fontWeight: '700', color: colors.textPrimary,
  },

  // ── Hero ──
  heroSection: {
    backgroundColor: colors.bgWhite,
    padding: 16,
    paddingBottom: 20,
    gap: 8,
    alignItems: 'center',
  },
  heroBadgeWrap: { alignSelf: 'center' },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 6,
    flexWrap: 'wrap',
  },
  actionIcon: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: colors.bgGrey,
  },
  actionIconFallback: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primaryBg,
  },
  actionName: {
    fontSize: 22, fontWeight: '700',
    color: colors.primary,
    lineHeight: 28, textAlign: 'center',
    flex: 1,
  },
  logCountText: {
    fontSize: 12, color: colors.textSecondary, textAlign: 'center',
  },

  // ── Cards ──
  card: {
    backgroundColor: colors.bgWhite,
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 16, padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  cardSection: { gap: 10 },
  cardSectionBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  cardSectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  descDot: {
    width: 14, height: 14, borderRadius: 3,
    borderWidth: 2, borderColor: colors.textLight,
  },
  cardSectionTitle: {
    fontSize: 14, fontWeight: '700', color: colors.warning,
  },
  cardBodyText: {
    fontSize: 13, color: colors.textSecondary, lineHeight: 20,
  },

  // ── Time row ──
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeItem: { flex: 1, alignItems: 'center', gap: 2 },
  timeItemLabel: { fontSize: 10, color: colors.textSecondary, fontWeight: '500' },
  timeItemVal: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, textAlign: 'center' },
  timeItemSub: { fontSize: 11, color: colors.textSecondary },
  timeDivider: { width: 1, height: 40, backgroundColor: colors.border },

  // ── Reward ──
  rewardRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  rewardBox: {
    backgroundColor: colors.bgLight,
    borderRadius: 12,
    paddingHorizontal: 28,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardValue: {
    fontSize: 22, fontWeight: '700', color: colors.xpColor,
  },
  rewardLabel: {
    fontSize: 11, color: colors.textSecondary, marginTop: 2,
  },

  // ── Section ──
  section: {
    marginHorizontal: 16, marginTop: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6, marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '700', color: colors.primary,
  },

  // ── Impact ──
  impactRow: { flexDirection: 'row', gap: 10 },
  impactCard: {
    flex: 1,
    backgroundColor: colors.bgWhite,
    borderRadius: 14, padding: 12,
    alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  impactIconWrap: {
    width: 48, height: 48, borderRadius: 24,
    borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  impactValue: {
    fontSize: 18, fontWeight: '700', color: colors.textSecondary,
  },
  impactUnit: {
    fontSize: 11, color: colors.textSecondary, textAlign: 'center',
  },
  impactLabel: { fontSize: 11, color: colors.textSecondary },

  // ── Calc button ──
  calcBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'center',
  },
  calcBtnText: {
    fontSize: 13, color: colors.primary, fontWeight: '600',
  },

  // ── Proof ──
  rewardBreakdown: {
    fontSize: 11,
    color: colors.xpColor,
    marginTop: 4,
    opacity: 0.8,
  },
  proofRequirement: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  proofStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  proofStatusApproved: {
    backgroundColor: '#dcfce7',
  },
  proofStatusRejected: {
    backgroundColor: '#fee2e2',
  },
  proofStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  proofBonusText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.success,
    marginLeft: 2,
  },
  proofImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 10,
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.bgWhite,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    gap: 12,
  },
  modalTitle: {
    fontSize: 18, fontWeight: '700',
    color: colors.primary, textAlign: 'center',
  },
  modalBody: {
    fontSize: 14, color: colors.textSecondary,
    textAlign: 'center', lineHeight: 22,
  },
  modalSourceBox: { alignItems: 'center', gap: 4 },
  modalSourceLabel: {
    fontSize: 14, fontWeight: '700', color: colors.textPrimary,
  },
  modalSourceLink: {
    fontSize: 13, color: '#3b82f6',
    textDecorationLine: 'underline', textAlign: 'center',
  },
  modalBtn: {
    backgroundColor: colors.warning,
    borderRadius: 12,
    paddingHorizontal: 40, paddingVertical: 12, marginTop: 4,
  },
  modalBtnText: {
    fontSize: 15, fontWeight: '700', color: colors.textWhite,
  },
});