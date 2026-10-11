// Ties the app's screens to the browser history, so the phone's back button moves back through
// the app instead of leaving it. The history always starts with the home screen, then at most
// one tab on top of it, then the recipes opened from there, then a guard entry while a sheet
// is open: back closes the sheet, then the recipe, then the tab, and only leaves the app from home.

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Tab } from '../ctx';

export interface Nav { tab: Tab; recipe?: string }

/** One history entry: a screen, and how far above the home entry it sits. */
interface Entry { nav: Nav; depth: number; sheet?: boolean }

const HOME: Nav = { tab: 'home' };

function current(): Entry | null {
  const s = history.state as { rf?: Entry } | null;
  return s?.rf ?? null;
}

const write = (how: 'push' | 'replace', e: Entry) =>
  how === 'push' ? history.pushState({ rf: e }, '', '/') : history.replaceState({ rf: e }, '', '/');

// What the history should show once a backward jump lands; set while it is on its way.
let pending: Entry | null = null;
// The next popstate is a sheet's guard being removed after the sheet closed itself.
let skipNext = false;
// Open sheets, innermost last: back closes the last one.
const sheets: (() => void)[] = [];

/**
 * Keeps the current screen in step with the history. `go` moves to a tab, which sits right on
 * top of home whatever came before; `open` opens a recipe over the current screen, and `close`
 * leaves it the way the back button would.
 */
export function useNav(initial?: Nav) {
  const [nav, setNav] = useState<Nav>(() => {
    const e = current();
    return initial ?? (e && !e.sheet ? e.nav : HOME);
  });

  useEffect(() => {
    const e = current();
    if (initial && !e?.depth) {
      write('replace', { nav: HOME, depth: 0 });
      if (initial.tab !== 'home') write('push', { nav: initial, depth: 1 });
    } else if (!e) write('replace', { nav: HOME, depth: 0 });
    else if (e.sheet) history.back(); // reloaded with a sheet open: the sheet is gone

    const onPop = () => {
      if (skipNext) { skipNext = false; return; }
      const e = current();
      if (pending) {
        const p = pending;
        pending = null;
        write('replace', p);
        setNav(p.nav);
        return;
      }
      if (sheets.length) {
        sheets[sheets.length - 1]();
        if (e && !e.sheet) setNav(e.nav);
        return;
      }
      // A guard left behind by a sheet that closed while moving elsewhere.
      if (e?.sheet) { history.back(); return; }
      setNav(e?.nav ?? HOME);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const go = useCallback((tab: Tab, recipe?: string) => {
    const next: Nav = recipe ? { tab, recipe } : { tab };
    setNav(next);
    const top = current() ?? { nav: HOME, depth: 0 };
    if (recipe) {
      // Over the current screen; replaces a recipe or a sheet's guard already on top.
      if (top.sheet || top.nav.recipe) write('replace', { nav: next, depth: top.depth });
      else write('push', { nav: next, depth: top.depth + 1 });
      return;
    }
    const depth = tab === 'home' ? 0 : 1;
    if (top.depth < depth) write('push', { nav: next, depth });
    else if (top.depth === depth) write('replace', { nav: next, depth });
    else {
      pending = { nav: next, depth };
      history.go(depth - top.depth);
    }
  }, []);

  const close = useCallback(() => {
    const top = current();
    if (top?.nav.recipe && top.depth > 0) history.back();
    else go(nav.tab);
  }, [go, nav.tab]);

  return { nav, go, close };
}

/**
 * Lets the back button close a sheet: while one is open, a guard entry sits on top of the
 * history. A sheet closed some other way removes its guard itself.
 */
export function useSheetBack(onClose: () => void) {
  const latest = useRef(onClose);
  latest.current = onClose;
  useEffect(() => {
    const close = () => latest.current();
    sheets.push(close);
    if (!current()?.sheet) {
      const top = current() ?? { nav: HOME, depth: 0 };
      write('push', { nav: top.nav, depth: top.depth + 1, sheet: true });
    }
    return () => {
      sheets.splice(sheets.indexOf(close), 1);
      // Later, in case another sheet opens right away or the app is moving elsewhere.
      window.setTimeout(() => {
        if (sheets.length || pending || !current()?.sheet) return;
        skipNext = true;
        history.back();
      });
    };
  }, []);
}
