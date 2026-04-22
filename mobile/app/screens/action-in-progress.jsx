import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Modal
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import actionService from '../../services/actionService';
import useActionStore from '../../store/actionStore';
import useAuthStore from '../../store/authStore';
import Badge from '../../components/common/Badge';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useCountdown, timeLimitToSeconds } from '../../hooks/useCountdown';
import colors from '../../constants/colors';

export default function ActionInProgressScreen() {
  const router = useRouter();
  const { userActionId } = useLocalSearchParams();
  const { clearCurrentAction } = useActionStore();
  const { updateUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [userAction, setUserAction] = useState(null);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => { loadAction(); }, []);

  const loadAction = async () => {
    try {
      const todayData = await actionService.getTodayActions();
      const action = todayData.data.current_logging;
      if (action) {
        setUserAction(action);
      } else {
        // Not in progress anymore
        router.back();
      }
    } catch (err) {
      console.error('Load in-progress action error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Countdown timer
  const timeLimitSeconds = timeLimitToSeconds(userAction?.time_limit);
  const { formatted, remaining, isExpired } = useCountdown(
    userAction?.start_time,
    timeLimitSeconds
  );

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      const data = await actionService.completeAction(userActionId);
      clearCurrentAction();

      // Navigate to complete screen
      router.replace({
        pathname: '/screens/action-complete',
        params: {
          result: JSON.stringify(data.data)
        }
      });

    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete action.';
      if (err.response?.data?.time_exceeded) {
        clearCurrentAction();
        Alert.alert('Time Is Over!', msg, [
          { text: 'OK', onPress: () => router.back() }
        ]);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await actionService.cancelAction(userActionId);
      clearCurrentAction();
      router.back();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to cancel.');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const handleUploadProof = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Camera permission is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (result.canceled) return;

    setIsUploadingProof(true);
    try {
      const imageUri = result.assets[0].uri;
      await actionService.uploadProof(userActionId, imageUri);
      setProofUploaded(true);
      Alert.alert('Success!', 'Proof uploaded! Bonus XP will be added on completion.');
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Upload failed.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  if (isLoading || !userAction) return <LoadingScreen />;

  const hasTimeLimit = timeLimitSeconds > 0;
  const timePercent = hasTimeLimit
    ? Math.max(0, (remaining / timeLimitSeconds) * 100)
    : 0;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={[
        styles.header,
        isExpired && styles.headerExpired
      ]}>
        <Text style={styles.headerLabel}>
          {isExpired ? 'Time is Over' : 'Action in Progress'}
        </Text>
        <Text style={styles.startTime}>
          Started at {formatTime(userAction.start_time)}
        </Text>

        {/* Timer */}
        {hasTimeLimit && (
          <View style={styles.timerContainer}>
            <Text style={[
              styles.timerText,
              isExpired && styles.timerExpired
            ]}>
              {isExpired ? '0 min 0 sec' : formatted}
            </Text>
            <Text style={styles.timerLabel}>
              {isExpired ? '⚠️ Time is Over' : 'left'}
            </Text>

            {/* Timer Progress Ring placeholder */}
            {hasTimeLimit && !isExpired && (
              <View style={styles.progressBar}>
                <View style={[
                  styles.progressFill,
                  { width: `${timePercent}%` },
                  timePercent < 20 && styles.progressFillDanger
                ]} />
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Action Info */}
        <Badge
          text={userAction.category_name || 'Eco Action'}
          bgColor={userAction.tag_bg_colour_code}
          textColor={userAction.tag_text_colour_code}
          size="lg"
        />
        <Text style={styles.actionName}>{userAction.action_name}</Text>

        {/* Description */}
        <Text style={styles.description}>{userAction.description}</Text>

        {/* Environmental Impact */}
        <View style={styles.impactCard}>
          <Text style={styles.impactTitle}>Environmental Impact</Text>
          <View style={styles.impactRow}>
            <ImpactBox
              value={formatImpactValue(userAction.co2_saved)}
              unit="Kg CO₂"
              icon="🌿"
            />
            <ImpactBox
              value={formatImpactValue(userAction.litre_saved)}
              unit="L Water"
              icon="💧"
            />
            <ImpactBox
              value={formatImpactValue(userAction.kwh_saved)}
              unit="kWh"
              icon="⚡"
            />
          </View>
        </View>

        {/* Proof Section */}
        {userAction.proof && !isExpired && (
          <View style={styles.proofSection}>
            <Text style={styles.proofTitle}>Provide Proof (Optional)</Text>
            <Text style={styles.proofRequirement}>
              📷 {userAction.proof?.requirement || 'Upload a photo'}
            </Text>
            <Text style={styles.proofBonus}>
              (bonus +{userAction.proof?.bonus_xp} XP)
            </Text>

            {proofUploaded ? (
              <View style={styles.proofUploaded}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.proofUploadedText}>Proof Uploaded!</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoBtn}
                onPress={handleUploadProof}
                disabled={isUploadingProof}
              >
                {isUploadingProof ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Ionicons name="camera-outline" size={18} color={colors.primary} />
                    <Text style={styles.photoBtnText}>Take Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        {isExpired ? (
          // Time is over — show Try Again
          <TouchableOpacity
            style={styles.tryAgainBtn}
            onPress={() => router.back()}
          >
            <Text style={styles.tryAgainText}>Try Again</Text>
          </TouchableOpacity>
        ) : (
          <>
            {/* Complete */}
            <TouchableOpacity
              style={[styles.completeBtn, isCompleting && styles.btnDisabled]}
              onPress={handleComplete}
              disabled={isCompleting}
            >
              {isCompleting
                ? <ActivityIndicator color={colors.textWhite} />
                : <Text style={styles.completeBtnText}>Complete Action</Text>
              }
            </TouchableOpacity>

            {/* Cancel */}
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowCancelConfirm(true)}
            >
              <Text style={styles.cancelBtnText}>Cancel Action</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Cancel Confirm Modal */}
      <Modal
        visible={showCancelConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Cancel Action?</Text>
            <Text style={styles.modalText}>
              Are you sure? Your progress will be lost.
            </Text>
            <TouchableOpacity
              style={styles.modalBtnDanger}
              onPress={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling
                ? <ActivityIndicator color={colors.textWhite} />
                : <Text style={styles.modalBtnText}>Yes, Cancel</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSecondary}
              onPress={() => setShowCancelConfirm(false)}
            >
              <Text style={styles.modalBtnSecondaryText}>Keep Going</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

function ImpactBox({ value, unit, icon }) {
  return (
    <View style={styles.impactBox}>
      <Text style={styles.impactIcon}>{icon}</Text>
      <Text style={styles.impactValue}>{value}</Text>
      <Text style={styles.impactUnit}>{unit}</Text>
    </View>
  );
}

function formatImpactValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  const num = Number(value);
  if (Number.isNaN(num)) return '-';
  return num.toString();
}

function formatTime(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return `${h % 12 || 12}:${m} ${ampm}`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgWhite },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerExpired: {
    backgroundColor: colors.error,
  },
  headerLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  startTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 12,
  },
  timerContainer: { alignItems: 'center', gap: 4 },
  timerText: {
    fontSize: 42,
    fontWeight: '700',
    color: colors.textWhite,
  },
  timerExpired: { color: colors.xpColor },
  timerLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  progressBar: {
    width: 200,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.textWhite,
    borderRadius: 3,
  },
  progressFillDanger: {
    backgroundColor: colors.xpColor,
  },
  content: { padding: 20 },
  actionName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 20,
  },
  impactCard: {
    backgroundColor: colors.bgGrey,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  impactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactBox: { alignItems: 'center', gap: 4 },
  impactIcon: { fontSize: 22 },
  impactValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  impactUnit: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  proofSection: {
    backgroundColor: colors.bgGrey,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  proofTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  proofRequirement: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  proofBonus: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  proofUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  proofUploadedText: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgWhite,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  photoBtnText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: colors.bgWhite,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  completeBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBtnText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 14,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: colors.error,
    fontSize: 15,
    fontWeight: '600',
  },
  tryAgainBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tryAgainText: {
    color: colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  btnDisabled: {
    backgroundColor: colors.primaryLight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.bgWhite,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  modalText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalBtnDanger: {
    backgroundColor: colors.error,
    borderRadius: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalBtnText: {
    color: colors.textWhite,
    fontSize: 15,
    fontWeight: '600',
  },
  modalBtnSecondary: { paddingVertical: 10 },
  modalBtnSecondaryText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
