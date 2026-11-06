import { safeFence } from './formatLanguages';
import { bbcMode, hasRetro, isBbcMode, retroMachine, setBbcMode, setRetroInfo } from './retro';
import { addLanguagePicker } from './languagePicker';

interface Reply { ok?: boolean; action?: string; error?: string; formatted?: string; rowsHtml?: string; lineCount?: number; info?: string }
declare const webviewApi: undefined | { postMessage(id: string, message: unknown): Promise<Reply> };
const formattingButtons = new WeakSet<HTMLButtonElement>();
const observedEditors = new WeakSet<object>();
const savingDisplay = new WeakSet<HTMLElement>();

function richTextEditor(): any {
  try {
    const tiny = (window.parent as any).tinymce;
    if (tiny?.activeEditor?.getDoc() === document) return tiny.activeEditor;
    return tiny?.get?.().find((editor: any) => editor.getDoc() === document);
  } catch { return undefined; }
}

function syncRetro(card: HTMLElement): void {
  const source = card.querySelector('.joplin-source');
  const opening = source?.getAttribute('data-joplin-source-open');
  const info = opening?.match(/^(?:`{3,}|~{3,})([^\r\n]*)/)?.[1] ?? card.dataset.csInfo ?? '';
  // Joplin's source dialog replaces the contents but retains the outer card's old attributes.
  card.dataset.csLanguage = source?.getAttribute('data-joplin-language') ?? card.dataset.csLanguage ?? '';
  card.dataset.csInfo = info;
  const machine = retroMachine(card.dataset.csLanguage || '');
  const enabled = !!machine && hasRetro(info);
  if (enabled) card.dataset.csRetro = machine;
  else delete card.dataset.csRetro;
  if (enabled && machine === 'bbc') card.dataset.csRetroMode = bbcMode(info);
  else delete card.dataset.csRetroMode;
  card.querySelector('.cs-retro-button')?.setAttribute('aria-checked', String(enabled));
  const select = card.querySelector<HTMLSelectElement>('.cs-retro-mode');
  if (select) { select.hidden = !enabled; select.value = bbcMode(info); }
}

function observeEditor(editor: any): void {
  if (!editor || observedEditors.has(editor)) return;
  observedEditors.add(editor);
  editor.on?.('Undo Redo', () => {
    // Undo can restore old copies of generated controls along with the code.
    document.querySelectorAll<HTMLButtonElement>('.cs-format-button').forEach(control => {
      control.disabled = false;
      const label = control.querySelector('span');
      if (label) label.textContent = 'Format';
    });
    document.querySelectorAll('.cs-status').forEach(message => {
      message.textContent = '';
      message.classList.remove('cs-visible-status');
    });
    document.querySelectorAll<HTMLElement>('.cs-card').forEach(syncRetro);
  });
}

async function saveRetro(card: HTMLElement, mode?: string): Promise<void> {
  syncRetro(card);
  const source = card.querySelector<HTMLElement>('.joplin-source');
  const status = card.querySelector<HTMLElement>('.cs-status');
  if (!source || !status || !retroMachine(card.dataset.csLanguage || '') || savingDisplay.has(card)) { syncRetro(card); return; }
  savingDisplay.add(card);
  const enabled = mode === undefined ? !hasRetro(card.dataset.csInfo || '') : hasRetro(card.dataset.csInfo || '');
  const info = mode === undefined ? setRetroInfo(card.dataset.csInfo || '', enabled) : setBbcMode(card.dataset.csInfo || '', mode);
  const editor = richTextEditor();
  const update = () => {
    const opening = source.getAttribute('data-joplin-source-open') || '';
    if (!/^(?:`{3,}|~{3,})[^\r\n]*\n$/.test(opening)) throw new Error('The code fence could not be read. Reopen this note and try again.');
    source.setAttribute('data-joplin-source-open', opening.replace(/^((?:`{3,}|~{3,}))[^\r\n]*/, (_, markup) => markup + info));
    syncRetro(card);
  };
  status.textContent = '';
  status.classList.remove('cs-visible-status');
  try {
    if (editor) {
      if (editor.mode?.isReadOnly?.()) throw new Error('This note is read-only.');
      observeEditor(editor);
      editor.undoManager.transact(update);
      editor.fire('joplinChange');
      editor.nodeChanged();
    } else {
      if (typeof webviewApi === 'undefined') throw new Error('Open this note in Joplin to save Retro display.');
      const reply = await webviewApi.postMessage(card.dataset.csId || 'codeStudioRenderer', {
        action: 'retro', text: source.textContent || '', info: card.dataset.csInfo || '',
        language: card.dataset.csLanguage || '', fenceIndex: Number(card.dataset.csFenceIndex), enabled, mode,
      });
      if (!reply?.ok || reply.info !== info) throw new Error(reply?.error || 'Could not save Retro display.');
      if (card.isConnected) update();
    }
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'Could not save Retro display.';
    status.classList.add('cs-visible-status');
  } finally { savingDisplay.delete(card); syncRetro(card); }
}

async function previewFormatting(button: HTMLButtonElement, card: HTMLElement): Promise<void> {
  if (typeof webviewApi === 'undefined') return;
  syncRetro(card);
  const source = card.querySelector<HTMLElement>('.joplin-source');
  const status = card.querySelector<HTMLElement>('.cs-status');
  if (!source || !status) return;
  const original = source.textContent || '';
  const caption = button.querySelector('span');
  const editor = richTextEditor();
  if (formattingButtons.has(button)) return;
  formattingButtons.add(button);
  observeEditor(editor);
  // Rich Text includes generated HTML in its undo snapshots. Keep its controls
  // unchanged while the native dialog is open; track pending work separately.
  if (!editor) {
    button.disabled = true;
    if (caption) caption.textContent = 'Formatting…';
  }
  status.textContent = '';
  status.classList.remove('cs-visible-status');
  try {
    const reply = await webviewApi.postMessage(card.dataset.csId || 'codeStudioRenderer', {
      action: 'format', text: original, info: card.dataset.csInfo || '',
      language: card.dataset.csLanguage || '', fenceIndex: Number(card.dataset.csFenceIndex),
      editor: editor ? 'rich' : 'markdown',
    });
    // Restore transient controls before creating an editor undo snapshot.
    button.disabled = false;
    if (caption) caption.textContent = 'Format';
    if (!reply?.ok) throw new Error(reply?.error || 'Could not format this code.');
    if (!card.isConnected) return;
    if (reply.action === 'apply') {
      if (!editor || editor.getDoc() !== document || source.textContent !== original) {
        throw new Error('The code changed. Choose Format again.');
      }
      if (editor.mode?.isReadOnly?.()) throw new Error('This note is read-only. Use Copy formatted instead.');
      if (typeof reply.formatted !== 'string' || typeof reply.rowsHtml !== 'string') throw new Error('The formatted code could not be read.');
      const code = card.querySelector('.cs-code code');
      if (!code) throw new Error('The code block is no longer available.');
      editor.undoManager.transact(() => {
        const opening = source.getAttribute('data-joplin-source-open') || '';
        const oldMarkup = opening.match(/^(`{3,}|~{3,})/)?.[0];
        if (oldMarkup) {
          const markup = safeFence(oldMarkup, reply.formatted!);
          source.setAttribute('data-joplin-source-open', markup + opening.slice(oldMarkup.length));
          source.setAttribute('data-joplin-source-close', (source.getAttribute('data-joplin-source-close') || oldMarkup).replace(oldMarkup, markup));
        }
        source.textContent = reply.formatted!;
        code.innerHTML = reply.rowsHtml!;
        card.style.setProperty('--cs-gutter', `${Math.max(2, String(reply.lineCount || 1).length)}ch`);
      });
      editor.fire('joplinChange');
      editor.nodeChanged();
    }
    const messages: Record<string, string> = {
      unchanged: 'Already formatted.', apply: 'Formatting applied. Use Undo to restore the original.',
      applied: 'Formatting applied. Use Undo to restore the original.',
      copyFormatted: 'Formatted code copied. Your note is unchanged.',
      copyOriginal: 'Original code copied. Your note is unchanged.',
    };
    status.textContent = messages[reply.action || ''] || '';
  } catch (error) {
    status.textContent = error instanceof Error ? error.message : 'The code could not be formatted.';
  } finally {
    formattingButtons.delete(button);
    button.disabled = false;
    if (caption) caption.textContent = 'Format';
    status.classList.toggle('cs-visible-status', !!status.textContent);
  }
}

