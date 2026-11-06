// The build takes these choices from the renderer's bundled languages and labels.
declare const codeStudioLanguages: { value: string; label: string; aliases: string[] }[];
const languageNames = codeStudioLanguages.flatMap(choice => [choice.value, ...choice.aliases]);
const observedEditors = new WeakSet<object>();

export function addLanguagePicker(editor: any): void {
  if (!editor?.on || !editor.getContainer || observedEditors.has(editor)) return;
  observedEditors.add(editor);
  const onOpen = (event: any) => {
    const dialogApi = event.dialog;
    const data = dialogApi?.getData?.();
    if (typeof data?.languageInput !== 'string' || typeof data?.codeTextArea !== 'string') return;
    const doc: Document = editor.getContainer().ownerDocument;
    // Only Joplin's code source dialog has both fields; leave other dialogs alone.
    const dialog = [...doc.querySelectorAll<HTMLElement>('.tox-dialog')].reverse()
      .find(node => node.querySelector('textarea.tox-textarea'));
    if (!dialog) return;
    const inputs = dialog.querySelectorAll<HTMLInputElement>('input.tox-textfield');
    if (inputs.length !== 1 || inputs[0].disabled || inputs[0].readOnly || inputs[0].hasAttribute('list')) return;
    const input = inputs[0];
    if (input.dataset.csLanguagePicker) return;
    input.dataset.csLanguagePicker = 'true';
    const group = input.parentElement!;
    group.style.position = 'relative';
    const list = doc.createElement('div');
    list.id = input.id + '-code-studio-languages';
    list.className = 'tox-menu tox-collection tox-collection--list';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Languages');
    list.style.cssText = 'position:absolute;top:100%;left:0;right:0;max-height:240px;overflow-y:auto;z-index:10;display:none;';
    list.hidden = true;
    const arrow = doc.createElement('button');
    arrow.type = 'button';
    arrow.tabIndex = -1;
    arrow.className = 'tox-button tox-button--naked';
    arrow.textContent = '▾';
    arrow.setAttribute('aria-label', 'Show language choices');
    arrow.setAttribute('aria-controls', list.id);
    arrow.style.cssText = `position:absolute;right:4px;top:${input.offsetTop}px;height:${input.offsetHeight}px;min-width:28px;padding:0 6px;`;
    input.style.paddingRight = '36px';
    group.append(arrow, list);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'both');
    input.setAttribute('aria-controls', list.id);
    input.setAttribute('autocomplete', 'off');
    input.placeholder = 'Type a language or choose from the list';
    let choices: typeof codeStudioLanguages = [];
    let active = -1;
    let completionPrefix: string | undefined;
    let consumedKey: string | undefined;
    const close = () => {
      list.hidden = true;
      list.style.display = 'none';
      input.setAttribute('aria-expanded', 'false');
      arrow.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
      completionPrefix = undefined;
    };
    const choose = (index: number) => {
      if (!choices[index]) return;
      dialogApi.setData({ languageInput: choices[index].value });
      input.focus();
      close();
    };
    const show = (query = input.value) => {
      completionPrefix = undefined;
      const search = query.trim().toLowerCase();
      const rank = (choice: typeof codeStudioLanguages[number]) => {
        const value = choice.value.toLowerCase(), label = choice.label.toLowerCase();
        if (value === search || choice.aliases.some(alias => alias.toLowerCase() === search)) return 0;
        if (label.startsWith(search)) return 1;
        return value.startsWith(search) || choice.aliases.some(alias => alias.toLowerCase().startsWith(search)) ? 2 : 3;
      };
      choices = codeStudioLanguages.filter(choice => [choice.value, choice.label, ...choice.aliases]
        .some(name => name.toLowerCase().includes(search)))
        .sort((a, b) => rank(a) - rank(b));
      active = -1;
      list.replaceChildren();
      for (const [index, choice] of choices.entries()) {
        const option = doc.createElement('div');
        option.id = list.id + '-' + index;
        option.className = 'tox-collection__item';
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.style.cssText = 'cursor:pointer;white-space:normal;padding:6px 10px;';
        option.textContent = choice.label.toLowerCase() === choice.value.toLowerCase() ? choice.label : `${choice.label} (${choice.value})`;
        option.addEventListener('click', () => choose(index));
        list.append(option);
      }
      if (!choices.length) {
        const message = doc.createElement('div');
        message.textContent = 'No matches — you can use your typed label.';
        message.setAttribute('role', 'status');
        message.style.padding = '8px 10px';
        list.append(message);
      }
      list.hidden = false;
      list.style.display = 'block';
      input.setAttribute('aria-expanded', 'true');
      arrow.setAttribute('aria-expanded', 'true');
      input.removeAttribute('aria-activedescendant');
    };
    const highlight = () => {
      [...list.children].forEach((node, index) => {
        node.classList.toggle('tox-collection__item--active', index === active);
        node.setAttribute('aria-selected', String(index === active));
      });
      const option = list.children[active];
      if (option) {
        input.setAttribute('aria-activedescendant', option.id);
        option.scrollIntoView({ block: 'nearest' });
      }
    };
    list.addEventListener('mousedown', event => event.preventDefault());
    arrow.addEventListener('mousedown', event => event.preventDefault());
    arrow.addEventListener('click', () => {
      const wasOpen = !list.hidden;
      input.focus();
      if (wasOpen) close(); else show('');
    });
    input.addEventListener('input', event => {
      completionPrefix = undefined;
      if (!list.hidden) { show(); return; }
      const typed = input.value;
      const inputEvent = event as InputEvent;
      if (inputEvent.isComposing || inputEvent.inputType !== 'insertText' || !typed
        || input.selectionStart !== typed.length || input.selectionEnd !== typed.length) return;
      const prefix = typed.toLowerCase();
      if (languageNames.some(name => name.toLowerCase() === prefix)) return;
      const match = languageNames.find(name => name.toLowerCase().startsWith(prefix));
      if (!match) return;
      dialogApi.setData({ languageInput: typed + match.slice(typed.length) });
      completionPrefix = typed;
      input.setSelectionRange(typed.length, input.value.length);
    });
    input.addEventListener('blur', close);
    input.addEventListener('keydown', event => {
      if (event.isComposing) return;
      const completing = completionPrefix !== undefined && input.selectionStart === completionPrefix.length
        && input.selectionEnd === input.value.length;
      if (completing && (event.key === 'Enter' || event.key === 'Escape')) {
        event.preventDefault(); event.stopImmediatePropagation();
        consumedKey = event.key;
        if (event.key === 'Escape') {
          dialogApi.setData({ languageInput: completionPrefix });
        }
        completionPrefix = undefined;
        input.setSelectionRange(input.value.length, input.value.length);
        return;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault(); event.stopImmediatePropagation();
        consumedKey = event.key;
        if (list.hidden) show();
        if (choices.length) {
          active = event.key === 'ArrowDown' ? (active + 1) % choices.length : (active < 0 ? choices.length : active) - 1;
          highlight();
        }
      } else if (event.key === 'Enter' && !list.hidden && active >= 0) {
        event.preventDefault(); event.stopImmediatePropagation();
        consumedKey = event.key;
        choose(active);
      } else if (event.key === 'Escape' && !list.hidden) {
        event.preventDefault(); event.stopImmediatePropagation();
        consumedKey = event.key;
        close();
      } else if (event.key === 'Enter' || event.key === 'Tab') close();
    });
    input.addEventListener('keyup', event => {
      // TinyMCE closes dialogs on Escape keyup even when keydown was consumed.
      if (event.key !== consumedKey) return;
      event.preventDefault(); event.stopImmediatePropagation();
      consumedKey = undefined;
    });
    close();
  };
  editor.on('OpenWindow', onOpen);
  window.addEventListener('unload', () => editor.off?.('OpenWindow', onOpen), { once: true });
}
