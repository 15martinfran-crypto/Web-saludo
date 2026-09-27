const HISTORY_KEY = 'artist_dashboard_history_v1';
const MAX_HISTORY_POINTS = 30;

let state = {
  data: null,
  currentArtist: null,
  chart: null,
};

function formatNumber(n) {
  return Number(n || 0).toLocaleString('es-ES');
}

function artistLabel(key) {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

async function loadData() {
  const res = await fetch(`data.json?_=${Date.now()}`);
  if (!res.ok) throw new Error('No se pudo leer data.json');
  return res.json();
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}');
  } catch {
    return {};
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function recordSnapshot(data) {
  const history = loadHistory();
  const fecha = data.ultima_actualizacion;

  Object.entries(data.artistas).forEach(([key, artist]) => {
    if (!history[key]) history[key] = [];
    const series = history[key];
    const last = series[series.length - 1];

    const point = {
      fecha,
      yt_suscriptores: artist.youtube?.suscriptores ?? null,
      tk_seguidores: artist.tiktok?.seguidores ?? null,
      spotify_oyentes: artist.spotify?.oyentes_mensuales ?? null,
    };

    if (last && last.fecha === fecha) {
      series[series.length - 1] = point;
    } else {
      series.push(point);
    }

    if (series.length > MAX_HISTORY_POINTS) {
      series.splice(0, series.length - MAX_HISTORY_POINTS);
    }
  });

  saveHistory(history);
  return history;
}

function renderTabs(data) {
  const tabsEl = document.getElementById('tabs');
  tabsEl.innerHTML = '';

  Object.keys(data.artistas).forEach((key) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (key === state.currentArtist ? ' active' : '');
    btn.textContent = artistLabel(key);
    btn.addEventListener('click', () => {
      state.currentArtist = key;
      renderAll();
    });
    tabsEl.appendChild(btn);
  });
}

function renderKpis(artist) {
  const grid = document.getElementById('kpi-grid');
  grid.innerHTML = '';

  const cards = [];

  if (artist.youtube) {
    cards.push({ label: 'Suscriptores YouTube', value: formatNumber(artist.youtube.suscriptores), platform: 'YouTube' });
    cards.push({ label: 'Vistas (28 días)', value: formatNumber(artist.youtube.vistas_28d), platform: 'YouTube' });
    cards.push({ label: 'Watch time horas (28 días)', value: formatNumber(artist.youtube.watch_time_horas_28d), platform: 'YouTube' });
  }
  if (artist.tiktok) {
    cards.push({ label: 'Seguidores TikTok', value: formatNumber(artist.tiktok.seguidores), platform: 'TikTok' });
    cards.push({ label: 'Likes totales', value: formatNumber(artist.tiktok.likes_totales), platform: 'TikTok' });
  }
  if (artist.spotify) {
    cards.push({ label: 'Oyentes mensuales', value: formatNumber(artist.spotify.oyentes_mensuales), platform: 'Spotify' });
    cards.push({ label: 'Seguidores Spotify', value: formatNumber(artist.spotify.seguidores), platform: 'Spotify' });
  }

  cards.forEach((c) => {
    const card = document.createElement('div');
    card.className = 'kpi-card';
    card.innerHTML = `
      <div class="kpi-label">${c.label}</div>
      <div class="kpi-value">${c.value}</div>
      <div class="kpi-platform">${c.platform}</div>
    `;
    grid.appendChild(card);
  });
}

