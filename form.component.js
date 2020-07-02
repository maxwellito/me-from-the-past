class CreateFormComponent {
  constructor() {
    this.setupTemplate();
  }

  setupTemplate() {
    // Base element
    this.el = document.createElement('div');
    this.el.classList.add('create');
    this.el.innerHTML = `
      <div class="create-form">
        <textarea
          id="create-form-msg"
          rows="1"
          placeholder="Write your message.."
          onkeydown="this.style.height = this.scrollHeight+'px';"
          onchange="this.style.height = this.scrollHeight+'px';"
        ></textarea>
        <div class="create-form-submit">
          <input id="create-form-time" type="time" value="12:00" />
          <button>+</button>
        </div>
      </div>`;

    this.msgEl = this.el.querySelector('textarea');
    this.timeEl = this.el.querySelector('input');
    this.submitEl = this.el.querySelector('button');
    this.submitEl.onclick = this.submit.bind(this);
  }

  refresh() {}

  submit() {
    const msg = this.msgEl.value;
    const time = this.timeEl.value;
    const now = new Date();
    const nowTime = now.getHours() * 60 + now.getMinutes();
    const askTime =
      parseInt(time.substr(0, 2)) * 60 + parseInt(time.substr(3, 2));
    let timer;
    if (nowTime < askTime) {
      timer = askTime - nowTime;
    } else {
      timer = 24 * 60 - nowTime + askTime;
    }
    const timerHuman =
      timer < 60 ? timer + ' minutes' : Math.floor(timer / 60) + ' hours';

    if (!msg) {
      return;
    }

    return requestAccess()
      .then(() => navigator.serviceWorker.getRegistration())
      .then((registration) => {
        registration.showNotification('Younger you', {
          tag: `${+now}_txt`,
          body: msg,
          showTrigger: new TimestampTrigger(+now + timer * 60000),
          icon: './assets/icon_256.png',
        });
        alert(
          `The future you in ${timerHuman} will be alerted of your message.`
        );
        this.msgEl.value = '';
        this.timeEl.value = '12:00';
      });
  }
}
