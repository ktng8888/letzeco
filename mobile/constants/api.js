/*
// Change this to your computer's IP address
// Find it by running: ipconfig (Windows) or ifconfig (Mac)
// Must use IP not localhost — phone can't reach localhost
//Use same WIFI for both computer and phone

// Example: 'http://192.168.1.5:5000/api'
 
//Laptop 
//const API_BASE_URL = 'http://10.100.100.34:5000/api';
//export const BASE_URL = 'http://10.100.100.34:5000';

//D1002 unifi

const API_BASE_URL = 'http://192.168.0.50/api';
export const BASE_URL = 'http://192.168.0.50:5000';

//mobile hotspot
/*
const API_BASE_URL = 'http://10.58.71.170:5000/api';
export const BASE_URL = 'http://10.58.71.170:5000';


export default API_BASE_URL;
*/

import { Platform } from 'react-native';

// D1002 unifi
const UNIFI_IP = '192.168.0.50';

// Mobile hotspot
const HOTSPOT_IP = '10.58.71.170';

// Laptop
const LAPTOP_IP = '10.100.100.34';

// eBfi@MMU
const MMU_IP = '10.121.33.212';

//Hotspot (in MMU)
const MMU_HOTSPOT_IP = '10.143.15.170';

// Change this to switch networks
const NETWORK_IP = MMU_HOTSPOT_IP;

const API_BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000/api'
  : `http://${NETWORK_IP}:5000/api`;

export const BASE_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'
  : `http://${NETWORK_IP}:5000`;

export default API_BASE_URL;