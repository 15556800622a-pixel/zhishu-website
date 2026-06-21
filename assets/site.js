const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeFlash = document.querySelector('.theme-flash');
const savedTheme = localStorage.getItem('zhishu-theme');

if (savedTheme === 'paper' || savedTheme === 'ink') {
  root.dataset.theme = savedTheme;
}

function syncThemeControl() {
  const paper = root.dataset.theme === 'paper';
  themeToggle.setAttribute('aria-pressed', String(paper));
  document.querySelector('meta[name="theme-color"]').content = paper ? '#f3ede2' : '#15121e';
}

syncThemeControl();

themeToggle.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'ink' ? 'paper' : 'ink';
  localStorage.setItem('zhishu-theme', root.dataset.theme);
  syncThemeControl();
  if (!reduceMotion.matches) {
    themeFlash.classList.remove('active');
    requestAnimationFrame(() => themeFlash.classList.add('active'));
  }
});

window.addEventListener('scroll', () => {
  document.querySelector('[data-header]').classList.toggle('scrolled', window.scrollY > window.innerHeight * 0.72);
  if (!reduceMotion.matches) {
    document.querySelector('[data-graph]').style.transform = `translateY(${window.scrollY * 0.08}px)`;
  }
}, { passive: true });

const revealObserver = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }
}, { threshold: 0.14 });

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 2) * 70}ms`;
  revealObserver.observe(element);
});

async function configureDownloads() {
  const links = document.querySelectorAll('[data-download-link]');
  try {
    const response = await fetch('config/download.json');
    if (!response.ok) throw new Error('Download configuration unavailable');
    const config = await response.json();
    const available = config.downloadUrl && config.downloadUrl !== 'REPLACE_WITH_REAL_LINK_OR_PATH';
    const label = available ? `\u4e0b\u8f7d ${config.fileName.replace(/\.zip$/i, '')} v${config.version}` : '\u5373\u5c06\u4e0a\u7ebf';
    const meta = available
      ? `WINDOWS / ${config.version} / ${config.fileSizeLabel || config.releaseDate}`
      : 'WINDOWS DESKTOP';

    links.forEach((link) => {
      link.querySelector('[data-download-label]').textContent = label;
      link.setAttribute('aria-disabled', String(!available));
      if (available) {
        link.href = config.downloadUrl;
        link.setAttribute('download', config.fileName);
      } else {
        link.removeAttribute('href');
        link.removeAttribute('download');
      }
    });
    document.querySelectorAll('[data-release-meta]').forEach((element) => {
      element.textContent = meta;
    });
  } catch (error) {
    links.forEach((link) => {
      link.setAttribute('aria-disabled', 'true');
      link.removeAttribute('href');
      link.querySelector('[data-download-label]').textContent = '\u5373\u5c06\u4e0a\u7ebf';
    });
  }
}

configureDownloads();

const linkInput = document.querySelector('[data-link-input]');
const suggestions = document.querySelector('[data-suggestions]');

function updateSuggestions() {
  suggestions.hidden = !linkInput.value.includes('[[');
}

linkInput.addEventListener('input', updateSuggestions);
linkInput.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' && !suggestions.hidden) {
    event.preventDefault();
    suggestions.querySelector('button').focus();
  }
});

suggestions.addEventListener('click', (event) => {
  const option = event.target.closest('[data-note]');
  if (!option) return;
  const beforeLink = linkInput.value.split('[[')[0];
  linkInput.value = `${beforeLink}[[${option.dataset.note}]]`;
  suggestions.hidden = true;
  linkInput.focus();
});

const palette = ['#8170e8', '#e8a23d', '#4fb6d9'];

function graphTheme() {
  return root.dataset.theme === 'paper'
    ? { line: 'rgba(52,45,64,.16)', card: 'rgba(250,246,238,.94)', text: '#211d27', glow: .48 }
    : { line: 'rgba(243,237,226,.13)', card: 'rgba(29,25,40,.94)', text: '#f3ede2', glow: 1 };
}

function makeNodes(count, width, height, seedOffset = 0) {
  return Array.from({ length: count }, (_, index) => {
    const angle = index * 2.399 + seedOffset;
    const spread = Math.sqrt((index + 1) / count);
    return {
      x: width * .5 + Math.cos(angle) * width * .38 * spread,
      y: height * .46 + Math.sin(angle) * height * .36 * spread,
      baseX: 0,
      baseY: 0,
      radius: index % 5 === 0 ? 6 : 3.5,
      color: palette[index % palette.length],
      phase: index * .83,
    };
  }).map((node) => ({ ...node, baseX: node.x, baseY: node.y }));
}

function createGraph(canvas, options = {}) {
  const context = canvas.getContext('2d');
  let width = 0;
  let height = 0;
  let nodes = [];
  let frame = 0;
  let started = performance.now();
  let expandedIndex = 2;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    const mobile = width < 768;
    nodes = makeNodes(options.section ? (mobile ? 12 : 20) : (mobile ? 9 : 17), width, height, options.section ? 1.2 : .2);
  }

  function draw(time) {
    const theme = graphTheme();
    const elapsed = (time - started) / 1000;
    const moving = !reduceMotion.matches;
    context.clearRect(0, 0, width, height);

    nodes.forEach((node, index) => {
      const amplitude = options.section ? 7 : 12;
      node.x = node.baseX + (moving ? Math.sin(elapsed * .18 + node.phase) * amplitude : 0);
      node.y = node.baseY + (moving ? Math.cos(elapsed * .15 + node.phase) * amplitude : 0);
      for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
        const other = nodes[otherIndex];
        const distance = Math.hypot(node.x - other.x, node.y - other.y);
        const maxDistance = Math.min(width, height) * .29;
        if (distance < maxDistance) {
          context.beginPath();
          const gradient = context.createLinearGradient(node.x, node.y, other.x, other.y);
          gradient.addColorStop(0, `${node.color}2b`);
          gradient.addColorStop(1, `${other.color}12`);
          context.strokeStyle = gradient;
          context.globalAlpha = 1 - distance / maxDistance;
          context.lineWidth = .8;
          context.moveTo(node.x, node.y);
          context.lineTo(other.x, other.y);
          context.stroke();
        }
      }
    });
    context.globalAlpha = 1;

    nodes.forEach((node, index) => {
      const active = !options.section && index === expandedIndex;
      if (!active) {
        const gradient = context.createRadialGradient(node.x - 1, node.y - 1, 0, node.x, node.y, node.radius * 3.4);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(.16, node.color);
        gradient.addColorStop(1, `${node.color}00`);
        context.fillStyle = gradient;
        context.beginPath();
        context.arc(node.x, node.y, node.radius * 3.4, 0, Math.PI * 2);
        context.fill();
      }
    });

    if (!options.section && nodes[expandedIndex]) {
      const node = nodes[expandedIndex];
      const cycle = reduceMotion.matches ? .6 : (elapsed % 8) / 8;
      const visible = cycle > .22 && cycle < .72;
      if (visible || reduceMotion.matches) {
        const cardWidth = Math.min(270, width * .68);
        const cardHeight = 86;
        const x = Math.min(Math.max(18, node.x + 18), width - cardWidth - 18);
        const y = Math.min(Math.max(90, node.y - 43), height - cardHeight - 70);
        context.shadowColor = `rgba(129,112,232,${.2 * theme.glow})`;
        context.shadowBlur = 28;
        context.fillStyle = theme.card;
        context.strokeStyle = theme.line;
        context.lineWidth = 1;
        context.beginPath();
        context.roundRect(x, y, cardWidth, cardHeight, 10);
        context.fill();
        context.stroke();
        context.shadowBlur = 0;
        context.fillStyle = '#8170e8';
        context.font = '500 10px "JetBrains Mono", monospace';
        context.fillText('NOTE / 024', x + 16, y + 21);
        context.fillStyle = theme.text;
        context.font = '700 16px "Noto Serif SC", serif';
        context.fillText('\u4e00\u7bc7\u7b14\u8bb0', x + 16, y + 48);
        context.fillStyle = '#8170e8';
        context.font = '12px "JetBrains Mono", monospace';
        context.fillText('[[\u5173\u8054\u7b14\u8bb0]]', x + 16, y + 69);
      }
      if (!reduceMotion.matches && cycle < .02) expandedIndex = (expandedIndex + 5) % nodes.length;
    }

    if (!reduceMotion.matches) frame = requestAnimationFrame(draw);
  }

  resize();
  draw(performance.now());
  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (reduceMotion.matches) draw(performance.now());
  });
  resizeObserver.observe(canvas);

  return () => {
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
  };
}

createGraph(document.querySelector('[data-graph]'));
createGraph(document.querySelector('[data-section-graph]'), { section: true });
