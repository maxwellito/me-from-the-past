class TimelineComponent {
  constructor() {
    this.notifsEl = new Map();
    this.isOff = true;
    this.pastNotifs = [];
    this.futureNotifs = [];
    this.buildNotif = this.buildNotif.bind(this);
    this.setupTemplate();
  }

  setupTemplate() {
    // Base element
    this.el = document.createElement('div');
    this.el.classList.add('timeline');

    // List screen
    this.pastNotifsEl = document.createElement('div');
    this.pastNotifsEl.classList.add('past-notifs');

    this.futureNotifsEl = document.createElement('div');
    this.futureNotifsEl.classList.add('future-notifs');

    this.delimiterEl = document.createElement('fieldset');
    this.delimiterEl.classList.add('delimiter');
    const legend = document.createElement('legend');
    legend.innerText = 'Now';
    this.delimiterEl.appendChild(legend);

    // Off screen
    this.emptyEl = document.createElement('div');
    this.emptyEl.classList.add('fullmsg');
    this.emptyEl.innerText = 'No scheduled messages, yet.';
  }

  buildNotif(notif) {
    if (this.notifsEl.has(notif.tag)) {
      return this.notifsEl.get(notif.tag);
    }
    const div = document.createElement('div');
    div.setAttribute('id', notif.tag);
    div.classList.add('notif');
    div.innerHTML = `
      <span>${new Date(notif.showTrigger.timestamp)
        .toLocaleTimeString()
        .substr(0, 5)}</span>
      <p>${notif.body}</p>
    `;
    this.notifsEl.set(notif.tag, div);
    return div;
  }

  refresh() {
    return navigator.serviceWorker
      .getRegistration()
      .then((registration) =>
        registration.getNotifications({ includeTriggered: true })
      )
      .then((notifications) => {
        this.isOff = false;
        // Find notifs from the interval
        const now = Date.now();
        const nowMinus24h = now - 24 * 60 * 60 * 100;
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

        this.pastNotifs = notifs
          .slice(0, firstFutureNotifIndex)
          .map(this.buildNotif);
        this.futureNotifs = notifs
          .slice(firstFutureNotifIndex)
          .map(this.buildNotif);

        this.render();
      })
      .catch(() => {
        this.isOff = true;
        this.render();
      });
  }

  cancelNotif(tag) {
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
  }

  render() {
    this.el.innerHTML = '';

    if (this.isOff || (!this.pastNotifs.length && !this.futureNotifs.length)) {
      this.el.appendChild(this.emptyEl);
      return;
    }
    this.el.appendChild(this.pastNotifsEl);
    this.el.appendChild(this.delimiterEl);
    this.el.appendChild(this.futureNotifsEl);

    this.pastNotifsEl.innerHTML = '';
    this.futureNotifsEl.innerHTML = '';
    this.pastNotifs.forEach((n) => this.pastNotifsEl.appendChild(n));
    this.futureNotifs.forEach((n) => this.futureNotifsEl.appendChild(n));
  }
}
