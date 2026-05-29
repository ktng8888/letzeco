import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, Modal, Image
} from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import actionService from '../../services/actionService';
import useActionStore from '../../store/actionStore';
import useAuthStore from '../../store/authStore';
import Badge from '../../components/common/Badge';
import LoadingScreen from '../../components/common/LoadingScreen';
import { useCountdown, timeLimitToSeconds } from '../../hooks/useCountdown';
import colors from '../../constants/colors';

export default function ActionInProgressScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userActionId } = useLocalSearchParams();
  const { setCurrentAction, clearCurrentAction } = useActionStore();
  const { updateUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isTryingAgain, setIsTryingAgain] = useState(false);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [userAction, setUserAction] = useState(null);
  const [proofUploaded, setProofUploaded] = useState(false);
  const [proofImageUri, setProofImageUri] = useState(null);
  const [proofImagePath, setProofImagePath] = useState(null);
  const [validationStatus, setValidationStatus] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [validationToken, setValidationToken] = useState(null);
  const [showProofPreview, setShowProofPreview] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [timeoutCancelled, setTimeoutCancelled] = useState(false);

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

  useEffect(() => {
    if (!isExpired || !userAction || timeoutCancelled) return;

    const cancelExpiredAction = async () => {
      try {
        if (proofImagePath) {
          await actionService.deleteProof(userActionId, proofImagePath);
        }
        await actionService.cancelAction(userActionId);
      } catch (err) {
        const status = err.response?.status;
        if (status !== 400 && status !== 404) {
          console.error('Auto-cancel expired action error:', err);
        }
      } finally {
        clearCurrentAction();
        setTimeoutCancelled(true);
      }
    };

    cancelExpiredAction();
  }, [isExpired, userAction, timeoutCancelled, proofImagePath, userActionId]);

  useEffect(() => {
    if (!isExpired && timeoutCancelled) {
      setTimeoutCancelled(false);
    }
  }, [isExpired, timeoutCancelled]);

  const completeAction = async ({ includeProof } = { includeProof: true }) => {
    setIsCompleting(true);
    try {
      const proofData = includeProof && validationStatus === 'approved'
        ? {
            proof_image: proofImagePath,
            proof_validation_token: validationToken,
          }
        : {
            proof_image: proofImagePath,
          };
      const data = await actionService.completeAction(userActionId, proofData);
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

  const handleComplete = async () => {
    if (validationStatus === 'rejected') {
      Alert.alert(
        'Proof Rejected',
        'Please retake and validate a new proof photo before completing this action.'
      );
      return;
    }

    if (userAction.proof && validationStatus !== 'approved') {
      Alert.alert(
        'Complete Without Approved Proof?',
        'No proof bonus XP will be given.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Complete',
            style: 'destructive',
            onPress: () => completeAction({ includeProof: false }),
          },
        ]
      );
      return;
    }

    completeAction({ includeProof: true });
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      if (proofImagePath) {
        await actionService.deleteProof(userActionId, proofImagePath);
      }
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

  const handleTryAgain = async () => {
    if (!userAction?.action_id) return;

    setIsTryingAgain(true);
    try {
      const data = await actionService.startAction(userAction.action_id);
      const nextAction = {
        ...userAction,
        id: data.data.user_action_id,
        start_time: data.data.start_time,
        time_limit: data.data.time_limit,
        xp_reward: data.data.xp_reward,
      };

      setProofUploaded(false);
      setProofImageUri(null);
      setProofImagePath(null);
      setValidationStatus(null);
      setValidationResult(null);
      setValidationToken(null);
      setUserAction(nextAction);
      setCurrentAction(nextAction);

      router.replace({
        pathname: '/screens/action-in-progress',
        params: { userActionId: data.data.user_action_id }
      });
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to start action.');
    } finally {
      setIsTryingAgain(false);
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
      const uploadResult = await actionService.uploadProof(userActionId, imageUri);
      setProofUploaded(true);
      setProofImageUri(imageUri);
      setProofImagePath(uploadResult.data?.proof_image || null);
      setValidationStatus(null);
      setValidationResult(null);
      setValidationToken(null);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Upload failed.');
    } finally {
      setIsUploadingProof(false);
    }
  };

  const handleValidateProof = async () => {
    if (!proofImagePath) return;

    setValidationStatus('validating');
    setValidationResult(null);
    setValidationToken(null);

    try {
      const result = await actionService.validateProof(userActionId, proofImagePath);
      const payload = result.data;
      setValidationResult(payload);

      if (payload.validation === 'passed') {
        setValidationStatus('approved');
        setValidationToken(payload.validation_token);
      } else {
        setValidationStatus('rejected');
      }
    } catch (err) {
      setValidationStatus('rejected');
      setValidationResult({
        issue: err.response?.data?.message || 'Validation failed. Please try again.',
        expected: '',
      });
    }
  };

  const handleDeleteProof = async () => {
    Alert.alert(
      'Retake Photo?',
      'Your current proof photo will be removed. You can take a new one.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Retake',
          style: 'destructive',
          onPress: async () => {
            try {
              await actionService.deleteProof(userActionId, proofImagePath);
              setProofUploaded(false);
              setProofImageUri(null);
              setProofImagePath(null);
              setValidationStatus(null);
              setValidationResult(null);
              setValidationToken(null);
            } catch (err) {
              Alert.alert('Error', err.response?.data?.message || 'Failed to remove proof.');
            }
          }
        }
      ]
    );
  };

  if (isLoading || !userAction) return <LoadingScreen />;

  const hasTimeLimit = timeLimitSeconds > 0;
  const timePercent = hasTimeLimit
    ? Math.max(0, (remaining / timeLimitSeconds) * 100)
    : 0;
  const isTimeLow = hasTimeLimit && timePercent < 20;

  return (
    <View style={styles.container}>

      {/* Timer Header */}
      <View style={[
        styles.header,
        { paddingTop: insets.top + 26 },
        isExpired && styles.headerExpired
      ]}>
        <View style={styles.statusPill}>
          <Ionicons
            name={isExpired ? 'alert-circle' : 'flash'}
            size={14}
            color={isExpired ? colors.error : colors.primary}
          />
          <Text style={[
            styles.statusPillText,
            isExpired && styles.statusPillTextExpired,
          ]}>
            {isExpired ? 'Time is Over' : 'Action in Progress'}
          </Text>
        </View>

        {/* Timer */}
        {hasTimeLimit && (
          <View style={styles.compactTimer}>
            <View style={styles.compactTimerTop}>
              <View style={styles.compactTimerCopy}>
                <Text style={styles.compactTimerLabel}>
                  Started {formatTime(userAction.start_time)}
                </Text>
                <Text style={[
                  styles.compactTimerText,
                  isExpired && styles.timerExpired,
                  isTimeLow && !isExpired && styles.timerLow,
                ]}>
                  {isExpired ? '0 min 0 sec' : formatted}
                </Text>
              </View>
              <Text style={styles.compactTimerState}>
                {isExpired ? 'ended' : 'left'}
              </Text>
            </View>
            {!isExpired && (
              <View style={styles.compactProgressBar}>
                <View style={[
                  styles.progressFill,
                  styles.compactProgressFill,
                  { width: `${timePercent}%` },
                  isTimeLow && styles.progressFillDanger
                ]} />
              </View>
            )}
          </View>
        )}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 168 }
        ]}
      >
        {/* Action Info */}
        <View style={styles.actionCard}>
          <Badge
            text={userAction.category_name || 'Eco Action'}
            bgColor={userAction.tag_bg_colour_code}
            textColor={userAction.tag_text_colour_code}
            size="lg"
          />
          <Text style={styles.actionName}>{userAction.action_name}</Text>

          {/* Description */}
          <Text style={styles.description}>{userAction.description}</Text>
        </View>

        {/* Environmental Impact */}
        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <Ionicons name="leaf" size={18} color={colors.primary} />
            <Text style={styles.impactTitle}>Environmental Impact</Text>
          </View>
          <View style={styles.impactRow}>
            <ImpactBox
              value={formatImpactValue(userAction.co2_saved)}
              unit="Kg CO₂"
            />
            <ImpactBox
              value={formatImpactValue(userAction.litre_saved)}
              unit="L Water"
            />
            <ImpactBox
              value={formatImpactValue(userAction.kwh_saved)}
              unit="kWh"
            />
          </View>
        </View>

        {/* Proof Section */}
        {userAction.proof && !isExpired && (
          <View style={styles.proofSection}>
            <View style={styles.proofHeader}>
              <View style={styles.proofIconWrap}>
                <Ionicons name="camera" size={22} color={colors.primary} />
              </View>
              <View style={styles.proofHeaderText}>
                <Text style={styles.proofTitle}>Provide Proof</Text>
                <Text style={styles.proofOptional}>Optional bonus task</Text>
              </View>
              <View style={styles.proofBonusPill}>
                <Text style={styles.proofBonusText}>
                  +{userAction.proof?.bonus_xp || 0} XP
                </Text>
              </View>
            </View>

            <View style={styles.proofRequirementBox}>
              <Ionicons name="image-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.proofRequirement}>
                {userAction.proof?.requirement || 'Upload a photo'}
              </Text>
            </View>

            {proofUploaded ? (
              <View style={styles.proofUploadedWrap}>
                {proofImageUri && (
                  <TouchableOpacity
                    style={styles.proofPreviewCard}
                    activeOpacity={0.9}
                    onPress={() => setShowProofPreview(true)}
                  >
                    <Image
                      source={{ uri: proofImageUri }}
                      style={styles.proofPreviewImage}
                      resizeMode="cover"
                    />
                    <View style={styles.proofPreviewOverlay}>
                      <Ionicons name="expand-outline" size={16} color={colors.textWhite} />
                      <Text style={styles.proofPreviewText}>Preview</Text>
                    </View>
                  </TouchableOpacity>
                )}

                <View style={styles.proofUploadedRow}>
                  <View style={styles.proofUploaded}>
                    <Ionicons name="image" size={20} color={colors.primary} />
                    <Text style={styles.proofUploadedText}>Proof Photo Ready</Text>
                  </View>
                  {validationStatus !== 'approved' && (
                    <TouchableOpacity
                      style={styles.retakeBtn}
                      onPress={handleDeleteProof}
                    >
                      <Ionicons name="camera-outline" size={14} color={colors.error} />
                      <Text style={styles.retakeBtnText}>Retake</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {validationStatus !== 'approved' && (
                  <TouchableOpacity
                    style={[
                      styles.validateBtn,
                      validationStatus === 'validating' && styles.validateBtnDisabled,
                    ]}
                    onPress={handleValidateProof}
                    disabled={validationStatus === 'validating'}
                  >
                    {validationStatus === 'validating' ? (
                      <ActivityIndicator size="small" color={colors.textWhite} />
                    ) : (
                      <>
                        <Ionicons name="sparkles" size={17} color={colors.textWhite} />
                        <Text style={styles.validateBtnText}>Validate Proof</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {validationStatus && (
                  <View style={[
                    styles.validationCard,
                    validationStatus === 'approved' && styles.validationApproved,
                    validationStatus === 'rejected' && styles.validationRejected,
                  ]}>
                    <View style={styles.validationHeader}>
                      <Ionicons
                        name={
                          validationStatus === 'approved'
                            ? 'checkmark-circle'
                            : validationStatus === 'rejected'
                              ? 'close-circle'
                              : 'sync-circle'
                        }
                        size={18}
                        color={
                          validationStatus === 'approved'
                            ? colors.success
                            : validationStatus === 'rejected'
                              ? colors.error
                              : colors.primary
                        }
                      />
                      <Text style={[
                        styles.validationTitle,
                        validationStatus === 'approved' && { color: colors.success },
                        validationStatus === 'rejected' && { color: colors.error },
                      ]}>
                        {validationStatus === 'approved'
                          ? 'Proof Approved'
                          : validationStatus === 'rejected'
                            ? 'Proof Rejected'
                            : 'Validating Proof'}
                      </Text>
                    </View>
                    {validationStatus === 'approved' && (
                      <Text style={styles.validationText}>
                        Bonus XP will be recorded when you complete this action.
                      </Text>
                    )}
                    {validationStatus === 'rejected' && (
                      <Text style={styles.validationText}>
                        {validationResult?.issue || 'This photo does not match the proof requirement.'}
                        {validationResult?.expected ? ` Expected: ${validationResult.expected}` : ''}
                      </Text>
                    )}
                    {validationStatus === 'validating' && (
                      <Text style={styles.validationText}>
                        Checking your proof photo...
                      </Text>
                    )}
                  </View>
                )}
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
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={[
        styles.footer,
        { paddingBottom: Math.max(insets.bottom, 18) + 12 }
      ]}>
        {isExpired ? (
          <View style={styles.expiredActions}>
            <TouchableOpacity
              style={[styles.backFooterBtn, isTryingAgain && styles.btnDisabled]}
              onPress={() => router.back()}
              disabled={isTryingAgain}
            >
              <Text style={styles.backFooterText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tryAgainBtn, isTryingAgain && styles.btnDisabled]}
              onPress={handleTryAgain}
              disabled={isTryingAgain}
            >
              {isTryingAgain
                ? <ActivityIndicator color={colors.textWhite} />
                : <Text style={styles.tryAgainText}>Try Again</Text>
              }
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Complete */}
            <TouchableOpacity
              style={[
                styles.completeBtn,
                (isCompleting || validationStatus === 'rejected') && styles.btnDisabled,
              ]}
              onPress={handleComplete}
              disabled={isCompleting || validationStatus === 'rejected'}
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

      {/* Proof Preview Modal */}
      <Modal
        visible={showProofPreview}
        transparent
        animationType="fade"
        onRequestClose={() => setShowProofPreview(false)}
      >
        <View style={styles.previewOverlay}>
          <TouchableOpacity
            style={[styles.previewCloseBtn, { top: insets.top + 14 }]}
            onPress={() => setShowProofPreview(false)}
          >
            <Ionicons name="close" size={24} color={colors.textWhite} />
          </TouchableOpacity>

          {proofImageUri && (
            <Image
              source={{ uri: proofImageUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

    </View>
  );
}

function ImpactBox({ value, unit }) {
  const active = value !== '-' && Number(value) > 0;
  const meta = getImpactMeta(unit);
  return (
    <View style={[
      styles.impactBox,
      active && {
        borderColor: meta.color,
        backgroundColor: colors.bgWhite,
      },
    ]}>
      <View style={[
        styles.impactIconWrap,
        active && {
          borderColor: meta.color,
          backgroundColor: `${meta.color}12`,
        },
      ]}>
        <Ionicons
          name={meta.icon}
          size={27}
          color={active ? meta.color : colors.textLight}
        />
      </View>
      <Text style={[
        styles.impactValue,
        active && { color: meta.color },
      ]}>
        {active ? value : '--'}
      </Text>
      <Text style={styles.impactUnit}>{unit}</Text>
      <Text style={styles.impactLabel}>Saved</Text>
    </View>
  );
}

function getImpactMeta(unit = '') {
  if (unit.includes('Water')) {
    return { icon: 'water-outline', color: colors.info };
  }
  if (unit.includes('kWh')) {
    return { icon: 'flash-outline', color: colors.xpColor };
  }
  return { icon: 'cloud-outline', color: colors.primary };
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
  container: { flex: 1, backgroundColor: colors.bgLight },
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
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bgWhite,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 7,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  statusPillTextExpired: {
    color: colors.error,
  },
  timerExpired: { color: colors.xpColor },
  timerLow: { color: colors.xpColor },
  progressFill: {
    height: '100%',
    backgroundColor: colors.textWhite,
    borderRadius: 3,
  },
  progressFillDanger: {
    backgroundColor: colors.xpColor,
  },
  compactTimer: {
    width: '100%',
    maxWidth: 430,
    backgroundColor: colors.bgWhite,
    borderRadius: 18,
    padding: 12,
    gap: 9,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  compactTimerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  compactTimerCopy: {
    flex: 1,
    minWidth: 0,
  },
  compactTimerLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '700',
    marginBottom: 2,
  },
  compactTimerText: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '900',
  },
  compactTimerState: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  compactProgressBar: {
    height: 7,
    backgroundColor: colors.bgGrey,
    borderRadius: 999,
    overflow: 'hidden',
  },
  compactProgressFill: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  actionCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 14,
    marginBottom: 8,
    lineHeight: 28,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  impactCard: {
    backgroundColor: colors.bgWhite,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 14,
  },
  impactRow: {
    flexDirection: 'row',
    gap: 10,
  },
  impactBox: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
    minWidth: 0,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgWhite,
    paddingVertical: 13,
    paddingHorizontal: 6,
  },
  impactIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  impactValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textSecondary,
  },
  impactUnit: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '700',
  },
  impactLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  
  proofSection: {
    backgroundColor: colors.bgWhite,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  proofHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proofIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  proofHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  proofTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  proofOptional: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  proofBonusPill: {
    backgroundColor: colors.xpBg,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  proofBonusText: {
    fontSize: 12,
    color: colors.xpColor,
    fontWeight: '900',
  },
  proofRequirementBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.bgGrey,
    borderRadius: 13,
    padding: 12,
  },
  proofRequirement: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  proofUploaded: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  proofUploadedText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryBg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'stretch',
  },
  photoBtnText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '800',
  },
  proofUploadedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  proofUploadedWrap: {
    gap: 10,
    marginTop: 4,
  },
  proofPreviewCard: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.bgWhite,
  },
  proofPreviewImage: {
    width: '100%',
    height: '100%',
  },
  proofPreviewOverlay: {
    position: 'absolute',
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  proofPreviewText: {
    fontSize: 12,
    color: colors.textWhite,
    fontWeight: '600',
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  retakeBtnText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },
  validateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'stretch',
  },
  validateBtnDisabled: {
    opacity: 0.72,
  },
  validateBtnText: {
    fontSize: 15,
    color: colors.textWhite,
    fontWeight: '800',
  },
  validationCard: {
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgGrey,
    padding: 12,
    gap: 6,
  },
  validationApproved: {
    borderColor: colors.success,
    backgroundColor: '#dcfce7',
  },
  validationRejected: {
    borderColor: colors.error,
    backgroundColor: '#fee2e2',
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  validationTitle: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '800',
  },
  validationText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
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
  expiredActions: {
    flexDirection: 'row',
    gap: 10,
  },
  backFooterBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.textSecondary,
    borderRadius: 14,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backFooterText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '700',
  },
  tryAgainBtn: {
    flex: 2,
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
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  previewCloseBtn: {
    position: 'absolute',
    right: 18,
    zIndex: 2,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: '100%',
    height: '82%',
  },
});
