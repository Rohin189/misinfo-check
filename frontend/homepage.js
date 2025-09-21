// main.js
gsap.registerPlugin(ScrollTrigger);

/* ===== Intro: shackle open once per session, then reveal hero ===== */
function runIntroOnce() {
  const svg = document.getElementById("heroLock");
  const shackle = svg?.querySelector("#shackle");
  const heroContent = document.getElementById("heroContent");
  if (!svg || !shackle || !heroContent) { startPageAnimations(); return; }

  if (sessionStorage.getItem("introPlayed") === "1") {
    gsap.set(heroContent, { opacity: 1, clearProps: "pointerEvents" });
    svg.remove();
    startPageAnimations();
    return;
  }

  gsap.set(shackle, { autoAlpha: 0 });
  gsap.set(heroContent, { opacity: 0, pointerEvents: "none" });

  const L = 2 * Math.PI * 40 * 0.6;
  gsap.set(shackle, { strokeDasharray: L, strokeDashoffset: 0, autoAlpha: 1 });

  const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
  tl.to(shackle, { strokeDashoffset: L * 0.35, duration: 1.2 }, 0)
    .to("#heroLock", { opacity: 0.65, duration: 0.2 }, 0.9)
    .set([".hero-line", ".hero-cta"], { y: 24, autoAlpha: 0 }, 1.0)
    .set(".panel", { y: 24, autoAlpha: 0, scale: 0.98 }, 1.0)
    .set(".chip", { y: 16, autoAlpha: 0 }, 1.0)
    .to(heroContent, { opacity: 1, duration: 0.25, onStart: () => heroContent.classList.remove("pointer-events-none") }, 1.6)
    .to([".hero-line", ".hero-cta"], { y: 0, autoAlpha: 1, duration: 1.0, ease: "power3.out", stagger: 0.12 }, 1.65)
    .to(".panel", { y: 0, autoAlpha: 1, scale: 1, duration: 1.0, ease: "power3.out" }, 1.7)
    .to(".chip", { y: 0, autoAlpha: 1, duration: 0.9, ease: "power2.out", stagger: { each: 0.06, from: "start" } }, 1.75)
    .to("#heroLock", { opacity: 0, scale: 1.02, filter: "blur(2px)", duration: 0.35, ease: "power1.out", onComplete: () => svg.remove() }, 1.95)
    .add(() => { sessionStorage.setItem("introPlayed","1"); startPageAnimations(); }, 2.1);
}

/* ===== Page animations ===== */
function startPageAnimations() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  gsap.to("#hero .bg-gradient-to-r", {
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: 0.6 },
    x: 80
  });

  if (reduced) {
    gsap.set(
      [".hero-line", ".hero-cta", ".chip", ".log", ".stat", ".tip-card-rb", ".feed-item", ".lb-item", ".section-title", ".panel"],
      { autoAlpha: 1, x: 0, y: 0, scale: 1 }
    );
    return;
  }

  gsap.utils.toArray(".section-title").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 80%" },
      y: 24, autoAlpha: 0, duration: 0.8, ease: "power2.out"
    });
  });

  gsap.from(".tip-card-rb", {
    scrollTrigger: { trigger: "#tips", start: "top 75%" },
    y: 24, autoAlpha: 0, duration: 0.7, stagger: { each: 0.1, from: "start" }, ease: "power2.out"
  });

  gsap.from(".feed-item", {
    scrollTrigger: { trigger: ".feed", start: "top 80%" },
    x: -24, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: "power2.out"
  });

  gsap.from(".lb-item", {
    scrollTrigger: { trigger: ".leaderboard", start: "top 85%" },
    x: 24, autoAlpha: 0, duration: 0.6, stagger: 0.12, ease: "power2.out"
  });

  gsap.from(".stat", {
    scrollTrigger: { trigger: ".panel", start: "bottom 85%" },
    scale: 0.9, autoAlpha: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.6)"
  });
}

/* ===== Verification Console (text-only) + CTA behavior ===== */
function setupConsoleAndCTAs() {
  const textField = document.getElementById("verifyText");
  const btnVerify = document.getElementById("btnVerify");
  const resultBar = document.getElementById("resultBar");
  const resultGauge = document.getElementById("resultGauge");
  const resultPercent = document.getElementById("resultPercent");
  const resultLog = document.getElementById("resultLog");

  function showResult(p){
    resultBar?.classList.remove("hidden");
    if (resultGauge) resultGauge.style.width = `${p}%`;
    if (resultPercent) resultPercent.textContent = `${p}%`;
    if (resultLog) {
      resultLog.innerHTML = `
        <div class="text-emerald-300">✓ Likely true: coherent claims and cited context</div>
        <div class="text-yellow-300">~ Needs context: some ambiguous or missing sources</div>
        <div class="text-rose-300">✗ Possible false/misleading: flagged patterns</div>
      `;
    }
  }

  function scoreText(t){
    if (!t) return 5;
    const base = 50 + Math.min(40, Math.floor((t.length/300)*25));
    return Math.max(5, Math.min(95, base));
  }

  btnVerify?.addEventListener("click", () => {
    const t = (textField?.value || "").trim();
    showResult(scoreText(t));
  });

  // Keyboard shortcut: Ctrl/Cmd + Enter to verify
  textField?.addEventListener("keydown", (e) => {
    const cmd = e.metaKey || e.ctrlKey;
    if (cmd && e.key === "Enter") {
      e.preventDefault();
      btnVerify?.click();
    }
  });

  // CTAs
  const ctaStart = document.getElementById("ctaStart");
  const ctaLearn = document.getElementById("ctaLearn");

  ctaStart?.addEventListener("click", (e) => {
    e.preventDefault();
    const panel = document.querySelector("#hero .panel");
    panel?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Focus textarea shortly after scroll to ensure visibility
    setTimeout(() => textField?.focus({ preventScroll: true }), 350);
  });

  ctaLearn?.addEventListener("click", (e) => {
    const target = document.getElementById("tips");
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

window.addEventListener("load", () => {
  runIntroOnce();
  setupConsoleAndCTAs();
  ScrollTrigger.refresh();
});
