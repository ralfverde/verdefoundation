import { EVENTS, track } from './analytics';

/* ---------------------------------------------------------------
   Data from the server (see Layout.astro)
   --------------------------------------------------------------- */
interface ClientEvent {
  slug: string;
  title: string;
  topic: string;
  date: string;
  dateLong: string;
  timeRange: string;
  time: string;
  place: string;
  description: string;
  url: string;
  absoluteUrl: string;
  icsUrl: string;
  mapsUrl: string;
  capacity: number | null;
  registrationOpen: boolean;
  agenda: { time: string; label: string }[];
}
interface ClientData {
  lang: 'es' | 'en';
  stripeReady: boolean;
  events: Record<string, ClientEvent>;
  t: {
    enToast: string;
    formError: string;
    countdownPast: string;
    countdownToday: string;
    countdownTomorrow: string;
    countdownDays: string;
    spotsLeft: string;
    waitlist: string;
    reserved: string;
    ticketCount: string;
    count1: string;
    countN: string;
    icsToast: string;
    shareText: string;
    donate: {
      impactOnce: string;
      impactMonthly: string;
      impacts: Record<string, string>;
      impactFallbackOne: string;
      impactFallbackMany: string;
      btnOnce: string;
      btnMonthly: string;
      notReady: string;
      checkoutError: string;
    };
  };
}

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const fmt = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));

const DATA: ClientData = JSON.parse($('#fv-data')?.textContent || '{}');
const T = DATA.t;

/* ---------------------------------------------------------------
   Toast
   --------------------------------------------------------------- */
let toastTimer: number | undefined;
function toast(msg: string) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-on');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => el.classList.remove('is-on'), 3400);
}

/* ---------------------------------------------------------------
   UTM capture (first landing page of the session)
   --------------------------------------------------------------- */
const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
function captureUtm(): Record<string, string> {
  const params = new URLSearchParams(location.search);
  const found: Record<string, string> = {};
  UTM_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) found[k] = v;
  });
  try {
    if (Object.keys(found).length) sessionStorage.setItem('fv-utm', JSON.stringify(found));
    return JSON.parse(sessionStorage.getItem('fv-utm') || '{}');
  } catch {
    return found;
  }
}
const UTM = captureUtm();
const REFERRER = (() => {
  try {
    if (!sessionStorage.getItem('fv-ref')) sessionStorage.setItem('fv-ref', document.referrer || '(direct)');
    return sessionStorage.getItem('fv-ref') || '';
  } catch {
    return document.referrer;
  }
})();

/* ---------------------------------------------------------------
   Header: burger menu, scroll shadow, language toggle
   --------------------------------------------------------------- */
