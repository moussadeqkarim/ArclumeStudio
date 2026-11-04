/* Local GSAP core; no video downloads, scroll hijacking, or layout animation. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-motion-studio]').forEach(studio => {
    const scenes = [...studio.querySelectorAll('.motion-scene')];
    const selectors = [...studio.querySelectorAll('.motion-select')];
    const pause = studio.querySelector('.motion-pause');
    const canvas = studio.querySelector('.motion-canvas');
    let current = 0, wanted = !reduce.matches, visible = false, started = false, timer, animation;
    function schedule() {
      clearTimeout(timer);
      if (wanted && visible && !document.hidden && !reduce.matches) timer = setTimeout(() => select((current + 1) % scenes.length), 6500);
    }
    function label() {
      pause.hidden = reduce.matches;
      pause.textContent = wanted ? 'Pause motion' : 'Play motion';
      pause.setAttribute('aria-pressed', String(!wanted));
    }
    function enter(scene) {
      if (!window.gsap || reduce.matches) return;
      const art = scene.querySelector('.motion-art');
      const parts = [...art.children];
      animation = gsap.timeline({defaults:{ease:'power3.out'},onComplete:schedule});
      animation.fromTo(scene.querySelector('.motion-copy'), {autoAlpha:0,y:12}, {autoAlpha:1,y:0,duration:.65}, 0);
      if (scene.dataset.scene === 'content') {
        animation.fromTo(parts, {autoAlpha:0,x:i=>[85,0,-65][i],y:12,rotation:0,scale:.94}, {autoAlpha:1,x:0,y:0,rotation:i=>[-8,2,8][i],scale:1,duration:1.15,stagger:.12}, .12);
      } else animation.fromTo(parts, {autoAlpha:0,y:22,scale:.97}, {autoAlpha:1,y:0,scale:1,duration:1,stagger:.12}, .12);
      if (scene.dataset.scene === 'web') {
        animation.fromTo(scene.querySelector('.browser-headline'), {y:18,autoAlpha:0}, {y:0,autoAlpha:1,duration:.8}, .4);
        animation.fromTo(scene.querySelector('.browser-swatch'), {scaleY:0,transformOrigin:'bottom'}, {scaleY:1,duration:1}, .25);
      }
    }
    function select(index, manual = false) {
      if (manual) { wanted = false; label(); }
      clearTimeout(timer);
      animation?.progress(1).kill();
      // Reset interrupted tweens before hiding; every state remains fully readable.
      if (window.gsap) gsap.set(studio.querySelectorAll('.motion-copy,.motion-art>*,.browser-headline,.browser-swatch'), {clearProps:'opacity,visibility,transform,transformOrigin'});
      scenes.forEach((scene,i) => { scene.hidden = i !== index; });
      selectors.forEach((button,i) => button.setAttribute('aria-pressed',String(i === index)));
      current = index;
      enter(scenes[index]);
      schedule();
    }
    selectors.forEach((button,index) => button.addEventListener('click',() => select(index,true)));
    pause.addEventListener('click',() => { wanted = !wanted; label(); if (!wanted) animation?.progress(1).kill(); schedule(); });
    // Focusing content stops rotation so links cannot disappear under the user.
    canvas.addEventListener('focusin',() => { wanted = false; label(); schedule(); });
    document.addEventListener('visibilitychange',() => { if(document.hidden) animation?.pause(); else animation?.resume(); schedule(); });
    reduce.addEventListener('change',() => { wanted = false; animation?.progress(1).kill(); label(); schedule(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible && !started) { started = true; enter(scenes[current]); }
      else if (visible) animation?.resume();
      else animation?.pause();
      schedule();
    },{threshold:.2}).observe(studio);
    else visible = true;
    studio.classList.add('is-enhanced');
    label(); schedule();
  });
})();
