// lib/config.js
const CONFIG = {
//   API_BASE_URL: 'https://app.dev.dcarbon.solutions',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://app.dev.dcarbon.solutions',
};

export default CONFIG;
