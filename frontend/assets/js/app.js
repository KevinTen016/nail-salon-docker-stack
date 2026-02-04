(() => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  const form = document.getElementById("bookingForm");
  const status = document.getElementById("status");

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const data = new FormData(form);
      const payload = {
        name: String(data.get("name") || "").trim(),
        phone: String(data.get("phone") || "").trim(),
        service: String(data.get("service") || "").trim(),
        when: String(data.get("when") || "").trim(),
        message: String(data.get("message") || "").trim(),
      };

      if (!payload.name || !payload.phone || !payload.service) {
        if (status) status.textContent = "Bitte füllen Sie Name, Telefon und Leistung aus.";
        return;
      }

      const to = "hello@elan-nagelstudio.de";
      const subject = encodeURIComponent(`Termin Anfrage – ${payload.service}`);
      const body = encodeURIComponent(
        [
          `Name: ${payload.name}`,
          `Telefon: ${payload.phone}`,
          `Leistung: ${payload.service}`,
          `Wunschzeit: ${payload.when}`,
          "",
          payload.message,
          "",
          "Eiderstraße 16, 38120 Braunschweig",
        ].join("\n")
      );

      if (status) status.textContent = "Vielen Dank. Ihre Anfrage wird geöffnet.";
      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    });
  }

  const root = document.querySelector("[data-carousel]");
  if (root) setupCarousel(root);

  function setupCarousel(rootEl) {
    const track = rootEl.querySelector("[data-track]");
    const prev = rootEl.querySelector("[data-prev]");
    const next = rootEl.querySelector("[data-next]");
    const dotsWrap = rootEl.querySelector("[data-dots]");
    const slides = Array.from(rootEl.querySelectorAll(".carousel__slide"));

    if (!track || slides.length === 0) return;

    const dots = slides.map((_, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "carousel__dot" + (i === 0 ? " is-active" : "");
      b.setAttribute("aria-label", `Bild ${i + 1}`);
      b.addEventListener("click", () => scrollToIndex(i));
      dotsWrap?.appendChild(b);
      return b;
    });

    const updateActive = () => {
      const center = track.scrollLeft + track.clientWidth / 2;
      let active = 0;

      for (let i = 0; i < slides.length; i++) {
        const el = slides[i];
        const left = el.offsetLeft;
        const right = left + el.offsetWidth;
        if (center >= left && center <= right) {
          active = i;
          break;
        }
      }

      dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
    };

    const step = () => {
      const slide = slides[0];
      const gap = 12;
      return slide.offsetWidth + gap;
    };

    const scrollByStep = (dir) => {
      track.scrollBy({ left: dir * step(), behavior: "smooth" });
    };

    const scrollToIndex = (i) => {
      const target = slides[i];
      if (!target) return;
      track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    };

    prev?.addEventListener("click", () => scrollByStep(-1));
    next?.addEventListener("click", () => scrollByStep(1));

    track.addEventListener("scroll", () => window.requestAnimationFrame(updateActive));
    window.addEventListener("resize", updateActive);

    updateActive();
  }
})();
