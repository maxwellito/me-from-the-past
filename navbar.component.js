class NavBarComponent {
  constructor(views) {
    this.views = views;
    this.currentViewIndex = null;
    this.buttons = [];
    this.setupTemplate();
    this.switchTo(0);
  }

  setupTemplate() {
    this.el = document.createElement('div');
    this.el.classList.add('menu');

    this.views.forEach((view, i) => {
      const button = document.createElement('button');
      button.innerText = view.label;
      button.onclick = () => this.switchTo(i);
      this.el.appendChild(button);
      this.buttons.push(button);
    });
  }

  switchTo(viewIndex) {
    if (this.currentViewIndex !== null) {
      this.views[this.currentViewIndex].component.el.style.display = 'none';
      this.buttons[this.currentViewIndex].classList.remove('active');
    }
    this.views[viewIndex].component.el.style.display = 'inherit';
    this.views[viewIndex].component.refresh();
    this.buttons[viewIndex].classList.add('active');
    this.currentViewIndex = viewIndex;
  }
}
