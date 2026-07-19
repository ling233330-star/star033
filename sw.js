// 星言 PWA Service Worker - v1.1.1
var CACHE_NAME = 'xingyan-v1_1_1';

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(name) {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

// 缓存策略：网络优先，缓存回退（确保部署后能加载新页面）
self.addEventListener('fetch', function(event) {
  // HTML 页面请求走网络优先
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(function(response) {
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      }).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }
  // 其他静态资源走缓存优先
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});

// 接收主页面消息，通过 SW 发送通知（Android Chrome standalone 模式更可靠）
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
        self.clients.openWindow('/star033/');
      }
    })
  );
});
