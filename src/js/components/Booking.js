import { templates, select, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './Classes_v2/DatePicker.js';
import HourPicker from './Classes_v2/HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

    thisBooking.bookedTable = null;
    thisBooking.starters = [];
  }

  getData() {
    const thisBooking = this;

    const startDateParam =
      settings.db.dateStartParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePickerWidget.minDate);

    const endDateParam =
      settings.db.dateEndParamKey +
      '=' +
      utils.dateToStr(thisBooking.datePickerWidget.maxDate);

    const params = {
      bookings: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    //console.log('getData params', params);

    const urls = {
      bookings:
        settings.db.url +
        '/' +
        settings.db.booking +
        '?' +
        params.bookings.join('&'),
      eventsCurrent:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsCurrent.join('&'),
      eventsRepeat:
        settings.db.url +
        '/' +
        settings.db.event +
        '?' +
        params.eventsRepeat.join('&'),
    };

    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])

      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        //console.log(bookings);
        // console.log(eventsCurrent);
        // console.log(eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerWidget.minDate;
    const maxDate = thisBooking.datePickerWidget.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }

    //console.log('thisBooking.booked', thisBooking.booked);
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    //console.log(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] == 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ==
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      table.classList.remove('clicked');
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }
  render(element) {
    const thisBooking = this;
    /* generate HTML based on template */
    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.element = element;

    thisBooking.dom.element.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.element.querySelector(
      select.booking.peopleAmount
    );

    thisBooking.dom.hoursAmount = thisBooking.dom.element.querySelector(
      select.booking.hoursAmount
    );
    thisBooking.dom.dataPicker = thisBooking.dom.element.querySelector(
      select.widgets.datePicker.wrapper
    );
    thisBooking.dom.hourPicker = thisBooking.dom.element.querySelector(
      select.widgets.hourPicker.wrapper
    );
    thisBooking.dom.tables = thisBooking.dom.element.querySelectorAll(
      select.booking.tables
    );
    thisBooking.dom.tableDiv =
      thisBooking.dom.element.querySelector('.floor-plan');

    thisBooking.dom.startersCheckboxes =
      thisBooking.dom.element.querySelectorAll(select.booking.starters);
    thisBooking.dom.bookingSubmit = thisBooking.dom.element.querySelector(
      select.booking.submit
    );
    thisBooking.dom.bookingPhone = thisBooking.dom.element.querySelector(
      select.booking.phone
    );
    thisBooking.dom.bookingAddress = thisBooking.dom.element.querySelector(
      select.booking.address
    );
    //console.log(thisBooking.dom.tables);
    //console.log(thisBooking.dom.peopleAmount);
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

    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {});

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {});

    thisBooking.dom.dataPicker.addEventListener('updated', function () {});

    thisBooking.dom.hourPicker.addEventListener('updated', function () {});

    thisBooking.dom.element.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });
    thisBooking.dom.tableDiv.addEventListener('click', function (event) {
      thisBooking.initTables(event);
    });
    thisBooking.dom.bookingSubmit.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
    thisBooking.dom.element.addEventListener('click', function (event) {
      //console.log(event);
      if (event.target.type == 'checkbox' && event.target.name == 'starter') {
        //console.log(event.target.value);

        thisBooking.starters = [];

        for (let checkbox of thisBooking.dom.startersCheckboxes) {
          if (checkbox.checked) {
            thisBooking.starters.push(event.target.value);
            if (
              (event.target.value == 'bread') &
              !thisBooking.starters.includes('water')
            ) {
              thisBooking.starters.push('water');
            }
          } /*else {
            const indexOf = thisBooking.starters.indexOf(event.target.value);
            thisBooking.starters.splice(indexOf, 1);*/
        }

        //console.log(thisBooking.starters);
      }
      const startersUnique = [...new Set(thisBooking.starters)];
      thisBooking.starters = startersUnique;
      console.log(thisBooking.starters);
    });
  }

  initTables(event) {
    const thisBooking = this;

    //console.log(clickedTableInfo);
    //thisBooking.clickedTableInfo += clickedTableInfo;

    thisBooking.dom.element.addEventListener('updated', function () {
      event.target.classList.remove('clicked');
      thisBooking.bookedTable = null;
    });
    //console.log(clickedTableInfo);

    if (
      event.target.classList.contains('table') &
      !event.target.classList.contains(classNames.booking.tableBooked) &
      !event.target.classList.contains('clicked')
    ) {
      for (let table of thisBooking.dom.tables) {
        if (table.classList.contains('clicked')) {
          table.classList.remove('clicked');
        }
        event.target.classList.add('clicked');
      }

      const clickedTableId = event.target.getAttribute('data-table');
      thisBooking.bookedTable = clickedTableId;
      console.log(thisBooking.bookedTable);
      //clickedTableInfo += clickedTableId;
      //console.log(clickedTableInfo);

      //clickedTable = clickedTableId;
    } else if (
      event.target.classList.contains('table') &
      event.target.classList.contains(classNames.booking.tableBooked)
    ) {
      alert('ten stolik jest zajęty');
    } else if (
      event.target.classList.contains('table') &
      !event.target.classList.contains(classNames.booking.tableBooked) &
      event.target.classList.contains('clicked')
    ) {
      event.target.classList.remove('clicked');
      //clickedTableInfo = '';
    }

    //console.log(availableTables);
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;

    const bookingload = {
      date: thisBooking.date,
      hour: thisBooking.hourPickerWidget.value, //godzina wybrana w hourPickerze (w formacie HH:ss)
      table: parseInt(thisBooking.bookedTable), //numer wybranego stolika (lub null jeśli nic nie wybrano)
      duration: thisBooking.hoursAmountWidget.value, //liczba godzin wybrana przez klienta
      ppl: thisBooking.peopleAmountWidget.value, //liczba osób wybrana przez klienta
      starters: thisBooking.starters,
      phone: thisBooking.dom.bookingPhone.value,
      address: thisBooking.dom.bookingAddress.value,
    };
    console.log(bookingload);

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        thisBooking.makeBooked(
          parsedResponse.date,
          parsedResponse.hour,
          parsedResponse.duration,
          parsedResponse.table
        );
        thisBooking.updateDOM();

        //makeBooked(date, hour, duration, table)
      });
    console.log(thisBooking.booked);
  }
}

export default Booking;
