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
      permissionGranted();
    });
}

function permissionGranted() {
  views.get('timeline').refreshHistoryList();
}

function switchView(viewName) {
  const buttons = document.querySelectorAll('#menu button');
  buttons.forEach((button) => {
    button.className =
      button.getAttribute('data-link') === viewName ? 'active' : '';
  });

  Array.from(views.keys()).forEach((key) => {
    views.get(key).el.style.display = key === viewName ? 'inherit' : 'none';
  });

  permissionGranted();
}

const views = new Map();
function main() {
  const createView = new CreateForm();
  const timelineView = new Timeline();
  views.set('create', createView);
  views.set('timeline', timelineView);

  const mainEl = document.getElementById('main');
  mainEl.appendChild(createView.el);
  mainEl.appendChild(timelineView.el);
  mainEl.style.display = 'inherit';

  switchView('create');
  permissionGranted();
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
