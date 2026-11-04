/* Lazy-load a suitable encode; only visible previews may play. */
(() => {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const connection = navigator.connection;
  const demos = [...document.querySelectorAll("video[data-demo]")];
  const states = new Map();
  function load(video) {
    if (video.dataset.loaded) return;
    const pixels = Math.min(innerWidth, 820) * Math.min(devicePixelRatio || 1, 2);
    const small = connection?.saveData || (innerWidth <= 760 && pixels <= 864);
    video.src = small ? video.dataset.mobile : video.dataset.src;
    video.dataset.loaded = "true";
    video.load();
  }
  function label(video) {
    const state = states.get(video);
    state.button.textContent = video.paused ? "Play preview" : "Pause preview";
    state.button.setAttribute("aria-label", (video.paused ? "Play " : "Pause ") + state.name + " preview");
    state.button.setAttribute("aria-pressed", String(!video.paused));
  }
  function sync(video) {
    const state = states.get(video);
    if (!state.visible || document.hidden || !state.wanted) { video.pause(); label(video); return; }
    load(video);
    video.play().catch(() => { state.wanted = false; video.controls = true; label(video); });
  }
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    states.get(entry.target).visible = entry.isIntersecting;
    sync(entry.target);
  }), {threshold: .15});
  demos.forEach(video => {
    video.muted = true;
    video.loop = true;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preview-toggle";
    const name = video.dataset.demoName || video.closest("article").querySelector("h2").textContent;
    states.set(video, {visible:false, wanted:!motion.matches && !connection?.saveData, button, name});
    video.insertAdjacentElement("afterend", button);
    button.addEventListener("click", () => {
      states.get(video).wanted = video.paused;
      sync(video);
    });
    video.addEventListener("play", () => label(video));
    video.addEventListener("pause", () => label(video));
    video.addEventListener("error", () => { button.textContent = "Retry preview"; });
    label(video);
    observer.observe(video);
  });
  motion.addEventListener("change", () => demos.forEach(video => {
    states.get(video).wanted = !motion.matches && !connection?.saveData;
    sync(video);
  }));
  document.addEventListener("visibilitychange", () => demos.forEach(sync));
})();
