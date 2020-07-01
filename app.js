function requestAccess() {
  return navigator.permissions
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
    });
}

function main() {
  const mainEl = document.getElementById('main');
  const views = [
    {
      label: '+',
      component: new CreateFormComponent(),
    },
    {
      label: '=',
      component: new TimelineComponent(),
    },
  ];
  const navbar = new NavBarComponent(views);

  views.forEach((view) => {
    mainEl.appendChild(view.component.el);
  });
  mainEl.appendChild(navbar.el);
  mainEl.style.display = 'inherit';
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
