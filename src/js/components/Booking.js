import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './Classes_v2/DatePicker.js';
import HourPicker from './Classes_v2/HourPicker.js';

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
      dataPicker: element.querySelector(select.widgets.datePicker.wrapper),
      hourPicker: element.querySelector(select.widgets.hourPicker.wrapper),
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

    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.dataPicker);

    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});

    thisBooking.dom.dataPicker.addEventListener('updated', function () {});

    thisBooking.dom.hourPicker.addEventListener('updated', function () {});
  }
}

export default Booking;
