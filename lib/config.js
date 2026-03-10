// lib/config.js
const CONFIG = {
//   API_BASE_URL: 'https://naijatrips-app-dcarbon-server.cafyit.easypanel.host',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://naijatrips-app-dcarbon-server.cafyit.easypanel.host',
};

export default CONFIG;
