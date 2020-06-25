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

if ('showTrigger' in Notification.prototype) {
  /* Notification Triggers supported */
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
