import { replaceFence } from './replaceFence';
import type { FormatTarget } from './formatLanguages';

export default function codeStudioEditor() {
  return {
    // The wrapper is a Joplin CodeMirror 6 wrapper, or the legacy CodeMirror constructor.
    plugin: (wrapper: any) => {
      if (wrapper.cm6) {
        wrapper.registerCommand('codeStudioFormatApply', (target: FormatTarget, formatted: string, info = target.info) => {
          const view = wrapper.editor;
          if (view.state.readOnly) throw new Error('This note is read-only.');
          const change = replaceFence(view.state.doc.toString(), target, formatted, info);
          view.dispatch({ changes: change, userEvent: 'input.codeStudioFormat', scrollIntoView: false });
          return { ok: true };
        });
      } else if (wrapper.defineExtension) {
        wrapper.defineExtension('codeStudioFormatApply', function(this: any, target: FormatTarget, formatted: string, info = target.info) {
          if (this.getOption('readOnly')) throw new Error('This note is read-only.');
          const change = replaceFence(this.getValue(), target, formatted, info);
          this.replaceRange(change.insert, this.posFromIndex(change.from), this.posFromIndex(change.to), '+codeStudioFormat');
          return { ok: true };
        });
      }
    },
  };
}