function renderContentTable(title, rows, columns) {
  const card = document.createElement('div');
  card.className = 'table-card';

  if (!rows || rows.length === 0) {
    card.innerHTML = `<h3>${title}</h3><div class="empty">Sin contenido registrado.</div>`;
    return card;
  }

  const head = columns.map((c) => `<th>${c.label}</th>`).join('');
  const body = rows
    .map((row) => {
      const cells = columns
        .map((c) => {
          const value = c.render ? c.render(row) : row[c.key];
          const cls = c.numeric ? ' class="num"' : '';
          return `<td${cls}>${value}</td>`;
        })
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');

  card.innerHTML = `
    <h3>${title}</h3>
    <table>
      <thead><tr>${head}</tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
  return card;
}

function renderTables(artist) {
  const grid = document.getElementById('tables-grid');
  grid.innerHTML = '';

  if (artist.youtube) {
    grid.appendChild(
      renderContentTable('Top contenido — YouTube', artist.youtube.top_contenido, [
        { key: 'titulo', label: 'Título' },
        {
          key: 'tipo',
          label: 'Tipo',
          render: (r) => `<span class="badge">${r.tipo}</span>`,
        },
        { key: 'vistas', label: 'Vistas', numeric: true, render: (r) => formatNumber(r.vistas) },
        { key: 'likes', label: 'Likes', numeric: true, render: (r) => formatNumber(r.likes) },
      ])
    );
  }

  if (artist.tiktok) {
    grid.appendChild(
      renderContentTable('Top contenido — TikTok', artist.tiktok.top_contenido, [
        { key: 'titulo', label: 'Título' },
        { key: 'vistas', label: 'Vistas', numeric: true, render: (r) => formatNumber(r.vistas) },
        { key: 'likes', label: 'Likes', numeric: true, render: (r) => formatNumber(r.likes) },
      ])
    );
  }

  if (artist.spotify) {
    grid.appendChild(
      renderContentTable('Top canciones — Spotify', artist.spotify.top_canciones, [
        { key: 'titulo', label: 'Título' },
        { key: 'reproducciones', label: 'Reproducciones', numeric: true, render: (r) => formatNumber(r.reproducciones) },
      ])
    );
  }
}

function renderChart(artistKey, artist, history) {
  const series = history[artistKey] || [];
  const labels = series.map((p) => p.fecha);

  const datasets = [];
  if (artist.youtube) {
    datasets.push({
      label: 'Suscriptores YouTube',
      data: series.map((p) => p.yt_suscriptores),
      borderColor: artist.color,
      backgroundColor: artist.color,
      tension: 0.3,
    });
  }
  if (artist.tiktok) {
    datasets.push({
      label: 'Seguidores TikTok',
      data: series.map((p) => p.tk_seguidores),
      borderColor: '#f2f2f3',
      backgroundColor: '#f2f2f3',
      borderDash: [4, 4],
      tension: 0.3,
    });
  }
  if (artist.spotify) {
    datasets.push({
      label: 'Oyentes mensuales Spotify',
      data: series.map((p) => p.spotify_oyentes),
      borderColor: '#9a9aa2',
      backgroundColor: '#9a9aa2',
      borderDash: [2, 3],
      tension: 0.3,
    });
  }

  const ctx = document.getElementById('evolution-chart').getContext('2d');

  if (state.chart) {
    state.chart.destroy();
  }

  state.chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { color: '#9a9aa2' } },
      },
      scales: {
        x: { ticks: { color: '#9a9aa2' }, grid: { color: '#26262c' } },
        y: { ticks: { color: '#9a9aa2' }, grid: { color: '#26262c' } },
      },
    },
  });
}

function applyAccentColor(color) {
  document.documentElement.style.setProperty('--accent-color', color);
}

function renderAll() {
  const data = state.data;
  const artist = data.artistas[state.currentArtist];

  document.getElementById('last-update-value').textContent = data.ultima_actualizacion;
  applyAccentColor(artist.color || '#c9a227');

  renderTabs(data);
  renderKpis(artist);
  renderTables(artist);

  const history = recordSnapshot(data);
  renderChart(state.currentArtist, artist, history);
}

async function init() {
  try {
    const data = await loadData();
    state.data = data;
    state.currentArtist = Object.keys(data.artistas)[0];
    renderAll();
  } catch (err) {
    document.getElementById('content').innerHTML = `
      <div class="empty">Error cargando data.json: ${err.message}</div>
    `;
  }
}

init();
