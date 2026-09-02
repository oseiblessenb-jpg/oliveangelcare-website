/* Mobile nav toggle + Netlify form submission (AJAX, with no-JS fallback to the form's action page). */
document.addEventListener('DOMContentLoaded', function () {
  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Forms are wired to Netlify Forms. We submit via fetch so the visitor sees an
  // inline confirmation without a page reload. If the request fails, we fall back
  // to a normal submit (which redirects to the form's action / thank-you page).
  // NOTE: these forms collect non-clinical contact info only — no PHI by design.
  document.querySelectorAll('form[data-netlify]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.dataset.label = btn.textContent; btn.disabled = true; btn.textContent = 'Sending…'; }
      var action = form.getAttribute('action') || '/';
      fetch(action, { method: 'POST', body: new FormData(form) })
        .then(function (r) {
          if (!r.ok) throw new Error('Network response was not ok');
          var note = form.querySelector('.form-ack');
          form.reset();
          if (note) { note.hidden = false; note.focus(); note.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
          form.querySelectorAll('input,select,textarea').forEach(function (el) { el.blur(); });
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
        })
        .catch(function () {
          // Graceful fallback: let the browser submit normally to the action page.
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; }
          form.submit();
        });
    });
  });
});
