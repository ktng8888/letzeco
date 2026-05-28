import { AppState } from 'react-native';
import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from 'expo-audio';

import useAudioStore from '../store/audioStore';

const clickSource = require('../assets/audio/ui-click.wav');
const bgmSource = require('../assets/audio/eco-ambient-loop.wav');

let clickPlayer = null;
let bgmPlayer = null;
let initialized = false;
let appStateSubscription = null;
let storeSubscription = null;

const safely = async (task) => {
  try {
    await task();
  } catch (err) {
    console.warn('Audio unavailable:', err?.message || err);
  }
};

const syncSettings = () => {
  const { bgmEnabled, bgmVolume, sfxVolume } = useAudioStore.getState();

  if (clickPlayer) {
    clickPlayer.volume = sfxVolume;
  }

  if (bgmPlayer) {
    bgmPlayer.volume = bgmVolume;
    if (bgmEnabled && AppState.currentState === 'active') {
      bgmPlayer.play();
    } else {
      bgmPlayer.pause();
    }
  }
};

export const initAudio = async () => {
  if (initialized) {
    syncSettings();
    return;
  }

  initialized = true;

  await safely(async () => {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      interruptionMode: 'mixWithOthers',
    });

    clickPlayer = createAudioPlayer(clickSource);
    bgmPlayer = createAudioPlayer(bgmSource);
    bgmPlayer.loop = true;

    syncSettings();

    appStateSubscription = AppState.addEventListener('change', async (nextState) => {
      if (nextState === 'active') {
        await setIsAudioActiveAsync(true);
        syncSettings();
      } else {
        bgmPlayer?.pause();
        await setIsAudioActiveAsync(false);
      }
    });

    storeSubscription = useAudioStore.subscribe(syncSettings);
  });
};

export const playClickSound = () => {
  const { sfxEnabled } = useAudioStore.getState();
  if (!sfxEnabled || !clickPlayer) return;

  try {
    clickPlayer.seekTo(0).finally(() => clickPlayer.play());
  } catch (err) {
    console.warn('Click sound failed:', err?.message || err);
  }
};

export const disposeAudio = () => {
  appStateSubscription?.remove?.();
  storeSubscription?.();
  clickPlayer?.release?.();
  bgmPlayer?.release?.();
  appStateSubscription = null;
  storeSubscription = null;
  clickPlayer = null;
  bgmPlayer = null;
  initialized = false;
};
