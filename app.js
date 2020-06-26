const createScheduledNotification = (tag, title, timestamp) => {
  return navigator.serviceWorker.getRegistration().then((registration) =>
    registration.showNotification(title, {
      tag: tag,
      body: 'This notification was scheduled 30 seconds ago',
      showTrigger: new TimestampTrigger(timestamp + 10 * 1000),
    })
  );
};

const cancelScheduledNotification = (tag) => {
  return navigator.serviceWorker
    .getRegistration()
    .then((registration) =>
      registration.getNotifications({
        tag: tag,
        includeTriggered: true,
      })
    )
    .then((notifications) => {
      notifications.forEach((notification) => notification.close());
    });
};

function start() {
  console.log('START');
  navigator.permissions
    .query({ name: 'notifications' })
    .then(({ state }) => {
      if (state === 'prompt') {
        return Notification.requestPermission();
      }
    })
    .then(() => navigator.permissions.query({ name: 'notifications' }))
    .then(({ state }) => {
      if (state !== 'granted') {
        alert(
          'You need to grant notifications permission for this demo to work.'
        );
        throw new Error('Authorisation failed');
      }
      createScheduledNotification('001', 'BANANA', Date.now());
    })
    .catch(console.warn);
}

if ('showTrigger' in Notification.prototype && 'serviceWorker' in navigator) {
  // Set up service worker
  // navigator.serviceWorker.register('service-worker.js', {scope: '.'});
  navigator.serviceWorker.register('dummy-service-worker.js');

  /* Notification Triggers supported */
  const b = document.createElement('p');
  b.innerText = 'START';
  b.onclick = start;
  document.body.appendChild(b);
} else {
  // Not compatible browser
  const p = document.createElement('p');
  p.classList.add('fullmsg', 'reveal');
  p.innerHTML = "Sorry,<br />but your browser isn't compatible.";
  document.body.appendChild(p);
}
