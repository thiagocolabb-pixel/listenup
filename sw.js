/* ListenUp — service worker
 * - Interface (HTML/JS/CSS/ícones) fica em cache: o app abre offline.
 * - Páginas: rede primeiro (versão nova), cache se estiver offline.
 * - Arquivos com hash (/_next/static): cache primeiro.
 * - Miniaturas do YouTube: cache com limite.
 * - Dados (Supabase) NÃO passam por aqui: ficam no IndexedDB do app (src/lib/store.ts).
 * __VERSION__ e __PRECACHE__ são preenchidos por scripts/pos-build.mjs a cada build.
 */
const VERSION = "ae4537c9d7c8"
const PRECACHE = ["404/","__next.__PAGE__.txt","__next._full.txt","__next._tree.txt","_next/static/chunks/04xssosknfxth.js","_next/static/chunks/0_7w59cjlfqty.css","_next/static/chunks/0cz1d0mv5g_q7.js","_next/static/chunks/0gghfn428zto2.js","_next/static/chunks/0gpohwfjgfm03.js","_next/static/chunks/1hxy3_9or12gg.js","_next/static/chunks/1m02f3sv6kbb4.js","_next/static/chunks/1q8pyo9m26410.js","_next/static/chunks/1wnov70f88xjy.js","_next/static/chunks/228z4uynd3pxw.js","_next/static/chunks/2cr7e9kf-7fpq.js","_next/static/chunks/2iocn9577p75i.js","_next/static/chunks/2k-h0wuo7fn96.js","_next/static/chunks/2pb39lzo-ylqa.js","_next/static/chunks/310vm2bl3xxpt.js","_next/static/chunks/354ij_xlcjl00.js","_next/static/chunks/39_j1bdzreq0m.js","_next/static/chunks/3bsxcifgf28nz.js","_next/static/chunks/3fsre-jc7dfcy.js","_next/static/chunks/3qfy96eoyh-ek.js","_next/static/chunks/3swwv78vwv2bu.js","_next/static/chunks/3ut4osj-sygkl.js","_next/static/chunks/turbopack-3o4-t1p9g0-z6.js","_next/static/eT7u762iuVbT-W-Dm-3ED/_buildManifest.js","_next/static/eT7u762iuVbT-W-Dm-3ED/_clientMiddlewareManifest.js","_next/static/eT7u762iuVbT-W-Dm-3ED/_ssgManifest.js","_next/static/media/07c7676b89ed2778-s.p.2bn3s6zvc0dyp.woff2","_next/static/media/2fb76073e23fd9e4-s.3lvt2whj97whp.woff2","_next/static/media/45462fd7b7c12654-s.0k62hbripvv8p.woff2","_next/static/media/46a9e2f250689b4a-s.0-dom-5bn10r2.woff2","_next/static/media/6131cbbf5549afa2-s.2uwcyprjm3xu3.woff2","_next/static/media/76b70a1dbe058eb5-s.1y4-pdgsjb-pw.woff2","_next/static/media/ba63f6a0e436df8e-s.3-6t-g6q0vh0a.woff2","_not-found/__next._full.txt","_not-found/__next._not-found.__PAGE__.txt","_not-found/__next._not-found/__PAGE__.txt","_not-found/__next._tree.txt","_not-found/","_not-found/index.txt","certificado/__next._full.txt","certificado/__next._tree.txt","certificado/__next.certificado.__PAGE__.txt","certificado/__next.certificado/__PAGE__.txt","certificado/","certificado/index.txt","compartilhado/__next._full.txt","compartilhado/__next._tree.txt","compartilhado/__next.compartilhado.__PAGE__.txt","compartilhado/__next.compartilhado/__PAGE__.txt","compartilhado/","compartilhado/index.txt","conquistas/__next._full.txt","conquistas/__next._tree.txt","conquistas/__next.conquistas.__PAGE__.txt","conquistas/__next.conquistas/__PAGE__.txt","conquistas/","conquistas/index.txt","conta/__next._full.txt","conta/__next._tree.txt","conta/__next.conta.__PAGE__.txt","conta/__next.conta/__PAGE__.txt","conta/","conta/index.txt","estudar/__next._full.txt","estudar/__next._tree.txt","estudar/__next.estudar.__PAGE__.txt","estudar/__next.estudar/__PAGE__.txt","estudar/","estudar/index.txt","icons/apple-touch-icon.png","icons/favicon-32.png","icons/icon-192.png","icons/icon-512.png","icons/maskable-512.png","","index.txt","manifest.webmanifest","novo/__next._full.txt","novo/__next._tree.txt","novo/__next.novo.__PAGE__.txt","novo/__next.novo/__PAGE__.txt","novo/","novo/index.txt","painel/__next._full.txt","painel/__next._tree.txt","painel/__next.painel.__PAGE__.txt","painel/__next.painel/__PAGE__.txt","painel/","painel/index.txt","plano/__next._full.txt","plano/__next._tree.txt","plano/__next.plano.__PAGE__.txt","plano/__next.plano/__PAGE__.txt","plano/","plano/index.txt","privacidade/__next._full.txt","privacidade/__next._tree.txt","privacidade/__next.privacidade.__PAGE__.txt","privacidade/__next.privacidade/__PAGE__.txt","privacidade/","privacidade/index.txt","prontos/__next._full.txt","prontos/__next._tree.txt","prontos/__next.prontos.__PAGE__.txt","prontos/__next.prontos/__PAGE__.txt","prontos/","prontos/index.txt","revisar/__next._full.txt","revisar/__next._tree.txt","revisar/__next.revisar.__PAGE__.txt","revisar/__next.revisar/__PAGE__.txt","revisar/","revisar/index.txt","termos/__next._full.txt","termos/__next._tree.txt","termos/__next.termos.__PAGE__.txt","termos/__next.termos/__PAGE__.txt","termos/","termos/index.txt","vocab/__next._full.txt","vocab/__next._tree.txt","vocab/__next.vocab.__PAGE__.txt","vocab/__next.vocab/__PAGE__.txt","vocab/","vocab/index.txt"]
const BASE = new URL(self.registration.scope).pathname // ex.: /listenup/
const SHELL = `listenup-shell-${VERSION}`
const RUNTIME = 'listenup-runtime-v1'
const THUMBS = 'listenup-thumbs-v1'
const MAX_THUMBS = 400

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((c) => c.addAll(PRECACHE.map((p) => BASE + p)))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('listenup-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => caches.open(RUNTIME))
      .then((c) => c.keys().then((reqs) => Promise.all(reqs.map((r) => c.delete(r))))) // runtime antigo pode ser de outra versão
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)

  // miniaturas do YouTube e fotos de perfil (nome aleatório: nunca mudam) ficam guardadas
  if (url.hostname === 'i.ytimg.com' || (url.hostname.endsWith('.supabase.co') && url.pathname.includes('/storage/v1/object/public/avatars/'))) {
    event.respondWith(thumb(req))
    return
  }
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return

  if (req.mode === 'navigate') {
    event.respondWith(page(req))
    return
  }
  if (url.pathname.startsWith(BASE + '_next/static/')) {
    event.respondWith(cacheFirst(req))
    return
  }
  event.respondWith(staleWhileRevalidate(req))
})

