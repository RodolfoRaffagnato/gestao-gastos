// Gestão de Gastos: guarda o app para abrir rápido, mas sempre busca a versão nova quando há internet.
const VERSAO='gastos-v30';
const FIXOS=['./','index.html','manifest.json','favicon.png','apple-touch-icon.png','icon-192.png','icon-512.png','icon-maskable-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js','https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(VERSAO).then(c=>Promise.all(FIXOS.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==VERSAO).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||/script\.google|googleusercontent|bcb\.gov\.br/.test(u.hostname))return; // planilha e Banco Central: sempre direto
  if(r.mode==='navigate'||u.pathname.endsWith('/')||u.pathname.endsWith('index.html')){ // o app: rede primeiro, cópia guardada se estiver sem internet
    e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(VERSAO).then(k=>k.put('index.html',c));return res}).catch(()=>caches.match('index.html').then(x=>x||caches.match('./'))));return}
  e.respondWith(caches.match(r).then(x=>x||fetch(r).then(res=>{if(res.ok&&(u.origin===location.origin||/cdnjs|fonts\.g/.test(u.hostname))){const c=res.clone();caches.open(VERSAO).then(k=>k.put(r,c))}return res})));
});
