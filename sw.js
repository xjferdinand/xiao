// sw.js（完整版：已提高缓存版本号，确保你更新后能立刻生效）
const CACHE_NAME = "nb-model-pack-v9"; // ← 改版本号=强制更新缓存
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./sw.js",
  "./icons/icon-180.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k))))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
// ====== 一次性核按钮：清空所有缓存并注销SW ======
self.addEventListener("message", async (event) => {
  if (!event.data) return;

  if (event.data.type === "NUKE_SW") {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));

      // 注销当前 SW（让浏览器回到“无SW”状态）
      await self.registration.unregister();

      // 尽量让所有打开的页面立刻走“无SW”直连
      const clientsList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      clientsList.forEach(c => c.navigate(c.url));
    } catch (e) {
      // 静默失败也没关系，前端会再触发一次
    }
  }
});
