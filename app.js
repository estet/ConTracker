(() => {
  'use strict';

  const KEY = 'contraction-tracker-v1';
  const $ = id => document.getElementById(id);
  const ui = {
    heading: $('timer-heading'), timer: $('timer'), meta: $('timerMeta'), main: $('mainButton'), offsets: $('offsetWrap'),
    hour: $('statHour'), duration: $('statDuration'), interval: $('statInterval'), last: $('statLast'),
    count: $('historyCount'), empty: $('emptyState'), list: $('historyList'), undo: $('undoButton'),
    manual: $('manualButton'), share: $('shareButton'), export: $('exportButton'), clear: $('clearButton'),
    dialog: $('manualDialog'), form: $('manualForm'), start: $('manualStart'), minutes: $('manualMinutes'),
    seconds: $('manualSeconds'), cancel: $('cancelManual'), toast: $('toast')
  };

  let toastTimer;
  let state = load();

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
      const contractions = Array.isArray(saved.contractions)
        ? saved.contractions.filter(x => Number.isFinite(x.start) && Number.isFinite(x.end) && x.end >= x.start)
        : [];
      return { activeStart: Number.isFinite(saved.activeStart) ? saved.activeStart : null, contractions };
    } catch {
      return { activeStart: null, contractions: [] };
    }
  }

  function save() {
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function id() {
    return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  }

  function duration(ms) {
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  }

  function compact(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m ? `${m}m${s ? ` ${s}s` : ''}` : `${s}s`;
  }

  function clock(time) {
    return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(time));
  }

  function escape(value) {
    const node = document.createElement('span');
    node.textContent = String(value);
    return node.innerHTML;
  }

  function average(values) {
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function notify(message) {
    clearTimeout(toastTimer);
    ui.toast.textContent = message;
    ui.toast.classList.add('show');
    toastTimer = setTimeout(() => ui.toast.classList.remove('show'), 1800);
  }

  function start(offset = 0) {
    if (state.activeStart !== null) return;
    const requested = Date.now() - offset * 1000;
    const previous = state.contractions.at(-1);
    state.activeStart = Math.max(requested, previous ? previous.end : requested);
    save();
    render();
    notify(offset ? `Started ${compact(Date.now() - state.activeStart)} ago` : 'Contraction started');
  }

  function stop() {
    if (state.activeStart === null) return;
    state.contractions.push({ id: id(), start: state.activeStart, end: Date.now() });
    state.activeStart = null;
    state.contractions.sort((a, b) => a.start - b.start);
    save();
    render();
    notify('Contraction saved');
  }

  function renderTimer() {
    const active = state.activeStart !== null;
    const latest = state.contractions.at(-1);
    ui.main.textContent = active ? 'Stop contraction' : 'Start contraction';
    ui.main.classList.toggle('stop', active);
    ui.offsets.hidden = active;

    if (active) {
      ui.heading.textContent = 'Contraction in progress';
      ui.timer.textContent = duration(Date.now() - state.activeStart);
      ui.meta.textContent = `Started at ${clock(state.activeStart)}`;
    } else if (latest) {
      ui.heading.textContent = 'Time since last started';
      ui.timer.textContent = duration(Date.now() - latest.start);
      ui.meta.textContent = `Lasted ${duration(latest.end - latest.start)} · ended at ${clock(latest.end)}`;
    } else {
      ui.heading.textContent = 'Ready';
      ui.timer.textContent = '0:00';
      ui.meta.textContent = 'No contraction is being timed';
    }
  }

  function renderStats() {
    const items = state.contractions;
    const recent = items.slice(-5);
    const intervals = items.slice(1).map((x, i) => x.start - items[i].start).slice(-5);
    ui.hour.textContent = String(items.filter(x => x.start >= Date.now() - 3600000).length +
      (state.activeStart !== null && state.activeStart >= Date.now() - 3600000 ? 1 : 0));
    ui.duration.textContent = recent.length ? compact(average(recent.map(x => x.end - x.start))) : '—';
    ui.interval.textContent = intervals.length ? compact(average(intervals)) : '—';
    ui.last.textContent = items.length ? compact(items.at(-1).end - items.at(-1).start) : '—';
  }

  function renderHistory() {
    const items = state.contractions;
    ui.count.textContent = `${items.length} total`;
    ui.empty.hidden = items.length > 0;
    ui.list.innerHTML = [...items].reverse().map((item, reverseIndex) => {
      const index = items.length - reverseIndex - 1;
      const interval = index > 0 ? item.start - items[index - 1].start : null;
      return `<div class="history-row">
        <div class="history-main"><div class="history-number">#${index + 1}</div><div class="history-time">${escape(clock(item.start))}</div></div>
        <div class="metric"><span class="metric-label">Duration</span><span class="metric-value">${duration(item.end - item.start)}</span></div>
        <div class="metric interval-metric"><span class="metric-label">Interval</span><span class="metric-value">${interval === null ? '—' : duration(interval)}</span></div>
        <button class="icon-button danger" type="button" aria-label="Delete entry" data-delete="${escape(item.id)}">×</button>
      </div>`;
    }).join('');
  }

  function render() {
    state.contractions.sort((a, b) => a.start - b.start);
    renderTimer();
    renderStats();
    renderHistory();
    const has = state.contractions.length > 0;
    ui.undo.textContent = state.activeStart !== null ? 'Cancel current' : 'Undo last';
    ui.undo.disabled = state.activeStart === null && !has;
    ui.share.disabled = !has;
    ui.export.disabled = !has;
    ui.clear.disabled = !has;
    document.querySelectorAll('[data-offset]').forEach(button => button.disabled = state.activeStart !== null);
  }

  function undo() {
    if (state.activeStart !== null) state.activeStart = null;
    else state.contractions.pop();
    save();
    render();
    notify('Last action undone');
  }

  function localInput(date) {
    const pad = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function openManual() {
    ui.start.value = localInput(new Date(Date.now() - 60000));
    ui.minutes.value = '1';
    ui.seconds.value = '0';
    ui.dialog.showModal();
  }

  function addManual(event) {
    event.preventDefault();
    const startTime = new Date(ui.start.value).getTime();
    const length = (Number(ui.minutes.value || 0) * 60 + Number(ui.seconds.value || 0)) * 1000;
    if (!Number.isFinite(startTime) || length < 1000 || startTime + length > Date.now() + 60000) {
      notify('Check the start time and duration');
      return;
    }
    state.contractions.push({ id: id(), start: startTime, end: startTime + length });
    save();
    ui.dialog.close();
    render();
    notify('Contraction added');
  }

  function summary() {
    const lines = [`Contractions recorded: ${state.contractions.length}`];
    state.contractions.slice(-10).reverse().forEach(x => lines.push(`${clock(x.start)} — ${duration(x.end - x.start)}`));
    return lines.join('\n');
  }

  async function share() {
    const text = summary();
    try {
      if (navigator.share) await navigator.share({ title: 'Contraction summary', text });
      else { await navigator.clipboard.writeText(text); notify('Summary copied'); }
    } catch (error) {
      if (error.name !== 'AbortError') notify('Could not share summary');
    }
  }

  function exportCsv() {
    const rows = [['Number', 'Start', 'End', 'Duration seconds']];
    state.contractions.forEach((x, i) => rows.push([i + 1, new Date(x.start).toISOString(), new Date(x.end).toISOString(), Math.round((x.end - x.start) / 1000)]));
    const blob = new Blob([rows.map(row => row.join(',')).join('\n')], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `contractions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  ui.main.addEventListener('click', () => state.activeStart === null ? start() : stop());
  document.querySelectorAll('[data-offset]').forEach(button => button.addEventListener('click', () => start(Number(button.dataset.offset))));
  ui.list.addEventListener('click', event => {
    const button = event.target.closest('[data-delete]');
    if (!button || !confirm('Delete this contraction?')) return;
    state.contractions = state.contractions.filter(x => x.id !== button.dataset.delete);
    save(); render();
  });
  ui.undo.addEventListener('click', undo);
  ui.manual.addEventListener('click', openManual);
  ui.cancel.addEventListener('click', () => ui.dialog.close());
  ui.form.addEventListener('submit', addManual);
  ui.share.addEventListener('click', share);
  ui.export.addEventListener('click', exportCsv);
  ui.clear.addEventListener('click', () => {
    if (!confirm('Clear all contraction history?')) return;
    state.contractions = []; save(); render();
  });
  window.addEventListener('storage', event => { if (event.key === KEY) { state = load(); render(); } });

  setInterval(renderTimer, 250);
  render();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
