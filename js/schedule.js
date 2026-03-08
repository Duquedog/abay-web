// js/schedule.js — Connects ABAY website schedule to live CRM classes
// Fetches GET /api/public/classes for the current week and populates
// window.sched so the existing renderCls() renders real CRM data.

(function () {
  // Map JS UTC day index (0=Sun..6=Sat) to the website's day tab keys
  var DAY_KEYS = { 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie', 6: 'sab' };

  // Return YYYY-MM-DD string for the Monday of the current week (UTC)
  function getMondayOfCurrentWeek() {
    var d = new Date();
    var day = d.getUTCDay(); // 0=Sun, 1=Mon … 6=Sat
    var diff = (day === 0) ? -6 : 1 - day; // Monday is weekday 1
    var monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + diff));
    return monday.toISOString().slice(0, 10);
  }

  // Show a simple loading state in the class grid
  function showLoading() {
    var grid = document.getElementById('clsGrid');
    if (grid) {
      grid.innerHTML = '<div class="cls-card" style="opacity:.4;pointer-events:none">' +
        '<div class="cls-time">--:--</div>' +
        '<div class="cls-name">Cargando clases...</div>' +
        '</div>';
    }
  }

  // Fetch classes for the current Mon–Sat week and populate window.sched
  function loadWeekSchedule() {
    var config = window.CRM_CONFIG;
    if (!config || !config.apiUrl) return; // no config → keep hardcoded fallback

    var from = getMondayOfCurrentWeek();
    // to = Friday + 1 = Saturday (Mon+5)
    var toDate = new Date(from + 'T00:00:00.000Z');
    toDate.setUTCDate(toDate.getUTCDate() + 5);
    var to = toDate.toISOString().slice(0, 10);

    var url = config.apiUrl + '/api/public/classes?from=' + from + '&to=' + to;

    showLoading();

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        var classes = data.classes || [];

        // Group classes by day key; reset all 6 days first so empty days show nothing
        var newSched = { lun: [], mar: [], mie: [], jue: [], vie: [], sab: [] };

        classes.forEach(function (cls) {
          var dayIndex = new Date(cls.startTime).getUTCDay();
          var dayKey   = DAY_KEYS[dayIndex];
          if (!dayKey) return; // Sunday or unknown — skip

          newSched[dayKey].push({
            t:   cls.startTime.slice(11, 16),          // "HH:MM" from ISO UTC
            n:   cls.service.name,
            tr:  cls.staff.displayName,
            dur: cls.service.duration + ' min',
            sp:  0,   // spots taken (1:1 booking — no capacity concept yet)
            tot: 1,   // total spots
          });
        });

        // Sort each day by start time
        Object.keys(newSched).forEach(function (day) {
          newSched[day].sort(function (a, b) { return a.t.localeCompare(b.t); });
        });

        // Replace the hardcoded schedule with live data
        Object.assign(window.sched, newSched);

        // Re-render the currently active day tab
        if (typeof renderCls === 'function' && typeof diaActual !== 'undefined') {
          renderCls(diaActual);
        }
      })
      .catch(function (err) {
        console.warn('[Schedule] Failed to fetch CRM classes:', err.message);
        // Fallback: keep window.sched as-is (hardcoded placeholder data)
        if (typeof renderCls === 'function' && typeof diaActual !== 'undefined') {
          renderCls(diaActual);
        }
      });
  }

  document.addEventListener('DOMContentLoaded', loadWeekSchedule);
})();
