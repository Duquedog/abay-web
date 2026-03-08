// js/crm.js — CRM integration for ABAY Centro Multidisciplinar

(function () {
  // ── Helpers ──────────────────────────────────────────────────────────────

  function cfg() {
    if (!window.CRM_CONFIG) throw new Error('config.js not loaded');
    return window.CRM_CONFIG;
  }

  function apiBase() {
    return cfg().apiUrl + '/api/website-public';
  }

  function setFeedback(el, type, msg) {
    el.className = 'form-feedback form-feedback--' + type;
    el.textContent = msg;
  }

  function setLoading(btn, isLoading) {
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Enviando...' : btn.dataset.label;
  }

  async function postCRM(path, body) {
    var url = apiBase() + path;
    var apiKey = cfg().apiKey;
    var res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      var rawText = await res.text().catch(function () { return ''; });
      var errBody = {};
      try { errBody = JSON.parse(rawText); } catch (_) {}
      var detail = errBody.error || errBody.message || rawText || 'Sin detalle';
      // Safe debug — no apiKey logged
      console.warn('[CRM] POST ' + url + ' → HTTP ' + res.status);
      console.warn('[CRM] Response body:', detail);
      throw new Error('Error (' + res.status + '): ' + detail);
    }
    return res.json();
  }

  // Optional: load services dynamically if GET /api/website-public/services exists
  async function tryLoadServices(selectEl) {
    try {
      const { apiKey } = cfg();
      const res = await fetch(apiBase() + '/services', {
        headers: { 'x-api-key': apiKey }
      });
      if (!res.ok) return; // silently skip — use static fallback
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return;
      selectEl.innerHTML = '<option value="">Selecciona un servicio...</option>';
      data.forEach(function (s) {
        var opt = document.createElement('option');
        opt.value = s.code || s.id;
        opt.textContent = s.name || s.label;
        selectEl.appendChild(opt);
      });
    } catch (_) { /* keep static fallback */ }
  }

  // ── Form 1: Lead / Contact ────────────────────────────────────────────────

  function initLeadForm() {
    var form = document.getElementById('leadForm');
    if (!form) return;
    var btn = document.getElementById('lf-submit');
    btn.dataset.label = btn.textContent;
    var feedback = document.getElementById('leadForm-feedback');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      feedback.className = 'form-feedback';
      feedback.textContent = '';

      var name = document.getElementById('lf-name').value.trim();
      var email = document.getElementById('lf-email').value.trim();
      var phone = document.getElementById('lf-phone').value.trim();
      var message = document.getElementById('lf-message').value.trim();
      var serviceInterest = document.getElementById('lf-service').value;
      var company = document.getElementById('lf-company').value; // honeypot

      if (!name) {
        setFeedback(feedback, 'error', 'Por favor, introduce tu nombre.');
        return;
      }
      if (!email && !phone) {
        setFeedback(feedback, 'error', 'Introduce un email o teléfono de contacto.');
        return;
      }

      setLoading(btn, true);
      try {
        await postCRM('/leads', {
          name: name,
          email: email,
          phone: phone,
          message: message,
          source: 'website',
          serviceInterest: serviceInterest,
          company: company
        });
        setFeedback(feedback, 'success', '¡Gracias! Nos pondremos en contacto contigo pronto.');
        form.reset();
      } catch (err) {
        var msg = (err instanceof TypeError)
          ? 'No se pudo conectar con el servidor. Posible bloqueo CORS o red.'
          : (err.message || 'Error desconocido');
        console.warn('[CRM] Lead form error:', msg);
        setFeedback(feedback, 'error', msg);
      } finally {
        setLoading(btn, false);
      }
    });
  }

  // ── Form 2: Booking Request ───────────────────────────────────────────────

  function initBookingForm() {
    var form = document.getElementById('bookingForm');
    if (!form) return;
    var btn = document.getElementById('bf-submit');
    btn.dataset.label = btn.textContent;
    var feedback = document.getElementById('bookingForm-feedback');

    tryLoadServices(document.getElementById('bf-service'));

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      feedback.className = 'form-feedback';
      feedback.textContent = '';

      var name = document.getElementById('bf-name').value.trim();
      var email = document.getElementById('bf-email').value.trim();
      var phone = document.getElementById('bf-phone').value.trim();
      var serviceType = document.getElementById('bf-service').value;
      var preferredDate = document.getElementById('bf-date').value;
      var preferredTime = document.getElementById('bf-time').value;
      var groupSize = document.getElementById('bf-group').value;
      var message = document.getElementById('bf-message').value.trim();
      var company = document.getElementById('bf-company').value; // honeypot

      if (!name) {
        setFeedback(feedback, 'error', 'Por favor, introduce tu nombre.');
        return;
      }
      if (!email && !phone) {
        setFeedback(feedback, 'error', 'Introduce un email o teléfono de contacto.');
        return;
      }
      if (!serviceType) {
        setFeedback(feedback, 'error', 'Selecciona un servicio.');
        return;
      }

      setLoading(btn, true);
      try {
        await postCRM('/booking-requests', {
          name: name,
          email: email,
          phone: phone,
          serviceType: serviceType,
          preferredDate: preferredDate || undefined,
          preferredTime: preferredTime || undefined,
          groupSize: groupSize ? Number(groupSize) : undefined,
          message: message,
          company: company
        });
        setFeedback(feedback, 'success', '¡Solicitud enviada! Te contactaremos para confirmar la cita.');
        form.reset();
        setTimeout(closeBookingModal, 3000);
      } catch (err) {
        var msg = (err instanceof TypeError)
          ? 'No se pudo conectar con el servidor. Posible bloqueo CORS o red.'
          : (err.message || 'Error desconocido');
        console.warn('[CRM] Booking form error:', msg);
        setFeedback(feedback, 'error', msg);
      } finally {
        setLoading(btn, false);
      }
    });
  }

  // ── Booking Modal ─────────────────────────────────────────────────────────

  function openBookingModal(servicePreset) {
    var modal = document.getElementById('bookingModal');
    if (!modal) return;
    if (servicePreset) {
      var sel = document.getElementById('bf-service');
      if (sel) sel.value = servicePreset;
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeBookingModal() {
    var modal = document.getElementById('bookingModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Expose to global scope so onclick="" attributes work
  window.openBookingModal = openBookingModal;
  window.closeBookingModal = closeBookingModal;

  // ── Init ──────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    initLeadForm();
    initBookingForm();

    var closeBtn = document.getElementById('bookingModalClose');
    if (closeBtn) closeBtn.addEventListener('click', closeBookingModal);

    var modal = document.getElementById('bookingModal');
    if (modal) {
      modal.addEventListener('click', function (e) {
        if (e.target === modal) closeBookingModal();
      });
    }
  });
})();
