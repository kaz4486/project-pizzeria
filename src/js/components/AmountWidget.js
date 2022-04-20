import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue);
    const thisWidget = this;

    thisWidget.getElements(element);

    thisWidget.setValue(thisWidget.dom.input.value);
    thisWidget.initActions(thisWidget.value);
    console.log('AmountWidget', thisWidget);
  }
  getElements() {
    const thisWidget = this;

    //thisWidget.dom.wrapper = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.input
    );
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkDecrease
    );
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(
      select.widgets.amount.linkIncrease
    );
    // thisWidget.value = settings.amountWidget.defaultValue;
  }

  isValid(value) {
    return (
      !isNaN(value) &&
      value >= settings.amountWidget.defaultMin &&
      value <= settings.amountWidget.defaultMax
    );
  }

  renderValue() {
    const thisWidget = this;
    thisWidget.dom.input.value = thisWidget.value;
  }
  initActions() {
    const thisWidget = this;

    thisWidget.dom.input.addEventListener('change', function () {
      thisWidget.setValue(thisWidget.dom.input.value);
    });

    thisWidget.dom.linkDecrease.addEventListener('click', function (event) {
      event.preventDefault();
      thisWidget.setValue(--thisWidget.value);
    });

    thisWidget.dom.linkIncrease.addEventListener('click', function (event) {
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
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default AmountWidget;
