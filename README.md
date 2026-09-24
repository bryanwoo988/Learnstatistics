# 统计学自学台 · Beginning Statistics (11 章)

按 Shafer & Zhang《Beginning Statistics》的 11 章顺序编排的互动式自学 PWA：
46 节讲解 + 9 个可拖动的互动图 + 88 道选择题，中英双语，可离线使用。

## 放上 GitHub Pages

1. 新建一个 repo（例如 `stats`），把这几个文件放进根目录：

   ```
   index.html
   sw.js
   manifest.webmanifest
   icon.svg
   icon-192.png
   icon-512.png
   icon-512-maskable.png
   README.md
   ```

2. Settings → Pages → Source 选 **Deploy from a branch**，Branch 选 `main` / `(root)`，Save。
3. 等一两分钟，网址会是 `https://<你的用户名>.github.io/stats/`。
4. 用手机打开那个网址 → 浏览器菜单 →「加到主屏幕」，就变成一个 App 图标。

所有路径都是相对路径，所以放在子目录（`/stats/`）也能跑，不必改任何东西。

## 改内容之后要做的一件事

Service worker 会把旧版本缓存起来。每次改完 `index.html`，请把 `sw.js` 第一行的版本号加一：

```js
var VERSION = "stats-v2";   // 原本 stats-v1
```

否则使用者可能还看到旧版。

## 一些说明

- 阅读进度与练习成绩存在浏览器的 localStorage 里，只留在那台设备上；清缓存或换手机就没了。
- 字体从 Google Fonts 载入。第一次开必须连网，之后会被缓存；完全离线时会退回系统字体，排版略有不同。
- Service worker 只在 HTTPS（GitHub Pages 是 HTTPS）或 `localhost` 上生效，用 `file://` 直接双击打开不会有离线功能，其他功能正常。
- 本地预览：在文件夹里跑 `python3 -m http.server 8000`，然后开 `http://localhost:8000`。
- 讲解与题目是照该书大纲自行撰写的，不是原书译文；z 表、t 表没有内建，做题时仍需查书后附录。
