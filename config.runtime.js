// config.runtime.js — COMMITTED intentionally.
//
// ¿Por qué este archivo está en git si tiene una API key?
// Esta clave NO es un secreto: es una clave pública anti-spam,
// igual que una clave de reCAPTCHA o Stripe publishable key.
// La seguridad real viene de:
//   1. Rate limiting en el backend (máx. N peticiones/IP/hora)
//   2. Honeypot field en cada formulario
//   3. Validación y sanitización en el servidor
//   4. (Futuro) Cloudflare Turnstile / reCAPTCHA en el frontend
//
// Si esta clave se rota, actualiza apiKey aquí y en el backend.

window.CRM_CONFIG = {
  apiUrl:  'https://crm-gym.onrender.com',
  apiKey:  'ea13fd276c1aa5d3f51dfe992c07af15'
  // CAPTCHA placeholder — habilitar cuando se integre Turnstile/reCAPTCHA:
  // captchaSiteKey: ''
};
