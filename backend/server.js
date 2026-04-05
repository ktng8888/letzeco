const app = require('./src/app');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

//localhost
/*
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
*/

//listen on all network
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Network: http://10.58.71.170:${PORT}`); //mobile hotspot
  console.log(`Network: http://192.168.0.50:${PORT}`); //D1002 unifi
  console.log(`Network: http://10.121.33.212:${PORT}`); //eBfi@MMU
  console.log(`Network: http://10.143.15.170:${PORT}`); //Hospot (in MMU)
});