const header = $('#site-header');
const burger = $('#burger');
function setNav(open: boolean) {
  if (!header || !burger) return;
  header.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', (open ? burger.dataset.labelClose : burger.dataset.labelOpen) || '');
}
burger?.addEventListener('click', () => setNav(!header?.classList.contains('is-open')));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && header?.classList.contains('is-open')) {
    setNav(false);
    burger?.focus();
  }
});
const onScroll = () => header?.classList.toggle('is-scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

$('[data-lang-en]')?.addEventListener('click', () => toast(T.enToast));

/* Announcement bar: remember the close for this session */
$('[data-announce-close]')?.addEventListener('click', () => {
  const bar = $('#announce');
  if (!bar) return;
  bar.hidden = true;
  try {
    sessionStorage.setItem('fv-announce', bar.dataset.announce || '');
  } catch {
    /* ignore */
  }
});

/* ---------------------------------------------------------------
   Countdowns ("Faltan N días"), refreshed against the visitor's clock
   in Miami time so a cached build never shows a stale number.
   --------------------------------------------------------------- */
function todayMiami(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}
function daysUntil(iso: string): number {
  const [ay, am, ad] = todayMiami().split('-').map(Number);
  const [by, bm, bd] = iso.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}
function countdownText(iso: string): string {
  const n = daysUntil(iso);
  if (n < 0) return T.countdownPast;
  if (n === 0) return T.countdownToday;
  if (n === 1) return T.countdownTomorrow;
  return fmt(T.countdownDays, { n });
}
$$('[data-countdown]').forEach((el) => {
  el.textContent = countdownText(el.dataset.countdown || '');
});

/* ---------------------------------------------------------------
   Capacity bars: live registered counts from /api/registrations
   --------------------------------------------------------------- */
function renderCapacity(counts: Record<string, number>) {
  $$('[data-cap]').forEach((el) => {
    const slug = el.dataset.cap || '';
    const capacity = Number(el.dataset.capacity);
    if (!(slug in counts) || !capacity) return;
    const registered = counts[slug];
    const left = Math.max(0, capacity - registered);
    const pct = Math.min(100, Math.round((registered / capacity) * 100));
    el.classList.toggle('cap--tight', left <= capacity * 0.2);
    const bar = $('.cap__track i', el);
    if (bar) bar.style.width = `${pct}%`;
    const b = $('.cap__label b', el);
    if (b) b.textContent = left ? fmt(T.spotsLeft, { n: left }) : T.waitlist;
    const s = $('.cap__label span', el);
    if (s) s.textContent = fmt(T.reserved, { n: registered });
    el.removeAttribute('data-cap-pending');
  });
  $$('[data-ticket-count]').forEach((el) => {
    const slug = el.dataset.ticketCount || '';
    const capacity = Number(el.dataset.capacity);
    if (!(slug in counts) || !capacity) return;
    const span = $('span', el);
    if (span) span.innerHTML = fmt(T.ticketCount, { left: Math.max(0, capacity - counts[slug]), capacity });
    el.removeAttribute('data-cap-pending');
  });
}
if ($('[data-cap], [data-ticket-count]')) {
  fetch('/api/registrations', { headers: { Accept: 'application/json' } })
    .then((r) => (r.ok ? r.json() : null))
    .then((d: { configured?: boolean; counts?: Record<string, number> } | null) => {
      if (d?.configured && d.counts) renderCapacity(d.counts);
    })
    .catch(() => {
      /* bars stay hidden when counts are unavailable */
    });
}

/* ---------------------------------------------------------------
   Event modal (quick path from any "Reservar" button). The button is
   a link to the event page, so it still works without JavaScript.
   --------------------------------------------------------------- */
const modal = $('#modal-evento');
let lastFocus: HTMLElement | null = null;

function shareHref(ev: ClientEvent) {
  const text = fmt(T.shareText, { title: ev.title, date: ev.dateLong, time: ev.time, place: ev.place, url: ev.absoluteUrl });
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function openModal(slug: string): boolean {
  const ev = DATA.events[slug];
  if (!modal || !ev) return false;
  $('#modal-topic', modal)!.textContent = ev.topic;
  $('#modal-title', modal)!.textContent = ev.title;
  $('#modal-date', modal)!.textContent = ev.dateLong;
  $('#modal-time', modal)!.textContent = ev.timeRange;
  $('#modal-place', modal)!.textContent = ev.place;
  $('#modal-desc', modal)!.textContent = ev.description;
  $<HTMLAnchorElement>('#modal-map', modal)!.href = ev.mapsUrl;
  $<HTMLAnchorElement>('#modal-detail', modal)!.href = ev.url;
  const agenda = $('#modal-agenda', modal)!;
  agenda.replaceChildren(
    ...ev.agenda.map((a) => {
      const li = document.createElement('li');
      const time = document.createElement('time');
      time.textContent = a.time;
      const span = document.createElement('span');
      span.textContent = a.label;
      li.append(time, span);
      return li;
    }),
  );
  const form = $<HTMLFormElement>('form', modal)!;
  form.reset();
  form.classList.remove('is-done', 'is-sending');
  $<HTMLInputElement>('[name="event_slug"]', form)!.value = ev.slug;
  $<HTMLAnchorElement>('[data-ics]', form)!.href = ev.icsUrl;
  $<HTMLAnchorElement>('[data-share]', form)!.href = shareHref(ev);
  lastFocus = document.activeElement as HTMLElement | null;
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  setNav(false);
  const first = window.innerWidth > 960 ? $<HTMLInputElement>('#m-nombre', modal) : $<HTMLButtonElement>('.modal__close', modal);
  window.setTimeout(() => first?.focus(), 60);
  return true;
}

function closeModal() {
  if (!modal?.classList.contains('is-open')) return;
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
  lastFocus?.focus();
}

document.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const trigger = target.closest<HTMLElement>('[data-event]');
  if (trigger && !(e as MouseEvent).metaKey && !(e as MouseEvent).ctrlKey) {
    if (openModal(trigger.dataset.event || '')) e.preventDefault();
    return;
  }
  if (target.closest('[data-close]') && modal?.contains(target)) {
    const link = target.closest('a[data-close]');
    closeModal();
    // "Ver otros eventos": stay on /eventos if already there
    if (link && location.pathname.replace(/\/$/, '').endsWith('/eventos')) e.preventDefault();
  }
});

