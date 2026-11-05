import { replaceFence } from './replaceFence';
import type { FormatTarget } from './formatLanguages';

export default function codeStudioEditor() {
  return {
    // The wrapper is a Joplin CodeMirror 6 wrapper, or the legacy CodeMirror constructor.
    plugin: (wrapper: any) => {
      if (wrapper.cm6) {
        wrapper.registerCommand('codeStudioFormatApply', (target: FormatTarget, formatted: string) => {
          const view = wrapper.editor;
          const change = replaceFence(view.state.doc.toString(), target, formatted);
          view.dispatch({ changes: change, userEvent: 'input.codeStudioFormat', scrollIntoView: false });
          return { ok: true };
        });
      } else if (wrapper.defineExtension) {
        wrapper.defineExtension('codeStudioFormatApply', function(this: any, target: FormatTarget, formatted: string) {
          const change = replaceFence(this.getValue(), target, formatted);
          this.replaceRange(change.insert, this.posFromIndex(change.from), this.posFromIndex(change.to), '+codeStudioFormat');
          return { ok: true };
        });
      }
    },
  };
}
