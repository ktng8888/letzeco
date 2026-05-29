import { AppState } from 'react-native';
import {
  createAudioPlayer,
  setAudioModeAsync,
  setIsAudioActiveAsync,
} from 'expo-audio';

import useAudioStore from '../store/audioStore';

const sfxSources = {
  ui: require('../assets/audio/ui-click.wav'),
  nav: require('../assets/audio/nav-bar-click.wav'),
  tab: require('../assets/audio/tab-click.wav'),
  back: require('../assets/audio/back-click.wav'),
  actionComplete: require('../assets/audio/action-complete.wav'),
  congrats: require('../assets/audio/congrats.wav'),
};
const bgmSource = require('../assets/audio/eco-ambient-loop.wav');

let sfxPlayers = {};
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

  Object.values(sfxPlayers).forEach((player) => {
    player.volume = sfxVolume;
  });

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

    sfxPlayers = Object.entries(sfxSources).reduce((players, [key, source]) => {
      players[key] = createAudioPlayer(source);
      return players;
    }, {});
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

export const playClickSound = (type = 'ui') => {
  const { sfxEnabled } = useAudioStore.getState();
  const player = sfxPlayers[type] || sfxPlayers.ui;
  if (!sfxEnabled || !player) return;

  try {
    player.seekTo(0).finally(() => player.play());
  } catch (err) {
    console.warn('Click sound failed:', err?.message || err);
  }
};

export const disposeAudio = () => {
  appStateSubscription?.remove?.();
  storeSubscription?.();
  Object.values(sfxPlayers).forEach((player) => player?.release?.());
  bgmPlayer?.release?.();
  appStateSubscription = null;
  storeSubscription = null;
  sfxPlayers = {};
  bgmPlayer = null;
  initialized = false;
};
