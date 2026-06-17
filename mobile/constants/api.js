import { Platform } from 'react-native';

// D1002 unifi
const UNIFI_IP = '192.168.0.50';

// Hotspot (in supervisor's office)
const HOTSPOT_IP = '10.143.15.170';

// Change this to switch networks
const NETWORK_IP = HOTSPOT_IP;

// Backend tunnel URL (Update this if the tunnel URL changes)
const TUNNEL_URL = 'https://passage-angel-democrat-descending.trycloudflare.com';

// Change this to switch backend mode
const USE_TUNNEL = true;

const LOCAL_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : `http://${NETWORK_IP}:5000`;

export const BASE_URL = USE_TUNNEL
  ? TUNNEL_URL
  : LOCAL_BASE_URL;

const API_BASE_URL = `${BASE_URL}/api`;

export default API_BASE_URL;