document.addEventListener('keydown', (e) => {
  if (!modal?.classList.contains('is-open')) return;
  if (e.key === 'Escape') {
    closeModal();
    return;
  }
  if (e.key === 'Tab') {
    // Focus trap: keep Tab and Shift+Tab inside the dialog.
    const items = $$<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null && !el.closest('.hp'),
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (!modal.contains(document.activeElement)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

document.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('[data-ics]')) toast(T.icsToast);
});

/* ---------------------------------------------------------------
   Forms: validate, POST to /api/submit, then show the success state
   --------------------------------------------------------------- */
$$<HTMLFormElement>('form[data-form]').forEach((form) => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (form.classList.contains('is-sending')) return;
    const type = form.dataset.form || '';
    const fields: Record<string, string> = {};
    new FormData(form).forEach((v, k) => {
      if (typeof v === 'string') fields[k] = v;
    });
    const website = fields.website || '';
    delete fields.website;

    form.classList.add('is-sending');
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form_type: type,
          lang: DATA.lang,
          fields,
          website,
          utm: UTM,
          page_url: location.href,
          referrer: REFERRER,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
    } catch {
      form.classList.remove('is-sending');
      toast(T.formError);
      return;
    }
    form.classList.remove('is-sending');
    form.classList.add('is-done');
    if (type === 'registration') track(EVENTS.registration, { event: fields.event_slug, attendees: fields.attendees });
    if (type === 'newsletter') track(EVENTS.newsletter, { channel: fields.channel });
    const ok = $('.form__success', form);
    if (ok) {
      ok.setAttribute('tabindex', '-1');
      ok.focus({ preventScroll: true });
    }
  });
});

/* Newsletter channel toggle (Correo / WhatsApp) */
const nlForm = $<HTMLFormElement>('[data-nl-form]');
if (nlForm) {
  const input = $<HTMLInputElement>('#nl-value', nlForm)!;
  const label = $('#nl-label', nlForm)!;
  const channel = $<HTMLInputElement>('[name="channel"]', nlForm)!;
  const buttons = $$<HTMLButtonElement>('[data-nl]', nlForm);
  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      const wa = b.dataset.nl === 'whatsapp';
      buttons.forEach((x) => {
        x.classList.toggle('is-on', x === b);
        x.setAttribute('aria-pressed', String(x === b));
      });
      channel.value = wa ? 'whatsapp' : 'email';
      input.type = wa ? 'tel' : 'email';
      input.name = wa ? 'phone' : 'email';
      input.autocomplete = wa ? 'tel' : 'email';
      input.placeholder = (wa ? input.dataset.phWhatsapp : input.dataset.phEmail) || '';
      input.value = '';
      label.textContent = (wa ? label.dataset.labelWhatsapp : label.dataset.labelEmail) || '';
      input.focus();
    }),
  );
}

/* ---------------------------------------------------------------
   Donation widget (home + /donar) and Stripe Checkout
   --------------------------------------------------------------- */
const D = T.donate;
const money = (a: number) => '$' + a.toLocaleString('en-US');

async function startCheckout(amount: number, frequency: 'once' | 'monthly', btn: HTMLButtonElement) {
  track(EVENTS.donateClick, { amount, frequency });
  if (!DATA.stripeReady) {
    toast(D.notReady);
    return;
  }
  btn.disabled = true;
  try {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, frequency, lang: DATA.lang, page_url: location.href }),
    });
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
    if (res.status === 503 && data.error === 'not_configured') {
      toast(D.notReady);
    } else if (res.ok && data.url) {
      track(EVENTS.checkoutStarted, { amount, frequency });
      location.assign(data.url);
      return;
    } else {
      toast(D.checkoutError);
    }
  } catch {
    toast(D.checkoutError);
  }
  btn.disabled = false;
}

