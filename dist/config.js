'use strict';
// Public settings only. Never add private API keys or passwords here.
window.ARCLUME_CONFIG = Object.freeze({
  // Public inbox for the direct-email fallback.
  contactEmail: 'scalzmarketing@gmail.com',
  // Create a Formspree form and paste its public https://formspree.io/f/... endpoint.
  // Configure recipient, validation and spam filtering in the Formspree dashboard.
  inquiryEndpoint: '',
  // Complete HTTPS profile URLs; empty entries display "Coming soon".
  socials: Object.freeze({ instagram: '', facebook: '', linkedin: '' })
});
