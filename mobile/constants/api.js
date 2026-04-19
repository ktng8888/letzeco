import { Platform } from 'react-native';

// D1002 unifi
const UNIFI_IP = '192.168.0.50';

// Mobile hotspot
const HOTSPOT_IP = '10.58.71.170';

// eBfi@MMU
const MMU_IP = '10.121.37.254';

//Hotspot (in MMU)
const MMU_HOTSPOT_IP = '10.143.15.170';

//Hospot (in supervisor's office)
const MMU_SUPERVISOR_IP = '10.143.15.170';

// Change this to switch networks
const NETWORK_IP = UNIFI_IP;

const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : `http://${NETWORK_IP}:5000/api`;

export const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : `http://${NETWORK_IP}:5000`;

export default API_BASE_URL;