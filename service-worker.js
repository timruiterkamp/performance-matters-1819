var CACHE = 'cache-and-update'

self.addEventListener('install', e => {
  console.log('Service worker is being installed')

  e.waitUntil(precache())
})

self.addEventListener('fetch', e => {
  console.log('Service worker is called because a fetch request was send')
  const request = e.request
  e.respondWith(
    caches
      .open(CACHE)
      .then(cache => cache.match(request))
      .then(res => {
        if (res) {
          return res
        } else {
          return fetch(request)
            .then(response =>
              caches
                .open(CACHE)
                .then(cache => cache.put(request, response.clone()))
                .then(() => response)
            )
            .catch(err =>
              caches
                .open(CACHE)
                .then(cache => cache.match('/offline').then(res => res))
            )
        }
      })
  )
  e.waitUntil(update(e.request))
})

function precache() {
  return caches
    .open(CACHE)
    .then(cache =>
      cache.addAll(['/', '/offline']).then(() => self.skipWaiting())
    )
}

function update(request) {
  return caches.open(CACHE).then(function(cache) {
    return fetch(request).then(function(response) {
      return cache.put(request, response)
    })
  })
}
