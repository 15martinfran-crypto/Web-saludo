(function () {
  var HISTORY_KEY = 'compas_history_v1';
  var MAX_POINTS = 24;
  var MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  var ICON = {
    yt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.7 15.1V8.9l5.8 3.1-5.8 3.1z"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 2h-3.4v13.4a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.1a6.4 6.4 0 1 0 5.4 6.3V8.6a8 8 0 0 0 4.6 1.5V6.7a4.7 4.7 0 0 1-4.6-4.7z"/></svg>',
    sp: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22zm5 15.9a.7.7 0 0 1-1 .2c-2.7-1.6-6-2-10-1.1a.7.7 0 1 1-.3-1.3c4.3-1 8-.6 11 1.2.3.2.4.6.3 1zm1.4-3a.9.9 0 0 1-1.2.3c-3-1.9-7.7-2.4-11.3-1.3a.9.9 0 1 1-.5-1.7c4.1-1.2 9.2-.6 12.7 1.5.4.3.5.8.3 1.2zm.1-3.2C14.9 8.6 9 8.4 5.5 9.4a1 1 0 1 1-.6-2c4-1.2 10.5-1 14.6 1.4a1 1 0 0 1-1 1.8z"/></svg>'
  };
  var ARR = {
    up: '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 1l4 5H6v3H4V6H1z" fill="currentColor"/></svg>',
    down: '<svg width="10" height="10" viewBox="0 0 10 10"><path d="M5 9L1 4h3V1h2v3h3z" fill="currentColor"/></svg>'
  };

  var state = { data: null, currentArtist: null };

  function fmt(n) { return String(Math.round(n || 0)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function short(n) {
    var a = Math.abs(n);
    if (a >= 1e6) return (n / 1e6).toLocaleString('es-ES', { maximumFractionDigits: 2 }) + ' M';
    if (a >= 1e4) return (n / 1e3).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' K';
    return fmt(n);
  }
  function sgn(n) { return n > 0 ? '+' : n < 0 ? '−' : ''; }
  function pct(p) { return sgn(p) + Math.abs(p).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %'; }
  var LOWERCASE_WORDS = ['de', 'del', 'la', 'las', 'los', 'y'];
  function artistLabel(key) {
    return key.split('_').map(function (w, i) {
      if (i > 0 && LOWERCASE_WORDS.indexOf(w) !== -1) return w;
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(' ');
  }
  function shortDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.getDate() + ' ' + MONTHS[d.getMonth()];
  }
  function fullDate(iso) {
    var d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}'); } catch (e) { return {}; }
  }
  function saveHistory(h) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch (e) {} }

  function recordSnapshot(data) {
    var history = loadHistory();
    var fecha = data.ultima_actualizacion;
    Object.keys(data.artistas).forEach(function (key) {
      var artist = data.artistas[key];
      if (!history[key]) history[key] = [];
      var series = history[key];
      var point = {
        fecha: fecha,
        yt: artist.youtube ? artist.youtube.suscriptores : null,
        tt: artist.tiktok ? artist.tiktok.seguidores : null,
        sp: artist.spotify ? artist.spotify.oyentes_mensuales : null
      };
      var last = series[series.length - 1];
      if (last && last.fecha === fecha) series[series.length - 1] = point;
      else series.push(point);
      if (series.length > MAX_POINTS) series.splice(0, series.length - MAX_POINTS);
    });
    saveHistory(history);
    return history;
  }

  function platformsFor(artist) {
    var list = [];
    if (artist.youtube) {
      var yt = artist.youtube;
      list.push({
        id: 'yt', name: 'YouTube', unit: 'Suscriptores', main: yt.suscriptores,
        kpis: [
          { label: 'Vistas (28 días)', value: short(yt.vistas_28d) },
          { label: 'Watch time (28 días)', value: short(yt.watch_time_horas_28d) + ' h' }
        ],
        top: (yt.top_contenido || []).map(function (c) {
          return { titulo: c.titulo, tag: c.tipo === 'short' ? 'Short' : 'Vídeo', shape: c.tipo === 'short' ? 'v' : '', value: c.vistas, sub: c.likes != null ? short(c.likes) + ' likes' : '', unit: 'vistas' };
        })
      });
    }
    if (artist.tiktok) {
      var tt = artist.tiktok;
      list.push({
        id: 'tt', name: 'TikTok', unit: 'Seguidores', main: tt.seguidores,
        kpis: [{ label: 'Likes totales', value: short(tt.likes_totales) }],
        top: (tt.top_contenido || []).map(function (c) {
          return { titulo: c.titulo, tag: 'Vídeo', shape: 'v', value: c.vistas, sub: c.likes != null ? short(c.likes) + ' likes' : '', unit: 'vistas' };
        })
      });
    }
    if (artist.spotify) {
      var sp = artist.spotify;
      list.push({
        id: 'sp', name: 'Spotify', unit: 'Oyentes mensuales', main: sp.oyentes_mensuales,
        kpis: [{ label: 'Seguidores', value: short(sp.seguidores) }],
        top: (sp.top_canciones || []).map(function (c) {
          return { titulo: c.titulo, tag: 'Canción', shape: 'sq', value: c.reproducciones, sub: '', unit: 'streams' };
        })
      });
    }
    return list;
  }

  function seriesFor(artistKey, platformId) {
    var history = loadHistory()[artistKey] || [];
    var out = [];
    history.forEach(function (h) {
      if (h[platformId] != null) out.push({ fecha: h.fecha, value: h[platformId] });
    });
    return out;
  }

  function buildChartSvg(series, W, H) {
    var pl = 44, pr = 52, pt = 12, pb = 24;
    var values = series.map(function (p) { return p.value; });
    var mn = Math.min.apply(0, values), mx = Math.max.apply(0, values);
    var pad = (mx - mn) * 0.15 || Math.max(1, mx * 0.1);
    mn -= pad; mx += pad;
    var x = function (i) { return pl + i * (W - pl - pr) / Math.max(1, series.length - 1); };
    var y = function (v) { return pt + (1 - (v - mn) / (mx - mn)) * (H - pt - pb); };

    var g = '';
    for (var k = 0; k < 3; k++) {
      var v = mn + (mx - mn) * (k + 0.5) / 3, yy = y(v);
      g += '<line class="grid-l" x1="' + pl + '" x2="' + (W - pr) + '" y1="' + yy + '" y2="' + yy + '"/><text class="ax" x="' + (pl - 8) + '" y="' + (yy + 4) + '" text-anchor="end">' + short(Math.round(v)) + '</text>';
    }
    var pts = series.map(function (p, i) { return x(i).toFixed(1) + ',' + y(p.value).toFixed(1); }).join(' ');
    var step = Math.max(1, Math.ceil(series.length / (W < 500 ? 4 : 6)));
    var xl = series.map(function (p, i) { return i; }).filter(function (i) { return i % step === 0 || i === series.length - 1; })
      .map(function (i) { return '<text class="ax" x="' + x(i) + '" y="' + (H - 4) + '" text-anchor="middle">' + shortDate(series[i].fecha) + '</text>'; }).join('');
    var li = series.length - 1;

    return {
      series: series, x: x, y: y, W: W, H: H,
      svg: '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img">' + g +
        '<polygon class="ar" points="' + pl + ',' + (H - pb) + ' ' + pts + ' ' + (W - pr) + ',' + (H - pb) + '"/><polyline class="ln" points="' + pts + '"/>' +
        '<circle class="dot" cx="' + x(li) + '" cy="' + y(series[li].value) + '" r="4.5"/><text class="lbl" x="' + (x(li) + 10) + '" y="' + (y(series[li].value) + 4) + '">' + short(series[li].value) + '</text>' + xl +
        '<line class="xh" x1="0" x2="0" y1="' + pt + '" y2="' + (H - pb) + '"/><circle class="dot hd" r="5"/></svg>'
    };
  }

  function deltaInfo(series) {
    if (series.length < 2) return null;
    var last = series[series.length - 1].value, prev = series[series.length - 2].value;
    var d = last - prev;
    var p = prev !== 0 ? (d / Math.abs(prev)) * 100 : 0;
    return { d: d, p: p, up: d >= 0 };
  }

  function renderTopRows(top) {
    if (!top.length) return '<div class="empty">Sin contenido registrado.</div>';
    var maxV = top.reduce(function (m, t) { return Math.max(m, t.value); }, 1);
    return top.map(function (t, i) {
      var pat = ['p1', 'p2', 'p3', 'p1', 'p2'][i % 5];
      var letter = (t.titulo || '?').trim().charAt(0).toUpperCase();
      return '<div class="row"><span class="rk">' + (i + 1) + '</span>' +
        '<div class="th ' + t.shape + '"><span class="' + pat + '"></span><span class="g">' + letter + '</span></div>' +
        '<div class="ti"><b title="' + escapeHtml(t.titulo) + '">' + escapeHtml(t.titulo) + '</b>' +
        '<small><span class="tag">' + t.tag + '</span>' + (t.sub ? t.sub : '') + '</small>' +
        '<div class="bar"><i style="width:' + Math.round((t.value / maxV) * 100) + '%"></i></div></div>' +
        '<div class="vw num">' + short(t.value) + '<small>' + t.unit + '</small></div></div>';
    }).join('');
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function renderCard(artistKey, p) {
    var series = seriesFor(artistKey, p.id);
    var delta = deltaInfo(series);
    var deltaHtml = delta
      ? '<span class="delta num ' + (delta.up ? 'up' : 'down') + '">' + ARR[delta.up ? 'up' : 'down'] + sgn(delta.d) + fmt(Math.abs(delta.d)) + '<small>desde la actualización anterior</small></span>'
      : '<span class="delta num flat">Primer registro<small>vuelve tras la próxima actualización</small></span>';

    var el = document.createElement('article');
    el.className = 'card';
    el.innerHTML =
      '<div class="card-h"><div class="pico">' + ICON[p.id] + '</div><div><h2>' + p.name + '</h2><small>Datos de ' + p.name + '</small></div><span class="live"><i></i>Al día</span></div>' +
      '<div class="card-b">' +
        '<div class="main">' +
          '<div class="headline"><div><label>' + p.unit + '</label><div class="big num">' + fmt(p.main) + '</div></div>' + deltaHtml + '</div>' +
          '<div class="kpis">' + p.kpis.map(function (k) { return '<div class="kpi"><label title="' + k.label + '">' + k.label + '</label><b class="num">' + k.value + '</b></div>'; }).join('') + '</div>' +
          '<div class="chart"><div class="chart-t"><h3>Evolución de ' + p.unit.toLowerCase() + '</h3><small>' + series.length + ' registro' + (series.length === 1 ? '' : 's') + '</small></div>' +
          (series.length >= 2 ? '<div class="cv"></div><div class="tip"></div>' : '<div class="chart-empty">Aún no hay histórico suficiente. Cada vez que actualices <code>data.json</code> con una fecha nueva se añadirá un punto a esta gráfica.</div>') +
          '</div>' +
        '</div>' +
        '<div class="top-c"><h3>Top contenido <small>por ' + (p.id === 'sp' ? 'streams' : 'vistas') + '</small></h3>' + renderTopRows(p.top) + '</div>' +
      '</div>';

    if (series.length >= 2) {
      var box = el.querySelector('.chart'), cv = box.querySelector('.cv'), tip = box.querySelector('.tip');
      var c, svg, xh, hd;
      el._draw = function () {
        var w = cv.clientWidth || 640;
        c = buildChartSvg(series, w, w < 500 ? 170 : 200);
        cv.innerHTML = c.svg;
        svg = cv.querySelector('svg'); xh = svg.querySelector('.xh'); hd = svg.querySelector('.hd');
        svg.addEventListener('mousemove', move);
      };
      function move(e) {
        var r = svg.getBoundingClientRect();
        var vx = (e.clientX - r.left) / r.width * c.W;
        var span = (c.W - 96) / Math.max(1, c.series.length - 1);
        var i = Math.max(0, Math.min(c.series.length - 1, Math.round((vx - 44) / span)));
        var px = c.x(i), py = c.y(c.series[i].value);
        xh.setAttribute('x1', px); xh.setAttribute('x2', px);
        hd.setAttribute('cx', px); hd.setAttribute('cy', py);
        var br = box.getBoundingClientRect();
        tip.style.left = (r.left - br.left + px / c.W * r.width) + 'px';
        tip.style.top = (r.top - br.top + py / c.H * r.height - 10) + 'px';
        tip.innerHTML = '<span>' + fullDate(c.series[i].fecha) + '</span><b class="num">' + fmt(c.series[i].value) + '</b>';
      }
    }
    return el;
  }

  function applyAccent(artist) {
    var app = document.getElementById('app');
    app.style.setProperty('--accent', artist.color || '#d9a441');
    app.style.setProperty('--accent-deep', artist.color_fondo || '#221936');
  }

  function renderChips(data) {
    var chips = document.getElementById('chips');
    chips.innerHTML = '';
    Object.keys(data.artistas).forEach(function (key) {
      var artist = data.artistas[key];
      var btn = document.createElement('button');
      btn.className = 'chip';
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', key === state.currentArtist ? 'true' : 'false');
      btn.style.setProperty('--c', artist.color || '#d9a441');
      btn.innerHTML = '<i></i><span>' + artistLabel(key) + '</span>';
      btn.addEventListener('click', function () {
        state.currentArtist = key;
        renderAll();
      });
      chips.appendChild(btn);
    });
  }

  function renderHero(artistKey, artist, platforms) {
    var tot = platforms.reduce(function (s, p) { return s + (p.main || 0); }, 0);
    var deltas = platforms.map(function (p) { return deltaInfo(seriesFor(artistKey, p.id)); }).filter(Boolean);
    var dt = deltas.reduce(function (s, d) { return s + d.d; }, 0);
    var hasDelta = deltas.length > 0;

    document.getElementById('hero').innerHTML =
      '<div><div class="eyebrow">Panel de artista</div><h1>' + artistLabel(artistKey) + '</h1>' +
      '<p>Datos actualizados el ' + fullDate(state.data.ultima_actualizacion) + '</p><div class="volante"></div></div>' +
      '<div class="summary">' +
        '<div><label>Audiencia total</label><strong class="num">' + short(tot) + '</strong>' +
        (hasDelta ? '<span class="range num" style="color:var(--' + (dt >= 0 ? 'up' : 'down') + ')">' + sgn(dt) + short(Math.abs(dt)) + ' desde la última actualización</span>' : '<span class="range">Primer registro</span>') +
        '</div>' +
        '<div><label>Plataformas</label><strong class="num">' + platforms.length + '</strong><span class="range">' + platforms.map(function (p) { return p.name; }).join(' · ') + '</span></div>' +
      '</div>';
  }

  function renderAll() {
    var data = state.data;
    var artist = data.artistas[state.currentArtist];
    applyAccent(artist);
    renderChips(data);

    var dateText = fullDate(data.ultima_actualizacion);
    document.getElementById('last-update').textContent = dateText;
    document.getElementById('last-update-m').textContent = dateText;

    var platforms = platformsFor(artist);
    renderHero(state.currentArtist, artist, platforms);

    var grid = document.getElementById('grid');
    grid.innerHTML = '';
    platforms.forEach(function (p) {
      var el = renderCard(state.currentArtist, p);
      grid.appendChild(el);
      if (el._draw) el._draw();
    });
  }

  async function loadData() {
    var res = await fetch('data.json?_=' + Date.now());
    if (!res.ok) throw new Error('No se pudo leer data.json');
    return res.json();
  }

  async function init() {
    try {
      var data = await loadData();
      state.data = data;
      if (!state.currentArtist || !data.artistas[state.currentArtist]) {
        state.currentArtist = Object.keys(data.artistas)[0];
      }
      recordSnapshot(data);
      renderAll();
    } catch (err) {
      document.getElementById('grid').innerHTML = '<div class="empty">Error cargando data.json: ' + escapeHtml(err.message) + '</div>';
    }
  }

  document.getElementById('refresh').addEventListener('click', function () {
    var btn = this;
    btn.classList.add('spin');
    init().finally(function () {
      setTimeout(function () { btn.classList.remove('spin'); }, 400);
    });
  });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      document.querySelectorAll('.card').forEach(function (el) { if (el._draw) el._draw(); });
    }, 120);
  });

  init();
})();
