import type { EngineInterface, Register } from 'claude-code'

// Claude's built-in browser has no extension or content-blocking support, so this
// mod runs a small script in the page just before Claude looks at it. Ads may
// still download; what goes away is the ad markup, the empty slots and the
// screen space they take, which is what costs tokens.
const SERVER = 'Claude_Browser'
const PREFIX = `mcp__${SERVER}__`
const OFF_KEY = 'off'

const SWEEP = String.raw`(() => { try {
  if (window.__claudeAdRemover) { window.__claudeAdRemover(); return 'ads:' + window.__claudeAdRemoverCount; }
  const HOSTS = /(^|\.)(doubleclick\.net|googlesyndication\.com|googleadservices\.com|adnxs\.com|amazon-adsystem\.com|taboola\.com|outbrain\.com|criteo\.(com|net)|rubiconproject\.com|pubmatic\.com|openx\.net|casalemedia\.com|adsafeprotected\.com|moatads\.com|3lift\.com|sharethrough\.com|teads\.tv|smartadserver\.com|yieldmo\.com|media\.net|adform\.net|indexww\.com|serving-sys\.com|mgid\.com|revcontent\.com)$/i;
  const TOKEN = /(^|[-_ ])(ad|ads|adv|advert|adverts|advertisement|advertising|adslot|adunit|adbox|adhesion|dfp|gpt-ad|sponsored-ad)($|[-_ ])/i;
  const SURE = 'ins.adsbygoogle,[id^="google_ads_"],[id^="div-gpt-ad"],[data-google-query-id],[data-ad-slot],[data-ad-client],[data-ad-unit],[data-adunit],.taboola,[id^="taboola-"],.OUTBRAIN,[class^="trc_"],[aria-label="Advertisement" i],#tads,#bottomads,.b_ad,ytd-ad-slot-renderer,ytd-in-feed-ad-layout-renderer,#player-ads,#masthead-ad,shreddit-ad-post,[data-component-type="sp-sponsored-result"]';
  const KEEP = 'input,textarea,select,form,main,article';
  window.__claudeAdRemoverCount = 0;
  const drop = (el, sure) => {
    if (el === document.body || el === document.documentElement) return;
    if (el.querySelector(KEEP) || el.closest('form')) return;
    if (!sure && el.textContent.length > 400) return;
    if (sure && el.textContent.length > 5000) return;
    el.remove();
    window.__claudeAdRemoverCount++;
  };
  const sweep = () => {
    document.querySelectorAll(SURE).forEach(el => drop(el, true));
    document.querySelectorAll('iframe[src]').forEach(el => {
      try { if (HOSTS.test(new URL(el.src).hostname)) drop(el, true); } catch {}
    });
    document.querySelectorAll('div,aside,section,ins,figure,span[id]').forEach(el => {
      if (TOKEN.test(el.id + ' ' + (el.getAttribute('class') || ''))) drop(el, false);
    });
  };
  window.__claudeAdRemover = sweep;
  sweep();
  let waiting = false;
  new MutationObserver(() => {
    if (waiting) return;
    waiting = true;
    setTimeout(() => { waiting = false; sweep(); }, 250);
  }).observe(document.documentElement, { childList: true, subtree: true });
  return 'ads:' + window.__claudeAdRemoverCount;
} catch (err) { return 'ads:error'; } })()`

// What Claude reads the page through, plus navigate so the observer starts early.
const LOOKS = new Set(['read_page', 'get_page_text', 'find'])
const LOOK_ACTIONS = new Set(['screenshot', 'zoom'])

const looks = (name: string, input: Record<string, unknown>) =>
  LOOKS.has(name) || (name === 'computer' && LOOK_ACTIONS.has(String(input.action)))

type BatchItem = { name: string; input: Record<string, unknown> }

const sweepStep = (input: Record<string, unknown>): BatchItem => ({
  name: 'javascript_tool',
  input: {
    action: 'javascript_exec',
    text: SWEEP,
    ...(input.tabId === undefined ? {} : { tabId: input.tabId }),
  },
})

async function isOff($: EngineInterface) {
  return (await $.store.get(OFF_KEY)) === true
}

async function sweepNow($: EngineInterface, tabId: unknown) {
  // A failed sweep must never get in the way of what Claude actually asked for,
  // but it is recorded so that a mod that has stopped working can be told apart
  // from a page with no ads.
  let outcome: string
  try {
    const res = await $.mcp.call(SERVER, 'javascript_tool', {
      action: 'javascript_exec',
      text: SWEEP,
      ...(tabId === undefined ? {} : { tabId }),
    })
    outcome = `${res.isError ? 'tool-error' : 'ok'}: ${JSON.stringify(res.content).slice(0, 200)}`
  } catch (err) {
    outcome = `threw: ${String(err).slice(0, 200)}`
  }
  try {
    await $.store.set('lastSweep', { at: await $.clock.now(), outcome })
  } catch {}
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'browser-ads',
      description: 'Turn ad removal in the built-in browser on or off',
    })

    return next(e)
  })

  on('command.run', { command: 'browser-ads' }, async $ => {
    const off = !(await isOff($))
    await $.store.set(OFF_KEY, off)

    return {
      text: off
        ? 'Ad removal is off. Pages already swept stay swept until reloaded.'
        : 'Ad removal is on.',
    }
  })

  for (const name of ['read_page', 'get_page_text', 'find', 'computer'] as const) {
    on('tool.call', { tool: `${PREFIX}${name}` }, async ($, e, next) => {
      if (looks(name, e) && !(await isOff($))) await sweepNow($, e.tabId)

      return next(e)
    })
  }

  on('tool.call', { tool: `${PREFIX}navigate` }, async ($, e, next) => {
    const went = await next(e)
    if (!(await isOff($))) await sweepNow($, e.tabId)

    return went
  })

  // Inside a batch the page changes between steps, so the sweep goes in as a step.
  on('tool.call', { tool: `${PREFIX}browser_batch` }, async ($, e, next) => {
    if (await isOff($)) return next(e)

    const actions = Array.isArray(e.actions) ? (e.actions as BatchItem[]) : []
    const swept = actions.flatMap(item =>
      looks(item.name, item.input ?? {}) ? [sweepStep(item.input ?? {}), item] : [item],
    )

    return next({ ...e, actions: swept })
  })
}
