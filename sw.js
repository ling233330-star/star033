// 星言 PWA Service Worker - v1.1.1
// 策略：不缓存 HTML/导航请求，始终从网络获取最新页面（避免旧版缓存导致看不到更新/数据异常）
// 仅用于接收主页面消息并弹出通知（Android Chrome 独立模式更可靠）
var CACHE_NAME = 'xingyan-v1_1_1';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  // 清理旧缓存，避免残留
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 不拦截 fetch：浏览器按默认（网络）方式加载，始终获取服务器最新文件
// 这样部署新版本后，用户（含已安装 PWA）刷新即可看到新代码，不会卡在旧缓存
self.addEventListener('fetch', function(event) {
  // 不做 event.respondWith，保持默认网络行为
  return;
});

// 接收主页面消息，通过 SW 发送通知
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    var data = event.data;
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
      badge: data.icon,
      tag: 'xingyan-msg',
      requireInteraction: false
    });
  }
});

// 点击通知回到主页面
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(function(clients) {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        self.clients.openWindow('./');
      }
    })
  );
});
