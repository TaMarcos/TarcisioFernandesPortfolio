/* A decorative model of the data journey. No invented business metrics. */
(() => {
  'use strict';
  const frame = document.getElementById('flowFrame');
  if (!frame) return;
  document.body.classList.add('site10k');
  const ns = 'http://www.w3.org/2000/svg';
  const panel = document.createElement('div');
  panel.className = 'observatory';
  panel.setAttribute('aria-hidden', 'true');
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 500 290');
  svg.setAttribute('focusable', 'false');
  panel.append(svg);
  function element(tag, attributes) {
    const node = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, value);
    svg.append(node);
    return node;
  }
  [72, 106, 133].forEach((r, i) => element('circle', {cx:250,cy:145,r,class:i===2?'orbit orbit-dash':'orbit'}));
  const points = Array.from({length:24}, (_, i) => {
    const a = i * Math.PI * 2 / 24;
    const line = element('line', {x1:250,y1:145,x2:250+126*Math.cos(a),y2:145+126*Math.sin(a),class:'link'});
    const dot = element('circle', {cx:250+126*Math.cos(a),cy:145+126*Math.sin(a),r:3,class:'datum'});
    return {line,dot,a};
  });
  element('circle', {cx:250,cy:145,r:53,class:'core'});
  const label = element('text', {x:250,y:146,class:'core-label'});
  const number = element('text', {x:250,y:168,class:'core-number'});
  const symbols = ['{ · }', '[ · ]', 'ƒ(x)', '→'];
  function update() {
    const step = Math.max(0, Math.min(3, Number(frame.dataset.step) || 0));
    label.textContent = symbols[step];
    number.textContent = '0' + (step + 1) + ' / 04';
    points.forEach(({dot,line,a}, i) => {
      const radius = step===0 ? 76+(i*19)%57 : step===1 ? (i%2 ? 130 : 85) : step===2 ? 106 : 72;
      const angle = step===3 ? (i/24)*Math.PI*2 : a;
      const x = 250+radius*Math.cos(angle), y = 145+radius*Math.sin(angle);
      dot.setAttribute('cx',x); dot.setAttribute('cy',y);
      dot.setAttribute('opacity',step===1 && i%2 ? '.15' : '.9');
      dot.setAttribute('r',step===3 ? 3.5 : 2.7);
      line.setAttribute('x2',x); line.setAttribute('y2',y);
      line.style.opacity = step===2 ? '.3' : '.08';
    });
  }
  frame.prepend(panel);
  new MutationObserver(update).observe(frame,{attributes:true,attributeFilter:['data-step']});
  update();
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  frame.addEventListener('pointermove', e => {
    if(reduced.matches || !fine.matches || e.pointerType==='touch') return;
    const rect = frame.getBoundingClientRect();
    panel.style.setProperty('--orbit-x', ((e.clientX-rect.left)/rect.width-.5)*10+'px');
    panel.style.setProperty('--orbit-y', ((e.clientY-rect.top)/rect.height-.5)*8+'px');
  },{passive:true});
  function reset(){panel.style.setProperty('--orbit-x','0px');panel.style.setProperty('--orbit-y','0px');}
  frame.addEventListener('pointerleave',reset);
  reduced.addEventListener('change',reset);
  // Arrow keys complement the existing tab, click and touch controls.
  const nodes = [...frame.querySelectorAll('[data-journey]')];
  nodes.forEach((node,index) => node.addEventListener('keydown',event => {
    let next;
    if(event.key==='ArrowRight' || event.key==='ArrowDown') next=(index+1)%nodes.length;
    if(event.key==='ArrowLeft' || event.key==='ArrowUp') next=(index+nodes.length-1)%nodes.length;
    if(event.key==='Home') next=0;
    if(event.key==='End') next=nodes.length-1;
    if(next===undefined) return;
    event.preventDefault(); nodes[next].focus(); nodes[next].click();
  }));
})();