type Widget = HTMLElement & { setAmount?: (a: number) => void };
$$<Widget>('[data-donate]').forEach((w) => {
  const state: { freq: 'once' | 'monthly'; amount: number } = { freq: 'once', amount: 50 };
  const impact = $('[data-impact]', w)!;
  const btn = $<HTMLButtonElement>('[data-donate-btn]', w)!;
  const other = $<HTMLInputElement>('[data-amount-other]', w)!;
  const freqs = $$<HTMLButtonElement>('[data-freq]', w);
  const amts = $$<HTMLButtonElement>('[data-amount]', w);
  const markAmounts = (a: number | null) =>
    amts.forEach((x) => {
      const on = a !== null && Number(x.dataset.amount) === a;
      x.classList.toggle('is-on', on);
      x.setAttribute('aria-pressed', String(on));
    });
  function update() {
    const a = state.amount;
    let what = D.impacts[String(a)];
    if (!what) {
      const fam = Math.max(1, Math.round(a / 2.5));
      what = fmt(fam === 1 ? D.impactFallbackOne : D.impactFallbackMany, { n: fam });
    }
    impact.textContent = fmt(state.freq === 'monthly' ? D.impactMonthly : D.impactOnce, { money: money(a), what });
    btn.textContent = fmt(state.freq === 'monthly' ? D.btnMonthly : D.btnOnce, { money: money(a) });
  }
  freqs.forEach((b) =>
    b.addEventListener('click', () => {
      state.freq = b.dataset.freq === 'monthly' ? 'monthly' : 'once';
      freqs.forEach((x) => {
        x.classList.toggle('is-on', x === b);
        x.setAttribute('aria-pressed', String(x === b));
      });
      update();
    }),
  );
  amts.forEach((b) =>
    b.addEventListener('click', () => {
      state.amount = Number(b.dataset.amount);
      other.value = '';
      markAmounts(state.amount);
      update();
    }),
  );
  other.addEventListener('input', () => {
    const v = Number.parseInt(other.value, 10);
    if (v > 0) {
      state.amount = v;
      markAmounts(null);
      update();
    }
  });
  btn.addEventListener('click', () => startCheckout(state.amount, state.freq, btn));
  w.setAmount = (a: number) => {
    state.amount = a;
    other.value = '';
    markAmounts(a);
    update();
  };
});

/* Tier buttons on /donar preselect the amount in the page widget */
$$<HTMLButtonElement>('[data-pick]').forEach((b) =>
  b.addEventListener('click', () => {
    const w = $<Widget>('#donar-widget');
    if (!w?.setAmount) return;
    w.setAmount(Number(b.dataset.pick));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    $<HTMLButtonElement>('[data-donate-btn]', w)?.focus({ preventScroll: true });
  }),
);

/* ---------------------------------------------------------------
   /eventos: city and topic filters, ?tema= deep links
   --------------------------------------------------------------- */
const list = $('#all-events');
const citySel = $<HTMLSelectElement>('[data-filter="city"]');
const topicSel = $<HTMLSelectElement>('[data-filter="topic"]');
function applyFilters() {
  if (!list) return;
  const city = citySel?.value || '';
  const topic = topicSel?.value || '';
  let shown = 0;
  let currentHead: HTMLElement | null = null;
  let headHasRows = false;
  const closeHead = () => {
    if (currentHead) currentHead.hidden = !headHasRows;
  };
  Array.from(list.children).forEach((child) => {
    const el = child as HTMLElement;
    if (el.hasAttribute('data-month-head')) {
      closeHead();
      currentHead = el;
      headHasRows = false;
    } else if (el.classList.contains('event-row')) {
      const match = (!city || el.dataset.city === city) && (!topic || el.dataset.topic === topic);
      el.hidden = !match;
      if (match) {
        shown++;
        headHasRows = true;
      }
    }
  });
  closeHead();
  const empty = $('[data-events-empty]', list);
  if (empty) empty.hidden = shown > 0;
  const count = $('#events-count');
  if (count) count.textContent = shown === 1 ? T.count1 : fmt(T.countN, { n: shown });
}
if (list && topicSel) {
  const tema = new URLSearchParams(location.search).get('tema');
  if (tema && Array.from(topicSel.options).some((o) => o.value === tema)) topicSel.value = tema;
  [citySel, topicSel].forEach((s) =>
    s?.addEventListener('change', () => {
      applyFilters();
      // Keep ?tema= in the URL so the filtered view can be shared.
      const url = new URL(location.href);
      if (topicSel.value) url.searchParams.set('tema', topicSel.value);
      else url.searchParams.delete('tema');
      history.replaceState(null, '', url);
    }),
  );
  applyFilters();
}
