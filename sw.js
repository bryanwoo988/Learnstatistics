/* 统计学自学台 — service worker
   改了 index.html 之后，把 VERSION 的数字加一，使用者下次打开就会拿到新版本。 */
var VERSION = "stats-v4";
var ASSETS = ["./", "./index.html", "./manifest.webmanifest",
              "./icon.svg", "./whatsnew.js", "./qr.svg", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      // reload：跳过浏览器自己的 HTTP 缓存（GitHub Pages 给十分钟），免得新版本装进旧文件
      return Promise.allSettled(ASSETS.map(function (u) { return c.add(new Request(u, { cache: "reload" })); }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      // 同一个网址 bryanwoo988.github.io 下还有别的 App，只能删本 App 自己的旧缓存（stats- 开头）
      return Promise.all(keys.map(function (k) {
        return k.indexOf("stats-") === 0 && k !== VERSION ? caches.delete(k) : null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;

  // 页面请求：先连网（拿最新版），断网时用缓存
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(function (res) {
        if (res.ok) {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put("./index.html", copy); });
        }
        return res;
      }).catch(function () {
        return caches.match("./index.html").then(function (r) {
          return r || caches.match("./");
        });
      })
    );
    return;
  }

  // 其他资源（含 Google Fonts）：先用缓存，没有才连网并存起来
  e.respondWith(
    caches.match(req).then(function (hit) {
      if (hit) return hit;
      return fetch(req).then(function (res) {
        // 只存成功的回应（跨域字体是 opaque，看不到状态，照旧存）。以前 404、500
        // 也会被存起来，之后在这个版本里就一直拿到那个错误。
        if (res.ok || res.type === "opaque") {
          var copy = res.clone();
          caches.open(VERSION).then(function (c) { c.put(req, copy); });
        }
        return res;
      }).catch(function () {
        return new Response("Offline", { status: 503, statusText: "Offline" });
      });
    })
  );
});
