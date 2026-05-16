import * as monaco from 'monaco-editor';
import { loadSettings, saveSettings, checkStatus } from './ollama.js';
import { shouldTrigger, isTypingFast } from './trigger.js';

const editorEl = document.getElementById('editor');

const editor = monaco.editor.create(editorEl, {
  value: 'package main\n\nfunc main() {\n\t\n}\n',
  language: 'go',
  theme: 'vs-dark',
  fontFamily: 'JetBrains Mono, monospace',
  fontSize: 14,
  tabSize: 4,
  insertSpaces: false,
  lineNumbers: 'on',
  minimap: { enabled: false },
  wordWrap: 'off',
  quickSuggestions: false,
  parameterHints: { enabled: false },
  suggestOnTriggerCharacters: false,
  snippetSuggestions: 'none',
  wordBasedSuggestions: 'off',
  contextmenu: false,
  automaticLayout: true,
  scrollBeyondLastLine: false,
  fixedOverflowWidgets: true,
  hover: { enabled: false },
  formatOnType: false,
  renderWhitespace: 'selection',
});

let triggerTimer = null;
editor.onDidChangeModelContent(() => {
  if (isTypingFast()) {
    clearTimeout(triggerTimer);
    return;
  }
  const pos = editor.getPosition();
  if (!pos) return;
  const model = editor.getModel();
  const lineContent = model.getLineContent(pos.lineNumber);
  const column = pos.column;
  const trimmed = lineContent.replace(/\s+$/, '');
  let delay = 300;
  if (/(?:^|\s)(func|struct|interface)\b$/.test(trimmed)) delay = 150;
  clearTimeout(triggerTimer);
  triggerTimer = setTimeout(() => {
    const cur = editor.getPosition();
    if (!cur || cur.lineNumber !== pos.lineNumber) return;
    if (shouldTrigger(lineContent, column)) {
      console.log('[Trigger]', lineContent);
      // Phase 5: call Ollama here
    }
  }, delay);
});

editorEl.classList.add('loaded');
const statusDot = document.getElementById('status-dot');
const statusText = document.getElementById('status-text');
const retryBtn = document.getElementById('retry-btn');
const details = document.getElementById('status-details');
const settingsBtn = document.getElementById('settings-btn');
const settingsPanel = document.getElementById('settings-panel');
const hostInput = document.getElementById('host-input');
const modelInput = document.getElementById('model-input');
const saveSettingsBtn = document.getElementById('save-settings');

let settings = loadSettings();
hostInput.value = settings.host;
modelInput.value = settings.model;

function render(state) {
  statusDot.className = '';
  details.innerHTML = '';
  details.classList.add('hidden');
  retryBtn.classList.add('hidden');

  if (state.status === 'ready') {
    statusDot.classList.add('green');
    statusText.textContent = 'Ollama connected';
  } else if (state.status === 'missing-model') {
    statusDot.classList.add('yellow');
    statusText.textContent = `Model ${state.model} not found`;
    retryBtn.classList.remove('hidden');
    details.classList.remove('hidden');
    details.innerHTML = `
      <p>Pull the model:</p>
      <pre><code>ollama pull ${state.model}</code></pre>
    `;
  } else {
    statusDot.classList.add('red');
    statusText.textContent = 'Ollama not found';
    retryBtn.classList.remove('hidden');
    details.classList.remove('hidden');
    details.innerHTML = `
      <p>Start Ollama and pull the model:</p>
      <pre><code>ollama serve
OLLAMA_ORIGINS="*" ollama serve
ollama pull ${settings.model}</code></pre>
    `;
  }
}

async function ping() {
  statusDot.className = 'yellow';
  statusText.textContent = 'Checking Ollama...';
  retryBtn.classList.add('hidden');
  render(await checkStatus(settings));
}

retryBtn.addEventListener('click', ping);

settingsBtn.addEventListener('click', () => settingsPanel.classList.toggle('hidden'));

saveSettingsBtn.addEventListener('click', () => {
  settings = {
    host: hostInput.value.trim(),
    model: modelInput.value.trim()
  };
  saveSettings(settings);
  settingsPanel.classList.add('hidden');
  ping();
});

ping();