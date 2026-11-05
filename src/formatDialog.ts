// Capture scrolls on the document so reopening the dialog can replace its HTML.
if (!(window as any).__codeStudioFormatScrollReady) {
  (window as any).__codeStudioFormatScrollReady = true;
  const synced = new WeakMap<HTMLElement, number>();
  document.addEventListener('scroll', event => {
    const source = event.target;
    if (!(source instanceof HTMLElement) || !source.matches('.cs-format-column pre')) return;
    if (synced.get(source) === source.scrollTop) { synced.delete(source); return; }
    for (const target of source.closest('.cs-format-columns')!.querySelectorAll('pre')) {
      if (target === source || target.scrollTop === source.scrollTop) continue;
      target.scrollTop = source.scrollTop;
      synced.set(target, target.scrollTop);
    }
  }, true);
}
