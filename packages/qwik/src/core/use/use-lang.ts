import { tryGetInvokeContext } from './use-core';

let _locale: string | undefined = undefined;

/**
 * Retrieve the current lang.
 *
 * If no current lang and there is no `defaultLang` the function throws an error.
 *
 * @returns  the lang.
 * @internal
 */
export function getLang(defaultLocale?: string): string {
  if (_locale === undefined) {
    const ctx = tryGetInvokeContext();
    if (ctx && ctx.$lang$) {
      return ctx.$lang$;
    }
    if (defaultLocale !== undefined) {
      return defaultLocale;
    }
    throw new Error('Reading `lang` outside of context.');
  }
  return _locale;
}

/**
 * Override the `getLang` with `lang` within the `fn` execution.
 *
 * @internal
 */
export function withLang<T>(lang: string, fn: () => T): T {
  const previousLang = _locale;
  try {
    _locale = lang;
    return fn();
  } finally {
    _locale = previousLang;
  }
}

/**
 * Globally set a lang.
 *
 * This can be used only in browser. Server execution requires that each
 * request could potentially be a different lang, therefore setting
 * a global lang would produce incorrect responses.
 *
 * @param lang
 */
export function setLang(lang: string): void {
  _locale = lang;
}
