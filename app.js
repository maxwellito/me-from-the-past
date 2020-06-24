if ('showTrigger' in Notification.prototype) {
  /* Notification Triggers supported */
  console.log('START');
  createScheduledNotification('001', 'BANANA', Date.now());
}

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
