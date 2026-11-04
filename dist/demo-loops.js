/* Start only visible demos; keep user pauses and reduced motion authoritative. */
(() => {
  const motion = matchMedia("(prefers-reduced-motion: reduce)");
  const demos = [...document.querySelectorAll("video[data-demo]")];
  const states = new Map();
  function sync(video) {
    const state = states.get(video);
    const play = state.visible && !state.paused && !motion.matches && !document.hidden;
    if (play) video.play().catch(() => { video.controls = true; });
    else video.pause();
    state.button.textContent = state.paused || motion.matches ? "Play preview" : "Pause preview";
    state.button.setAttribute("aria-label", (state.paused || motion.matches ? "Play" : "Pause") + " " + state.name + " preview");
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
    const name = video.closest("article").querySelector("h2").textContent;
    states.set(video, {visible: false, paused: false, button, name});
    video.insertAdjacentElement("afterend", button);
    button.addEventListener("click", () => {
      const state = states.get(video);
      if (motion.matches) { video.controls = true; if (video.paused) video.play().catch(() => {}); else video.pause(); return; }
      state.paused = !state.paused;
      sync(video);
    });
    sync(video);
    observer.observe(video);
  });
  motion.addEventListener("change", () => demos.forEach(sync));
  document.addEventListener("visibilitychange", () => demos.forEach(sync));
})();
