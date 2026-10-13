/* 统计学自学台 — service worker
   改了 index.html 之后，把 VERSION 的数字加一，使用者下次打开就会拿到新版本。 */
var VERSION = "stats-v2";
var ASSETS = ["./", "./index.html", "./manifest.webmanifest",
              "./icon.svg", "./whatsnew.js", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(
    caches.open(VERSION).then(function (c) {
      return Promise.allSettled(ASSETS.map(function (u) { return c.add(u); }));
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
        var copy = res.clone();
        caches.open(VERSION).then(function (c) { c.put(req, copy); });
        return res;
      }).catch(function () { return hit; });
    })
  );
});
