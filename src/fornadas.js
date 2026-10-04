// Quadro de fornadas e status da loja, sempre no horário do Crato (America/Fortaleza).
// Para demonstração/prints: ?hora=09:12&dia=sab  (dia: dom, seg, ter, qua, qui, sex, sab)

const FUSO = 'America/Fortaleza';
const WA = 'https://wa.me/?text=';

const SEMANA = [
  ['06:00', 'Pão de fermentação natural', 'levain da casa, 750 g'],
  ['06:30', 'Pão de milho e manteiga da terra'],
  ['07:00', 'Croissant de manteiga da terra'],
  ['08:00', 'Pão de queijo coalho'],
  ['09:30', 'Focaccia de queijo coalho e mel de engenho'],
  ['11:00', 'Ciabatta de azeite'],
  ['15:30', 'Bolo de macaxeira'],
  ['16:30', 'Brioche de rapadura'],
  ['17:30', 'Pão de fermentação natural', 'segunda fornada'],
];
const DOMINGO = [
  ['06:00', 'Pão de fermentação natural', 'levain da casa, 750 g'],
  ['07:00', 'Croissant de manteiga da terra'],
  ['08:00', 'Pão de queijo coalho'],
  ['09:30', 'Focaccia de queijo coalho e mel de engenho'],
  ['11:00', 'Bolo de rolo de goiabada'],
];
// dia da semana (0 = domingo) -> [abre, fecha] em minutos; null = fechado
const HORARIO = { 0: [360, 780], 1: null, 2: [360, 1200], 3: [360, 1200], 4: [360, 1200], 5: [360, 1200], 6: [360, 1260] };
const DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const ABREV = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };

const min = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
export const fala = (minutos) => {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`;
};

/** Agora no Crato: { dia, minutos, data } (aceita ?hora= e ?dia= para demonstração). */
export function agora() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: FUSO,
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map((x) => [x.type, x.value]),
  );
  const mapa = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  let dia = mapa[p.weekday];
  let minutos = Number(p.hour) * 60 + Number(p.minute);
  const q = new URLSearchParams(location.search);
  if (/^\d{1,2}:\d{2}$/.test(q.get('hora') || '')) minutos = min(q.get('hora'));
  if (q.get('dia') in ABREV) dia = ABREV[q.get('dia')];
  return { dia, minutos, demo: q.has('hora') || q.has('dia') };
}

function estadoDe(t, agoraMin) {
  if (agoraMin >= t + 60) return { cls: 'saiu', txt: `saiu às ${fala(t)}` };
  if (agoraMin >= t) return { cls: 'saiu fresco', txt: 'saiu agora' };
  if (agoraMin >= t - 40) return { cls: 'forno', txt: 'no forno' };
  return { cls: 'depois', txt: `às ${fala(t)}` };
}


const marcaEstado = (cls) => {
  const tipo = cls.startsWith('saiu') ? 'saiu' : cls;
  return `<span class="estado estado-${tipo}"><span class="estado-marca" aria-hidden="true"></span>`;
};

/** Renderiza o quadro; devolve informações para o resto da página. */
export function renderizarQuadro(lista, diaEl) {
  const { dia, minutos } = agora();
  const fechado = HORARIO[dia] === null;
  const fornadas = dia === 0 ? DOMINGO : SEMANA;

  diaEl.textContent = DIAS[dia].charAt(0).toUpperCase() + DIAS[dia].slice(1);

  if (fechado) {
    lista.innerHTML = `<li class="quadro-folga"><strong>Segunda o forno folga.</strong><span>O levain descansa hoje. Amanhã a primeira fornada sai às 6h em ponto.</span><a class="avise" href="${WA}${encodeURIComponent('Oi, Sereno! Quero separar um pão de fermentação natural para amanhã cedo.')}" target="_blank" rel="noopener">Separar pão para amanhã</a></li>`;
    return { proxima: 'Amanhã, às 6h: pão de fermentação natural', fechado: true };
  }

  let agoraInserido = false;
  let proxima = null;
  const linhas = [];
  for (const [hhmm, nome, detalhe] of fornadas) {
    const t = min(hhmm);
    const e = estadoDe(t, minutos);
    if (!agoraInserido && !e.cls.startsWith('saiu')) {
      linhas.push(`<li class="quadro-agora"><span>agora, ${fala(minutos)}</span></li>`);
      agoraInserido = true;
    }
    if (!proxima && !e.cls.startsWith('saiu')) {
      proxima = e.cls === 'forno' ? `${nome}: no forno, sai às ${fala(t)}` : `${nome}, às ${fala(t)}`;
    }
    const pedido = encodeURIComponent(`Oi, Sereno! Me avisa quando sair a fornada de ${nome.toLowerCase()} das ${fala(t)}?`);
    const acao = e.cls.startsWith('saiu')
      ? '<span class="avise-vazio"></span>'
      : `<a class="avise" href="${WA}${pedido}" target="_blank" rel="noopener" aria-label="Me avise quando sair: ${nome}, ${fala(t)}">Me avise</a>`;
    linhas.push(
      `<li class="quadro-linha ${e.cls}">` +
        `<span class="quadro-hora"><span class="sr">${fala(t)}</span><span aria-hidden="true" class="hora-mascara"><span class="hora-txt">${hhmm}</span></span></span>` +
        `<span class="quadro-nome">${nome}${detalhe ? `<small>${detalhe}</small>` : ''}</span>` +
        `<span class="quadro-estado">${marcaEstado(e.cls)}${e.txt}</span></span>` +
        `<span class="quadro-acao">${acao}</span>` +
        `</li>`,
    );
  }
  if (!agoraInserido) {
    linhas.push(`<li class="quadro-agora"><span>agora, ${fala(minutos)}: as fornadas de hoje já saíram</span></li>`);
  }
  lista.innerHTML = linhas.join('');
  return {
    proxima: proxima || (dia === 6 ? 'Domingo, às 6h: pão de fermentação natural' : dia === 0 ? 'Terça, às 6h: pão de fermentação natural' : 'Amanhã, às 6h: pão de fermentação natural'),
    fechado: false,
  };
}

/** Texto e classe do status "aberto/fechado" + destaque do dia na tabela de horários. */
export function statusLoja(el, textoEl, horarios) {
  const { dia, minutos } = agora();
  const h = HORARIO[dia];
  let aberto = false;
  let texto;
  if (h && minutos >= h[0] && minutos < h[1]) {
    aberto = true;
    texto = `Aberto agora, até as ${fala(h[1])}`;
  } else if (h && minutos < h[0]) {
    texto = `Fechado agora. Abre hoje às ${fala(h[0])}`;
  } else {
    let d = (dia + 1) % 7;
    while (!HORARIO[d]) d = (d + 1) % 7;
    const quando = d === (dia + 1) % 7 ? 'amanhã' : DIAS[d];
    texto = `Fechado agora. Abre ${quando} às ${fala(HORARIO[d][0])}`;
  }
  el.classList.toggle('aberto', aberto);
  textoEl.textContent = texto;
  horarios.forEach((div) => {
    const dias = (div.dataset.dias || '').split(',').map(Number);
    div.classList.toggle('hoje', dias.includes(dia));
  });
}
