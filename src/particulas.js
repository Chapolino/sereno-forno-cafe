// Partículas leves em canvas: brasas que sobem (hero) e farinha que cai (processo).
// Um sprite pré-desenhado por cor, nada de gradiente por quadro. Pausa fora da tela.
import { gsap } from 'gsap';

function sprite(cores, tam = 64) {
  const c = document.createElement('canvas');
  c.width = c.height = tam;
  const g = c.getContext('2d');
  const r = tam / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  cores.forEach(([p, cor]) => grad.addColorStop(p, cor));
  g.fillStyle = grad;
  g.fillRect(0, 0, tam, tam);
  return c;
}

const SPRITES = {
  brasaQuente: () =>
    sprite([
      [0, 'rgba(255,244,214,1)'],
      [0.12, 'rgba(255,196,128,0.95)'],
      [0.32, 'rgba(232,124,64,0.45)'],
      [1, 'rgba(217,119,74,0)'],
    ]),
  brasaMorna: () =>
    sprite([
      [0, 'rgba(255,190,120,0.95)'],
      [0.18, 'rgba(217,119,74,0.6)'],
      [0.45, 'rgba(151,63,27,0.22)'],
      [1, 'rgba(151,63,27,0)'],
    ]),
  farinhaNoite: () =>
    sprite([
      [0, 'rgba(237,228,214,0.9)'],
      [0.35, 'rgba(237,228,214,0.35)'],
      [1, 'rgba(237,228,214,0)'],
    ]),
  farinhaDia: () =>
    sprite([
      [0, 'rgba(90,70,54,0.75)'],
      [0.35, 'rgba(90,70,54,0.28)'],
      [1, 'rgba(90,70,54,0)'],
    ]),
};

/**
 * @param {HTMLCanvasElement} canvas
 * @param {{ tipo: 'brasa'|'farinha', quantidade: number, dpr?: number }} op
 */
export function criarParticulas(canvas, op) {
  const ctx = canvas.getContext('2d');
  const dpr = op.dpr ?? Math.min(window.devicePixelRatio || 1, 1.5);
  const brasa = op.tipo === 'brasa';
  const sp = brasa ? [SPRITES.brasaQuente(), SPRITES.brasaMorna()] : [SPRITES.farinhaNoite(), SPRITES.farinhaDia()];
  let w = 0;
  let h = 0;
  let rodando = false;
  let empurraX = 0;
  let empurraY = 0;
  let dia = 0; // farinha: 0 = madrugada (clara), 1 = dia (escura)
  let ventoY = 0;
  const ps = [];

  function medir() {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, r.width);
    h = Math.max(1, r.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }

  function nascer(p, inicio) {
    p.prof = 0.35 + Math.random() * 1.05; // profundidade: perto = maior, mais rápido
    if (brasa) {
      // as brasas saem da boca do forno: mais à direita e embaixo no desktop
      const vies = w > h ? 0.42 + Math.random() * 0.58 : Math.random();
      p.x = vies * w;
      p.y = inicio ? Math.random() * h : h + 10 + Math.random() * 40;
      p.vx = (Math.random() - 0.5) * 0.25;
      p.vy = -(0.35 + Math.random() * 0.9) * p.prof;
      p.tam = (1.4 + Math.random() * 2.6) * p.prof;
      p.vida = 0;
      p.max = 160 + Math.random() * 260;
      p.fase = Math.random() * 6.28;
      p.quente = Math.random() < 0.38;
    } else {
      p.x = Math.random() * w;
      p.y = inicio ? Math.random() * h : -10 - Math.random() * 30;
      p.vx = (Math.random() - 0.5) * 0.12;
      p.vy = (0.12 + Math.random() * 0.32) * p.prof;
      p.tam = (1.2 + Math.random() * 2.4) * p.prof;
      p.vida = 0;
      p.max = 600 + Math.random() * 600;
      p.fase = Math.random() * 6.28;
      p.alfa = 0.18 + Math.random() * 0.42;
    }
    return p;
  }

  function quadro(_t, dtMs) {
    const k = Math.min(3, dtMs / 16.67);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = brasa ? 'lighter' : 'source-over';
    const ex = empurraX;
    const ey = empurraY;
    empurraX *= 0.82;
    empurraY *= 0.82;
    ventoY *= 0.94;
    for (const p of ps) {
      p.vida += k;
      p.fase += 0.035 * k;
      if (brasa) {
        p.x += (p.vx + Math.sin(p.fase) * 0.35) * k + ex * p.prof;
        p.y += (p.vy + ventoY * p.prof) * k + ey * p.prof;
        const v = p.vida / p.max;
        const brilho = (v < 0.12 ? v / 0.12 : 1 - (v - 0.12) / 0.88) * (0.72 + Math.sin(p.fase * 3.1) * 0.28);
        if (v >= 1 || p.y < -20) nascer(p, false);
        ctx.globalAlpha = Math.max(0, brilho);
        const s = p.tam * (p.quente ? 7 : 6) * (0.65 + 0.35 * (1 - v));
        ctx.drawImage(sp[p.quente ? 0 : 1], p.x - s / 2, p.y - s / 2, s, s);
      } else {
        p.x += (p.vx + Math.sin(p.fase) * 0.18) * k + ex * p.prof;
        p.y += p.vy * k + ey * p.prof;
        if (p.y > h + 12 || p.x < -40 || p.x > w + 40 || p.vida > p.max) {
          nascer(p, false);
          if (p.x < -40 || p.x > w + 40) p.x = ((p.x % w) + w) % w;
        }
        const s = p.tam * 4;
        const a = p.alfa * Math.min(1, p.vida / 60);
        if (dia < 1) {
          ctx.globalAlpha = a * (1 - dia);
          ctx.drawImage(sp[0], p.x - s / 2, p.y - s / 2, s, s);
        }
        if (dia > 0) {
          ctx.globalAlpha = a * dia * 0.8;
          ctx.drawImage(sp[1], p.x - s / 2, p.y - s / 2, s, s);
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  medir();
  for (let i = 0; i < op.quantidade; i++) ps.push(nascer({}, true));
  const ro = new ResizeObserver(() => medir());
  ro.observe(canvas);

  return {
    tocar() {
      if (rodando) return;
      rodando = true;
      gsap.ticker.add(quadro);
    },
    pausar() {
      if (!rodando) return;
      rodando = false;
      gsap.ticker.remove(quadro);
    },
    /** desloca as partículas (parallax de primeiro plano), em px por quadro */
    empurrar(dx, dy) {
      empurraX += dx;
      empurraY += dy;
    },
    /** rajada de ar quente: acelera a subida das brasas */
    sopro(v) {
      ventoY = Math.max(-3, Math.min(3, ventoY + v));
    },
    amanhecer(f) {
      dia = f;
    },
  };
}
