import "./style.css";

// ---------- Page load entrance flag ----------
document.body.classList.add("loaded");

// ---------- Mobile nav toggle ----------
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");
const overlay = document.querySelector(".nav-overlay");

function closeNav() {
  nav?.classList.remove("open");
  overlay?.classList.remove("show");
}

toggle?.addEventListener("click", () => {
  nav?.classList.toggle("open");
  overlay?.classList.toggle("show");
});
overlay?.addEventListener("click", closeNav);
nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeNav));

// ---------- Active nav link ----------
const current = (location.pathname.split("/").pop() || "index.html") || "index.html";
document.querySelectorAll(".main-nav a[data-page]").forEach((a) => {
  if (a.dataset.page === current || (current === "" && a.dataset.page === "index.html")) {
    a.classList.add("active");
  }
});

// ---------- Sticky header shadow on scroll ----------
const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => {
  if (header) header.style.boxShadow = window.scrollY > 8
    ? "0 12px 30px -12px rgba(10,37,64,0.28)"
    : "0 4px 14px -6px rgba(18,60,105,0.15)";
});

// ---------- Reveal on scroll (with a light stagger inside grids) ----------
const revealEls = document.querySelectorAll(".reveal");

document.querySelectorAll(".grid").forEach((grid) => {
  Array.from(grid.children).forEach((child, i) => {
    if (child.classList.contains("reveal")) {
      child.style.transitionDelay = `${Math.min(i, 7) * 90}ms`;
    }
  });
});

if ("IntersectionObserver" in window && revealEls.length) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in-view"));
}

// ---------- Animated stat counters ----------
const statEls = document.querySelectorAll(".stat b[data-count]");
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const suffix = el.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target) + suffix;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.closest(".stat")?.classList.add("counted");
    }
  }
  requestAnimationFrame(tick);
}
if ("IntersectionObserver" in window && statEls.length) {
  const statIo = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.4 }
  );
  statEls.forEach((el) => statIo.observe(el));
}

// ---------- Scroll progress bar ----------
const progressBar = document.createElement("div");
progressBar.className = "scroll-progress";
document.body.appendChild(progressBar);
function updateProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  progressBar.style.width = pct + "%";
}
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// ---------- Back-to-top button ----------
const backToTop = document.createElement("button");
backToTop.className = "back-to-top";
backToTop.setAttribute("aria-label", "Back to top");
backToTop.innerHTML =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
document.body.appendChild(backToTop);
backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});
window.addEventListener(
  "scroll",
  () => {
    backToTop.classList.toggle("show", window.scrollY > 420);
  },
  { passive: true }
);

// ---------- Notice ticker: duplicate content for seamless loop ----------
const track = document.querySelector(".notice-track");
if (track && !track.dataset.doubled) {
  track.innerHTML += track.innerHTML;
  track.dataset.doubled = "true";
}

// ---------- Contact / Admission enquiry form (static demo) ----------
document.querySelectorAll("form[data-demo-form]").forEach((form) => {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const success = form.parentElement.querySelector(".form-success");
    if (success) success.classList.add("show");
    form.reset();
  });
});

// ---------- Photo lightbox (event gallery) ----------
const photoTiles = document.querySelectorAll(".photo-tile[data-full]");
if (photoTiles.length) {
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.innerHTML =
    '<button class="lightbox-close" aria-label="Close">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>' +
    "</button>" +
    '<img alt="" />' +
    '<div class="lightbox-cap"></div>';
  document.body.appendChild(lb);
  const lbImg = lb.querySelector("img");
  const lbCap = lb.querySelector(".lightbox-cap");

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbCap.textContent = caption || "";
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  photoTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      openLightbox(tile.dataset.full, tile.dataset.caption || "");
    });
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLightbox();
  });
  lb.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });
}

// ---------- Hero image auto-slider ----------
const heroSlider = document.getElementById("heroSlider");
if (heroSlider) {
  const slides = Array.from(heroSlider.querySelectorAll(".hero-slide"));
  const dots = Array.from(heroSlider.querySelectorAll(".hero-dot"));
  let current = 0;
  let timer = null;

  function goToSlide(index) {
    slides[current]?.classList.remove("active");
    dots[current]?.classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current]?.classList.add("active");
    dots[current]?.classList.add("active");
  }

  function nextSlide() {
    goToSlide(current + 1);
  }

  function startAutoSlide() {
    stopAutoSlide();
    timer = setInterval(nextSlide, 4200);
  }
  function stopAutoSlide() {
    if (timer) clearInterval(timer);
  }

  if (slides.length > 1) {
    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => {
        goToSlide(i);
        startAutoSlide();
      });
    });
    heroSlider.addEventListener("mouseenter", stopAutoSlide);
    heroSlider.addEventListener("mouseleave", startAutoSlide);
    startAutoSlide();
  }
}

// ---------- Footer year ----------
document.querySelectorAll("[data-year]").forEach((el) => {
  el.textContent = new Date().getFullYear();
});

// ---------- Toppers popup notice (home page only) ----------
const topperPopup = document.getElementById("topperPopup");
if (topperPopup) {
  const closePopup = () => topperPopup.classList.remove("show");
  let alreadyShown = false;
  try {
    alreadyShown = sessionStorage.getItem("hnuprTopperPopupShown") === "1";
  } catch (e) {
    alreadyShown = false;
  }
  if (!alreadyShown) {
    setTimeout(() => {
      topperPopup.classList.add("show");
      try {
        sessionStorage.setItem("hnuprTopperPopupShown", "1");
      } catch (e) {}
    }, 700);
  }
  document.getElementById("topperPopupClose")?.addEventListener("click", closePopup);
  topperPopup.addEventListener("click", (e) => {
    if (e.target === topperPopup) closePopup();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePopup();
  });
}
