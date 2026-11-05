/* A single playback state drives GSAP, WebGL and the fallback. No timers. */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function sculptureState(host, playing) {
    host.dataset.playing = String(playing);
    host.dispatchEvent(new CustomEvent('sculpture-state',{detail:{playing}}));
  }
  function playback(root, button, update) {
    let wanted = !reduced.matches, visible = false;
    function sync() {
      const running = wanted && visible && !document.hidden && !reduced.matches;
      root.dataset.playing = String(running);
      button.hidden = reduced.matches;
      button.textContent = wanted ? 'Pause motion' : 'Play motion';
      button.setAttribute('aria-pressed',String(!wanted));
      update(running);
    }
    button.addEventListener('click',() => { wanted = !wanted; sync(); });
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',() => { wanted = !reduced.matches; sync(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => {visible=entries[0].isIntersecting;sync();},{threshold:.08}).observe(root);
    else visible = true;
    sync();return sync;
  }
  document.querySelectorAll('[data-motion-studio]').forEach(studio => {
    const scenes = [...studio.querySelectorAll('.motion-scene')];
    const buttons = [...studio.querySelectorAll('.motion-select')];
    let current = 0, loop;
    function buildLoop() {
      loop?.kill();
      if (!window.gsap) return;
      const scene = scenes[current];
      loop = gsap.timeline({paused:true,repeat:-1,yoyo:true,defaults:{duration:3.6,ease:'sine.inOut'}});
      if(scene.dataset.scene === 'campaign') {
        loop.fromTo(scene.querySelector('.campaign-poster'),{rotationY:-16,rotationX:8,rotationZ:-3,y:7},{rotationY:14,rotationX:-6,rotationZ:3,y:-9},0);
      } else if(scene.dataset.scene === 'content') {
        loop.fromTo(scene.querySelectorAll('.content-format'),{rotationY:-14,rotationX:5,z:i=>i*28,y:10},{rotationY:13,rotationX:-5,z:i=>i*28+20,y:-10,stagger:.2},0);
      }
    }
    buildLoop();
    const sync = playback(studio,studio.querySelector('.motion-pause'),running => {
      loop?.paused(!running);
      studio.querySelectorAll('[data-sculpture]').forEach(host => sculptureState(host,running && host.closest('.motion-scene') === scenes[current]));
    });
    buttons.forEach((button,index) => button.addEventListener('click',() => {
      if(index===current)return;
      scenes.forEach((scene,i)=>{scene.hidden=i!==index;});
      buttons.forEach((tab,i)=>tab.setAttribute('aria-pressed',String(i===index)));
      current=index;buildLoop();sync();
    }));
    studio.classList.add('is-enhanced');
  });
  document.querySelectorAll('[data-work-motion]').forEach(work => {
    playback(work,work.querySelector('.work-motion-pause'),running => sculptureState(work.querySelector('[data-sculpture]'),running));
  });
  const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for(const entry of entries)if(entry.isIntersecting){mount(entry.target);observer.unobserve(entry.target);}
  },{rootMargin:'100px'}) : null;
  async function mount(host) {
    if(host.dataset.mounted)return;host.dataset.mounted='true';
    try {
      const {createSculpture}=await import('./sculpture-3d.js?v=4');
      const control=createSculpture(host);
      host.addEventListener('sculpture-state',event=>control.setPlaying(event.detail.playing));
      control.setPlaying(host.dataset.playing==='true');
    } catch(error) { host.dataset.renderer='fallback'; }
  }
  document.querySelectorAll('[data-sculpture]').forEach(host=>observer?observer.observe(host):mount(host));
})();
