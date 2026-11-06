import joplin from 'api';
import { ContentScriptType, MenuItemLocation, SettingItemType } from 'api/types';
import { demoBody } from './demo';
import { formatCode, setFormatterAssetLoader } from './formatCode';
import { formatParser, FormatTarget } from './formatLanguages';
import { highlightCode, splitHighlightedLines } from './renderer';
import { formatPreview } from './formatPreview';
import { bbcMode, hasRetro, isBbcMode, retroMachine, setBbcMode, setRetroInfo } from './retro';

joplin.plugins.register({
  onStart: async () => {
    const installationDir = await joplin.plugins.installationDir();
    const fs = joplin.require('fs-extra');
    setFormatterAssetLoader(filename => fs.readFileSync(`${installationDir}/${filename}`));
    const formatDialog = await joplin.views.dialogs.create('codeStudioFormatPreview');
    await joplin.views.dialogs.setFitToContent(formatDialog, false);
    await joplin.views.dialogs.addScript(formatDialog, './formatDialog.css');
    await joplin.views.dialogs.addScript(formatDialog, './retro.css');
    await joplin.views.dialogs.addScript(formatDialog, './formatDialog.js');
    await joplin.views.dialogs.setButtons(formatDialog, [
      { id: 'ok', title: 'Apply formatting' }, { id: 'copyFormatted', title: 'Copy formatted' },
      { id: 'copyOriginal', title: 'Copy original' }, { id: 'cancel', title: 'Cancel' },
    ]);
    let formatInProgress = false;
    await joplin.settings.registerSection('codeStudio', {
      label: 'Code Block Studio', iconName: 'fas fa-code',
      description: 'Readable code cards in the rendered note. Copy always preserves the original code.',
    });
    await joplin.settings.registerSettings({
      lineNumbers: { value: true, type: SettingItemType.Bool, section: 'codeStudio', public: true,
        label: 'Show line numbers' },
      wrapLines: { value: false, type: SettingItemType.Bool, section: 'codeStudio', public: true,
        label: 'Wrap long lines by default', description: 'You can also toggle wrapping separately on each code card.' },
      fontSize: { value: 14, type: SettingItemType.Int, section: 'codeStudio', public: true,
        minimum: 10, maximum: 24, label: 'Code font size (pixels)' },
      autoDetect: { value: true, type: SettingItemType.Bool, section: 'codeStudio', public: true,
        label: 'Detect language when none is specified',
        description: 'Detection is a best guess. Specify a language after the opening backticks for accurate highlighting; use text for no highlighting.' },
      inlineStyle: { value: true, type: SettingItemType.Bool, section: 'codeStudio', public: true,
        label: 'Style short inline code snippets' },
      demoNoteId: { value: '', type: SettingItemType.String, public: false, label: 'Welcome note ID' },
    });
    await joplin.contentScripts.register(ContentScriptType.MarkdownItPlugin, 'codeStudioRenderer', './renderer.js');
    await joplin.contentScripts.register(ContentScriptType.CodeMirrorPlugin, 'codeStudioEditor', './editor.js');
    await joplin.contentScripts.onMessage('codeStudioRenderer', async (message: unknown) => {
      if (!message || typeof message !== 'object') throw new Error('Invalid Code Block Studio message');
      const m = message as Partial<FormatTarget> & { action?: string; editor?: string; enabled?: boolean; mode?: string };
      if (typeof m.text !== 'string') return { ok: false, error: 'The code could not be read.' };
      if (m.action === 'copy') {
        await joplin.clipboard.writeText(m.text);
        return { ok: true };
      }
      if (!['format', 'retro'].includes(m.action || '') || typeof m.language !== 'string' || !formatParser(m.language)
        || typeof m.info !== 'string' || !Number.isInteger(m.fenceIndex) || m.fenceIndex! < 0) {
        return { ok: false, error: 'Formatting is not available for this code block.' };
      }
      if (m.action === 'retro' && (!retroMachine(m.language) || typeof m.enabled !== 'boolean'
        || (m.mode !== undefined && (retroMachine(m.language) !== 'bbc' || !isBbcMode(m.mode))))) {
        return { ok: false, error: 'Retro display is not available for this code block.' };
      }
      if (formatInProgress) return { ok: false, error: 'A formatting preview is already open.' };
      formatInProgress = true;
      try {
        const note = await joplin.workspace.selectedNote();
        if (!note) throw new Error('Open a note before formatting code.');
        if (m.action === 'retro') {
          const toggled = setRetroInfo(m.info, m.enabled!);
          const info = m.mode === undefined ? toggled : setBbcMode(toggled, m.mode);
          const result = await joplin.commands.execute('editor.execCommand', {
            name: 'codeStudioFormatApply', args: [m as FormatTarget, m.text, info],
          });
          if (!result?.ok) throw new Error('The editor could not save Retro display. Open the Markdown editor and try again.');
          return { ok: true, info };
        }
        const formatted = await formatCode(m.text, m.language);
        if (formatted === m.text) return { ok: true, action: 'unchanged' };
        await joplin.views.dialogs.setHtml(formatDialog, formatPreview(m.text, formatted, m.language, hasRetro(m.info), bbcMode(m.info)));
        const choice = await joplin.views.dialogs.open(formatDialog);
        if (choice.id === 'copyOriginal' || choice.id === 'copyFormatted') {
          await joplin.clipboard.writeText(choice.id === 'copyOriginal' ? m.text : formatted);
          return { ok: true, action: choice.id };
        }
        if (choice.id !== 'ok') return { ok: true, action: 'cancelled' };
        if ((await joplin.workspace.selectedNote())?.id !== note.id) throw new Error('The note changed. Choose Format again in the current note.');
        if (m.editor === 'rich') {
          const rows = splitHighlightedLines(highlightCode(formatted.replace(/\n$/, ''), m.language, false).html);
          return { ok: true, action: 'apply', formatted, lineCount: rows.length,
            rowsHtml: rows.map((row, i) => `<span class="cs-line" data-line="${i + 1}"><span class="cs-line-text">${row}</span></span>`).join('\n') };
        }
        const result = await joplin.commands.execute('editor.execCommand', {
          name: 'codeStudioFormatApply', args: [m as FormatTarget, formatted],
        });
        if (!result?.ok) throw new Error('The editor could not apply formatting. Use Copy formatted or open the Markdown editor and try again.');
        return { ok: true, action: 'applied' };
      } catch (error) {
        return { ok: false, error: error instanceof Error ? error.message : 'The code could not be formatted.' };
      } finally { formatInProgress = false; }
    });
    await joplin.commands.register({
      name: 'codeStudioDemo', label: 'Code Block Studio: Open welcome and examples', iconName: 'fas fa-code',
      execute: async () => {
        const key = 'demoNoteId';
        let id = await joplin.settings.value(key) as string;
        if (id) {
          try { await joplin.data.get(['notes', id], { fields: ['id'] }); }
          catch { id = ''; }
        }
        if (!id) {
          const folder = await joplin.workspace.selectedFolder();
          const note = await joplin.data.post(['notes'], null, {
            title: 'Code Block Studio — Welcome & examples', body: demoBody,
            ...(folder ? { parent_id: folder.id } : {}),
          });
          id = note.id;
          await joplin.settings.setValue(key, id);
        }
        await joplin.commands.execute('openNote', id);
      },
    });
    await joplin.views.menuItems.create('codeStudioDemoMenu', 'codeStudioDemo', MenuItemLocation.Tools);
  },
});
