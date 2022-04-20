import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
  }
  render(element) {
    const thisBooking = this;
    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = element;

    element.innerHTML = generatedHTML;

    thisBooking.dom = {
      peopleAmount: element.querySelector(select.booking.peopleAmount),
      hoursAmount: element.querySelector(select.booking.hoursAmount),
    };

    console.log(thisBooking.dom.peopleAmount);
  }
  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(
      thisBooking.dom.peopleAmount
    );
    thisBooking.hoursAmountWidget = new AmountWidget(
      thisBooking.dom.hoursAmount
    );

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});
  }
}

export default Booking;
