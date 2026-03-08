// config.runtime.js — committed runtime config for deployed website
//
// SECURITY NOTE: The apiKey below is intentionally public.
// It is NOT a user password or private secret.
// Its only purpose is anti-spam (rate limiting on the CRM backend).
// Security relies on: rate limiting + honeypot field (+ optional Turnstile/reCAPTCHA later).
// Never put a private admin secret or database credential here.

window.CRM_CONFIG = {
  apiUrl: 'https://crm-gym.onrender.com',
  apiKey: 'ea13fd276c1aa5d3f51dfe992c07af15'
};
