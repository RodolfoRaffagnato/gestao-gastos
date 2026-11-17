// Gestão de Gastos: guarda o app para abrir rápido, mas sempre busca a versão nova quando há internet.
const VERSAO='gastos-v44';
const FIXOS=['./','index.html','manifest.json','favicon.png','apple-touch-icon.png','icon-192.png','icon-512.png','icon-maskable-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  'https://cdn.jsdelivr.net/npm/firebase@13.1.0/firebase-app-compat.js','https://cdn.jsdelivr.net/npm/firebase@13.1.0/firebase-auth-compat.js','https://cdn.jsdelivr.net/npm/firebase@13.1.0/firebase-firestore-compat.js','https://cdn.jsdelivr.net/npm/firebase@13.1.0/firebase-messaging-compat.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSAO).then(c=>Promise.all(FIXOS.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||/script\.google|googleusercontent|bcb\.gov\.br|googleapis\.com|firebaseapp\.com/.test(u.hostname))return; // planilha e Banco Central: sempre direto
  if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){ // o app: rede primeiro, cópia guardada se estiver sem internet
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSAO).then(k=>k.put('index.html',c));return res}).catch(()=>caches.match('index.html').then(x=>x||caches.match('./'))));return}
  e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{if(res.ok&&(u.origin===location.origin||/cdnjs|jsdelivr|fonts\.g/.test(u.hostname))){const c=res.clone();caches.open(VERSAO).then(k=>k.put(r,c))}return res})));
});

// avisos de vencimento enviados pelo servidor (Firebase Cloud Messaging)
self.addEventListener('push',e=>{let p={};try{p=e.data?e.data.json():{}}catch(x){p={notification:{title:'Gastos',body:e.data?e.data.text():''}}}
  const n=p.notification||{},d=p.data||{},titulo=n.title||d.title||'Gastos',corpo=n.body||d.body||'';
  e.waitUntil(self.registration.showNotification(titulo,{body:corpo,icon:'icon-192.png',badge:'icon-192.png',tag:n.tag||titulo,data:{link:d.link||(n.click_action)||'./#contas'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();const alvo=(e.notification.data&&e.notification.data.link)||'./';
  e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(l=>{for(const c of l){if('focus' in c)return c.focus()}return clients.openWindow(alvo)}))});
