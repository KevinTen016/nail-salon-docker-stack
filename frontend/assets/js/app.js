// assets/js/app.js

(() => {
  const root = document.documentElement;
  const storageKey = "elan_theme";

  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => Array.from(el.querySelectorAll(s));

  function setTheme(theme, persist = true) {
    if (theme === "dark") root.setAttribute("data-theme", "dark");
    else root.removeAttribute("data-theme");

    if (persist) localStorage.setItem(storageKey, theme);
    updateThemeUI(theme);
  }

  function getPreferredTheme() {
    const saved = localStorage.getItem(storageKey);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function updateThemeUI(theme) {
    const btn = qs("[data-theme-toggle]");
    if (!btn) return;

    const isDark = theme === "dark";
    btn.setAttribute("aria-pressed", String(isDark));
    btn.setAttribute("data-state", isDark ? "dark" : "light");

    const label = btn.getAttribute("data-label") || "Theme";
    btn.setAttribute("aria-label", `${label}: ${isDark ? "Dark" : "Light"}`);
  }

  function bindThemeToggle() {
    const btn = qs("[data-theme-toggle]");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  function setupCarousel(carousel) {
    const track = qs("[data-track]", carousel);
    const btnPrev = qs("[data-prev]", carousel);
    const btnNext = qs("[data-next]", carousel);
    const dotsWrap = qs("[data-dots]", carousel);

    if (!track) return;

    const slides = qsa(".carousel__slide", track);
    if (!slides.length) return;

    let index = 0;

    function slideWidth() {
      const first = slides[0];
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      return first.getBoundingClientRect().width + gap;
    }

    function clamp(i) {
      return Math.max(0, Math.min(i, slides.length - 1));
    }

    function render() {
      const w = slideWidth();
      track.style.transform = `translateX(${-(index * w)}px)`;

      if (dotsWrap) {
        qsa("button", dotsWrap).forEach((b, i) => {
          if (i === index) b.setAttribute("aria-current", "true");
          else b.removeAttribute("aria-current");
        });
      }

      if (btnPrev) btnPrev.disabled = index === 0;
      if (btnNext) btnNext.disabled = index === slides.length - 1;
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = "";

      slides.forEach((_, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", `Slide ${i + 1}`);
        b.addEventListener("click", () => {
          index = i;
          render();
        });
        dotsWrap.appendChild(b);
      });
    }

    function next() {
      index = clamp(index + 1);
      render();
    }

    function prev() {
      index = clamp(index - 1);
      render();
    }

    if (btnNext) btnNext.addEventListener("click", next);
    if (btnPrev) btnPrev.addEventListener("click", prev);

    let startX = 0;
    let dragging = false;

    track.addEventListener("pointerdown", (e) => {
      dragging = true;
      startX = e.clientX;
      track.setPointerCapture(e.pointerId);
    });

    track.addEventListener("pointerup", (e) => {
      if (!dragging) return;
      dragging = false;

      const dx = e.clientX - startX;
      const threshold = Math.min(80, slideWidth() * 0.18);

      if (dx < -threshold) next();
      else if (dx > threshold) prev();
    });

    track.addEventListener("pointercancel", () => {
      dragging = false;
    });

    buildDots();
    render();

    let raf = 0;
    window.addEventListener("resize", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(render);
    });
  }

  function bindBookingForm() {
    const form = qs("#bookingForm");
    const status = qs("#status");
    if (!form) return;

    function setStatus(msg) {
      if (status) status.textContent = msg || "";
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const phone = String(data.get("phone") || "").trim();
      const service = String(data.get("service") || "").trim();
      const when = String(data.get("when") || "").trim();
      const message = String(data.get("message") || "").trim();

      if (!name || !phone || !service) {
        setStatus("Bitte Name, Telefon und Leistung ausfüllen.");
        return;
      }

      const lines = [
        `Name: ${name}`,
        `Telefon: ${phone}`,
        `Leistung: ${service}`,
        when ? `Wunschzeit: ${when}` : null,
        message ? `Nachricht: ${message}` : null
      ].filter(Boolean);

      const text = encodeURIComponent(lines.join("\n"));
      const wa = form.getAttribute("data-wa") || "4900000000";
      const url = `https://wa.me/${wa}?text=${text}`;

      setStatus("Weiterleitung zu WhatsApp …");
      window.open(url, "_blank", "noopener,noreferrer");
      form.reset();
      setTimeout(() => setStatus(""), 3000);
    });
  }

  function setYear() {
    const el = qs("#year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTheme(getPreferredTheme(), false);
    bindThemeToggle();

    qsa("[data-carousel]").forEach(setupCarousel);

    bindBookingForm();
    setYear();
  });
})();