// Delegation survives Joplin's in-place note refreshes without accumulating handlers.
const stateKey = '__codeStudioViewer';
const host = window as unknown as Record<string, unknown>;
if (!host[stateKey]) {
  host[stateKey] = true;
  const refreshCards = () => document.querySelectorAll<HTMLElement>('.cs-card').forEach(syncRetro);
  refreshCards();
  document.addEventListener('joplin-noteDidUpdate', refreshCards);
  const attachLanguagePicker = () => addLanguagePicker(richTextEditor());
  attachLanguagePicker();
  requestAnimationFrame(attachLanguagePicker);
  document.addEventListener('focusin', attachLanguagePicker, true);
  document.addEventListener('dblclick', attachLanguagePicker, true);
  const timers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();
  // Keep the editor's block selection and source-edit gestures off toolbar controls.
  for (const type of ['mousedown', 'mouseup', 'dblclick']) {
    document.addEventListener(type, event => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest('.cs-card button[data-cs-action], .cs-card select.cs-retro-mode');
      if (!control) return;
      if (!(control instanceof HTMLSelectElement)) event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }
  // TinyMCE handles Enter/Space itself, so activate card controls before the
  // editor treats those keys as editing commands.
  document.addEventListener('keydown', event => {
    if (event.target instanceof HTMLSelectElement && event.target.closest('.cs-card')) {
      event.stopImmediatePropagation();
      return;
    }
    if (!(event.target instanceof Element) || !['Enter', ' '].includes(event.key)) return;
    const button = event.target.closest<HTMLButtonElement>('.cs-card button[data-cs-action]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if (!event.repeat && !button.disabled) button.click();
  }, true);
  document.addEventListener('change', event => {
    const select = event.target;
    if (!(select instanceof HTMLSelectElement) || !select.matches('.cs-retro-mode')) return;
    const card = select.closest<HTMLElement>('.cs-card');
    if (!card) return;
    event.stopImmediatePropagation();
    if (isBbcMode(select.value)) void saveRetro(card, select.value);
    else syncRetro(card);
  }, true);
  document.addEventListener('click', async event => {
    if (!(event.target instanceof Element)) return;
    if (event.target.closest('.cs-card select.cs-retro-mode')) { event.stopImmediatePropagation(); return; }
    const button = event.target.closest<HTMLButtonElement>('button[data-cs-action]');
    const card = button?.closest<HTMLElement>('.cs-card');
    if (!button || !card) return;
    event.preventDefault();
    event.stopPropagation();
    if (button.dataset.csAction === 'retro') {
      await saveRetro(card);
      return;
    }
    if (button.dataset.csAction === 'wrap') {
      const enabled = card.classList.toggle('cs-wrap');
      button.setAttribute('aria-pressed', String(enabled));
      return;
    }
    if (button.dataset.csAction === 'format') {
      if (!button.disabled) await previewFormatting(button, card);
      return;
    }
    if (button.dataset.csAction !== 'copy' || button.disabled) return;
    const source = card.querySelector('.joplin-source');
    if (!source) return;
    const text = source.textContent || '';
    const caption = button.querySelector('span');
    const status = card.querySelector('.cs-status');
    clearTimeout(timers.get(button));
    button.disabled = true;
    try {
      if (typeof webviewApi !== 'undefined') {
        const reply = await webviewApi.postMessage(card.dataset.csId || 'codeStudioRenderer', { action: 'copy', text });
        if (!reply?.ok) throw new Error('Copy failed');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Standalone HTML and older webviews may lack the Clipboard API.
        const textarea = document.createElement('textarea');
        const previousFocus = document.activeElement as HTMLElement | null;
        textarea.value = text;
        textarea.style.cssText = 'position:fixed;left:-9999px;top:0';
        document.body.append(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        textarea.remove();
        previousFocus?.focus();
        if (!copied) throw new Error('Clipboard unavailable');
      }
      if (caption) caption.textContent = 'Copied';
      button.classList.add('cs-copied');
      if (status) status.textContent = 'Code copied to clipboard';
    } catch {
      if (caption) caption.textContent = 'Retry';
      if (status) status.textContent = 'Could not copy. Select the code and copy it manually.';
    } finally {
      button.disabled = false;
      timers.set(button, setTimeout(() => {
        if (caption) caption.textContent = 'Copy';
        button.classList.remove('cs-copied');
        if (status) status.textContent = '';
      }, 2000));
    }
  }, true);
}
