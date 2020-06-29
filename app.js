const createScheduledNotification = () => {
  const msgInput = document.getElementById('create-form-msg');
  const timeInput = document.getElementById('create-form-time');
  const msg = msgInput.value;
  const time = timeInput.value;
  const now = new Date();
  const nowTime = now.getHours() * 60 + now.getMinutes();
  const askTime =
    parseInt(time.substr(0, 2)) * 60 + parseInt(time.substr(3, 2));
  let timer;
  if (nowTime < askTime) {
    timer = askTime - nowTime;
  } else {
    timer = 24 * 60 - askTime + nowTime;
  }
  const timerHuman =
    timer < 60 ? timer + ' minutes' : Math.floor(timer / 60) + ' hours';

  if (!msg) {
    return;
  }

  return navigator.serviceWorker.getRegistration().then((registration) => {
    registration.showNotification(`Message from ${timerHuman} ago`, {
      tag: `${+now}_txt`,
      body: msg,
      showTrigger: new TimestampTrigger(+now + timer * 60000),
    });
    alert(`The future you in ${timerHuman} will be alerted of your message.`);
    msgInput.value = '';
    timeInput.value = '12:00';
  });
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
      // createScheduledNotification('001', 'BANANA', Date.now());
      permissionGranted();
    })
    .catch(console.warn);
}

function permissionGranted() {
  // Refresh history list
  refreshHistoryList();
}

function refreshHistoryList() {
  return navigator.serviceWorker
    .getRegistration()
    .then((registration) =>
      registration.getNotifications({ includeTriggered: true })
    )
    .then((notifications) => {
      // Find notifs from the interval
      const now = Date.now();
      const nowMinus24h = now - 7 * 24 * 60 * 60 * 100;
      const notifs = notifications
        .filter((n) => n.showTrigger.timestamp > nowMinus24h)
        .sort((a, b) => a.showTrigger.timestamp - b.showTrigger.timestamp);

      // Split past and future
      let firstFutureNotifIndex = notifs.findIndex(
        (n) => n.showTrigger.timestamp > now
      );
      firstFutureNotifIndex =
        firstFutureNotifIndex === -1
          ? notifications.length
          : firstFutureNotifIndex;
      const pastNotifs = notifs.slice(0, firstFutureNotifIndex);
      const futureNotifs = notifs.slice(firstFutureNotifIndex);
      debugger;

      const limiter = document.createElement('fieldset');
      limiter.classList.add('delimiter');
      const legend = document.createElement('legend');
      legend.innerText = 'Now';
      limiter.appendChild(legend);

      const view = document.querySelector('[data-view="timeline"]');
      view.innerHTML = '';
      [
        ...pastNotifs.map(notifDom).map((x) => {
          x.classList.add('inactive');
          return x;
        }),
        limiter,
        ...futureNotifs.map(notifDom),
      ].forEach((dom) => view.appendChild(dom));
    });
}

function notifDom(notif) {
  const div = document.createElement('div');
  div.classList.add('notif');
  div.innerHTML = `
    <span>${new Date(notif.showTrigger.timestamp)
      .toISOString()
      .substr(11, 5)}</span>
    <p>${notif.body}</p>
  `;
  return div;
}

function switchView(viewName) {
  const buttons = document.querySelectorAll('#menu button');
  buttons.forEach((button) => {
    button.className =
      button.getAttribute('data-link') === viewName ? 'active' : '';
  });

  const views = document.querySelectorAll('[data-view]');
  views.forEach((view) => {
    view.style.display =
      view.getAttribute('data-view') === viewName ? 'inherit' : 'none';
  });

  refreshHistoryList();
}

function main() {
  document.getElementById('main').style.display = 'inherit';
  switchView('create');
  navigator.permissions.query({ name: 'notifications' }).then(({ state }) => {
    if (state === 'granted') {
      //

      permissionGranted();
    } else {
      /* Notification Triggers supported */
      const b = document.createElement('p');
      b.innerText = 'START';
      b.onclick = start;
      document.body.appendChild(b);
    }
  });
}

if ('showTrigger' in Notification.prototype && 'serviceWorker' in navigator) {
  // Set up service worker
  // navigator.serviceWorker.register('service-worker.js', {scope: '.'});
  navigator.serviceWorker.register('dummy-service-worker.js');

  // Init system
  main();
} else {
  // Not compatible browser
  const p = document.createElement('p');
  p.classList.add('fullmsg', 'reveal');
  p.innerHTML = "Sorry,<br />but your browser isn't compatible.";
  document.body.appendChild(p);
}
