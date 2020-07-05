self.addEventListener('install', () => {
  skipWaiting();
});

self.addEventListener(
  'notificationclick',
  function (event) {
    event.notification.close();
    console.log(event);
    if (event.action === 'kill') {
      // Nothing
    } else if (event.action === 'snooze') {
      // Recreate for in 5 min
      const now = new Date();
      self.registration.showNotification('You', {
        tag: `${+now}_txt`,
        body: event.notification.body,
        showTrigger: new TimestampTrigger(+now + 5 * 60000),
        icon: './assets/icon_256.png',
        actions: [
          {
            action: 'kill',
            title: 'GOTCHA!',
          },
          {
            action: 'snooze',
            title: 'SHUT UP!',
          },
        ],
      });
    }
  },
  false
);