// Tela instantânea: a página sai do cache desta versão do app (abre na hora, até sem internet).
// Quando sai versão nova, o navegador instala o service worker novo em segundo plano e o app
// mostra "Nova versão disponível · Atualizar".
async function page(req) {
  const shell = await caches.open(SHELL)
  const cached = await shell.match(req, { ignoreSearch: true })
  if (cached) return cached
  try {
    const res = await withTimeout(fetch(req), 4000)
    if (res.ok) (await caches.open(RUNTIME)).put(req, res.clone())
    return res
  } catch {
    // /plano/?id=x usa o mesmo HTML de /plano/
    return (
      (await caches.match(req, { ignoreSearch: true })) ||
      (await caches.match(BASE, { ignoreSearch: true })) ||
      new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    )
  }
}

async function cacheFirst(req) {
  const hit = await caches.match(req)
  if (hit) return hit
  const res = await fetch(req)
  if (res.ok) (await caches.open(RUNTIME)).put(req, res.clone())
  return res
}

async function staleWhileRevalidate(req) {
  const hit = await caches.match(req, { ignoreSearch: true })
  const net = fetch(req)
    .then(async (res) => {
      if (res.ok) (await caches.open(RUNTIME)).put(req, res.clone())
      return res
    })
    .catch(() => null)
  return hit || (await net) || new Response('', { status: 504 })
}

async function thumb(req) {
  const cache = await caches.open(THUMBS)
  const hit = await cache.match(req)
  if (hit) return hit
  try {
    const res = await fetch(req, { mode: 'no-cors' })
    await cache.put(req, res.clone())
    const keys = await cache.keys()
    if (keys.length > MAX_THUMBS) await Promise.all(keys.slice(0, keys.length - MAX_THUMBS).map((k) => cache.delete(k)))
    return res
  } catch {
    return new Response('', { status: 504 })
  }
}

function withTimeout(promise, ms) {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))])
}

self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') self.skipWaiting()
})

// ---------------------------------------------------------------- lembrete diário (notificação)
self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { body: event.data ? event.data.text() : '' }
  }
  event.waitUntil(
    self.registration.showNotification(data.title || 'ListenUp', {
      body: data.body || 'Hora de estudar!',
      icon: BASE + 'icons/icon-192.png',
      badge: BASE + 'icons/favicon-32.png',
      tag: data.tag || 'listenup',
      renotify: true,
      data: { url: data.url || BASE },
    }),
  )
})

// Tocar na notificação: abre (ou traz para frente) o app na aula de hoje
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = (event.notification.data && event.notification.data.url) || BASE
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
      for (const w of wins) {
        if (new URL(w.url).pathname.startsWith(BASE) && 'focus' in w) {
          w.navigate(url)
          return w.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})
