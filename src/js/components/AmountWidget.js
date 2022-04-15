import { select, settings } from '../settings.js';

class AmountWidget {
  constructor(element) {
    const thisWidget = this;

    console.log('AmountWidget:', thisWidget);
    console.log('constructor arguments:', element);

    thisWidget.getElements(element);

    thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions(thisWidget.value);
  }
  getElements(element) {
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(
      select.widgets.amount.input
    );
    thisWidget.linkDecrease = thisWidget.element.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.linkIncrease = thisWidget.element.querySelector(
      select.widgets.amount.linkIncrease
    );
    thisWidget.value = settings.amountWidget.defaultValue;
  }

  setValue(value) {
    const thisWidget = this;

    const newValue = parseInt(value);

    /* TODO: Add validation */

    if (thisWidget.value !== newValue && !isNaN(newValue)) {
      thisWidget.value = newValue;
    } else if (newValue < settings.amountWidget.defaultMin) {
      thisWidget.value = settings.amountWidget.defaultMin;
    } else if (newValue > settings.amountWidget.defaultMax) {
      thisWidget.value = settings.amountWidget.defaultMax;
    }

    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
  }
  initActions() {
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(--thisWidget.value);
    });

    thisWidget.linkIncrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(++thisWidget.value);
    });
  }
  /*inputHandler() {
      const thisWidget = this;
      setValue();
    }
    linkDecreaseHandler(event) {
      event.preventDefault();
      const thisWidget = this;
      this.setValue(++thisWidget.value);
    }
    linkIncreaseHandler(event) {
      event.preventDefault();
      const thisWidget = this;
      this.setValue(--thisWidget.value);
    }*/
  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
