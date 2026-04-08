// lib/config.js
const CONFIG = {
//   API_BASE_URL: 'https://api.dev.dcarbon.solutions',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://dcarbon-staging-apps-backend-server.so0y9w.easypanel.host',
};

export default CONFIG;
