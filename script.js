const nav = document.getElementById("nav");
const progress = document.getElementById("progress");
const menuBtn = document.getElementById("menuBtn");
const menu = document.getElementById("menu");

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function onScroll() {
  const scrolled = window.scrollY > 8;
  nav.classList.toggle("scrolled", scrolled);
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = height > 0 ? window.scrollY / height : 0;
  progress.style.width = `${Math.min(100, ratio * 100)}%`;
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

menuBtn.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", String(open));
});

menu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  });
});

const sections = [...document.querySelectorAll("main section[id]")];
const links = [...menu.querySelectorAll("a")];

const spy = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);
sections.forEach((section) => spy.observe(section));

const reveals = [...document.querySelectorAll(".reveal")];

function showReveal(el) {
  if (el.classList.contains("in")) return;
  el.classList.add("in");
}

if (reduced) {
  reveals.forEach(showReveal);
} else {
  reveals.forEach((el, i) => {
    el.style.animationDelay = `${Math.min(i % 4, 3) * 0.08}s`;
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        showReveal(entry.target);
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
  );
  reveals.forEach((el) => io.observe(el));

  function revealVisible() {
    reveals.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.92 && rect.bottom > 40) showReveal(el);
    });
  }

  window.addEventListener("scroll", revealVisible, { passive: true });
  window.addEventListener("resize", revealVisible);
  revealVisible();
}

function animateCount(el) {
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const decimals = Number(el.dataset.decimals || 0);
  const node = el.querySelector(".num");
  if (reduced) {
    node.textContent = target.toFixed(decimals) + suffix;
    return;
  }
  const start = performance.now();
  const duration = 1200;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = target * eased;
    node.textContent = value.toFixed(decimals) + (t === 1 ? suffix : "");
    if (t < 1) requestAnimationFrame(frame);
    else node.textContent = target.toFixed(decimals) + suffix;
  }
  requestAnimationFrame(frame);
}

const stats = document.querySelectorAll(".stat");
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCount(entry.target);
      statObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);
stats.forEach((stat) => statObserver.observe(stat));
