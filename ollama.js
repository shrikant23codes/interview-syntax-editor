const DEFAULTS = {
  host: 'http://localhost:11434',
  model: 'qwen2.5-coder:1.5b'
};

export function loadSettings() {
  try {
    return {
      host: localStorage.getItem('sa_host') || DEFAULTS.host,
      model: localStorage.getItem('sa_model') || DEFAULTS.model
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(settings) {
  localStorage.setItem('sa_host', settings.host);
  localStorage.setItem('sa_model', settings.model);
}

export async function checkStatus(settings) {
  const { host, model } = settings;
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 3000);
    const res = await fetch(`${host}/api/tags`, { signal: ctrl.signal });
    clearTimeout(to);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    const models = (data.models || []).map(m => m.name || m.model);
    if (models.includes(model)) return { status: 'ready', model, host };
    return { status: 'missing-model', model, host, models };
  } catch (err) {
    return {
      status: 'error',
      error: err.name === 'AbortError' ? 'Connection timed out' : err.message,
      host
    };
  }
}