import type {
  StaticGenerateRenderOptions,
  StaticGenerateOptions,
  StaticGenerateResult,
} from './types';

// @builder.io/qwik-city/static

/**
 * Use this function when SSG should be generated from another module, such as a Vite plugin.
 * This function's should be passed the paths of the entry module and Qwik City Plan.
 * @alpha
 */
export async function generate(opts: StaticGenerateOptions) {
  const ssgPlatform = await getEntryModule();
  const result: StaticGenerateResult = await ssgPlatform.generate(opts);
  return result;
}

export { StaticGenerateOptions, StaticGenerateRenderOptions, StaticGenerateResult };

function getEntryModulePath() {
  if (isDeno()) {
    return './deno.mjs';
  }
  if (isNode()) {
    if (isCjs()) {
      return './node.cjs';
    }
    return './node.mjs';
  }
  throw new Error(`Unsupported platform`);
}

function getEntryModule() {
  const entryModule = getEntryModulePath();
  if (isCjs()) {
    return require(entryModule);
  }
  return import(entryModule);
}

function isDeno() {
  return typeof Deno !== 'undefined';
}

function isNode() {
  return !isDeno() && typeof process !== 'undefined' && !!process.versions?.node;
}

function isCjs() {
  const req = 'require';
  return isNode() && typeof globalThis[req] === 'function';
}

declare const Deno: any;
