import { select, classNames, templates } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  constructor(id, data) {
    const thisProduct = this;

    thisProduct.id = id;
    thisProduct.data = data;

    thisProduct.renderInMenu();
    thisProduct.getElements();
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
    console.log('new Product:', thisProduct);
  }

  renderInMenu() {
    const thisProduct = this;

    /* generate HTML based on template */
    const generatedHTML = templates.menuProduct(thisProduct.data);

    /* create element DOM using utils.createElementFromHTML*/

    thisProduct.element = utils.createDOMFromHTML(generatedHTML);

    /* find menu container */

    const menuContainer = document.querySelector(select.containerOf.menu);

    /* add created element to menu*/

    menuContainer.appendChild(thisProduct.element);
  }

  getElements() {
    const thisProduct = this;

    thisProduct.accordionTrigger = thisProduct.element.querySelector(
      select.menuProduct.clickable
    );
    thisProduct.form = thisProduct.element.querySelector(
      select.menuProduct.form
    );

    thisProduct.formInputs = thisProduct.form.querySelectorAll(
      select.all.formInputs
    );

    thisProduct.cartButton = thisProduct.element.querySelector(
      select.menuProduct.cartButton
    );
    thisProduct.priceElem = thisProduct.element.querySelector(
      select.menuProduct.priceElem
    );
    thisProduct.imageWrapper = thisProduct.element.querySelector(
      select.menuProduct.imageWrapper
    );
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(
      select.menuProduct.amountWidget
    );
  }

  initAccordion() {
    const thisProduct = this;

    /* find the clickable trigger (the element that should react to clicking) */

    /* START: add event listener to clickable trigger on event click */
    thisProduct.accordionTrigger.addEventListener('click', function (event) {
      /* prevent default action for event */
      event.preventDefault();

      /* find active product (product that has active class) */
      const activeProduct = document.querySelector(
        select.all.menuProductsActive
      );
      // classNames.menuProduct.wrapperActive

      // console.log('activeProduct:', activeProduct);

      /* if there is active product and it's not thisProduct.element, remove class active from it */

      if (activeProduct != null && activeProduct != thisProduct.element) {
        activeProduct.classList.remove('active');
        //console.log('removed!');
      }

      /* toggle active class on thisProduct.element */
      thisProduct.element.classList.toggle('active');
      //console.log('toggled!');
    });
  }
  initOrderForm() {
    const thisProduct = this;
    // console.log('initOrderForm');

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }

  processOrder() {
    const thisProduct = this;
    //console.log('processOrder');

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData:', formData);

    // set price to default price
    let price = thisProduct.data.price;

    //find image fit to param - option
    //let correctImage = thisProduct.data.img.class=paramId + '-' + optionId;
    //console.log(correctImage);

    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log('paramId:' + paramId, param);

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log('optionId:' + optionId, option);

        //find image fit to param - option
        const categoryOptionSelector = '.' + paramId + '-' + optionId;
        //console.log(categoryOptionSelector);
        let correctImage = thisProduct.imageWrapper.querySelector(
          categoryOptionSelector
        );
        //console.log('correctImage:' + correctImage);

        // check if there is param with a name of paramId in formData and if it includes optionId
        const optionSelected = formData[paramId]?.includes(optionId);
        // check if the option is not default
        if (!option.default && optionSelected) {
          // add option price to price variable
          price += option.price;
          //console.log(option.price + 'total:' + price);
        } else if (option.default && !optionSelected) {
          price -= option.price;
          //console.log(option.price + 'total:' + price);
        }

        // check if option is selected
        if (correctImage != null) {
          if (optionSelected) {
            // add class active
            correctImage.classList.add(classNames.menuProduct.imageVisible);
            //console.log(optionSelected);
          } else {
            correctImage.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
    }
    // multiple price by amount
    let multiplePrice = price * thisProduct.amountWidget.value;

    // add single price
    thisProduct.priceSingle = price;
    thisProduct.multiplePrice = multiplePrice;
    // update calculated price in the HTML
    thisProduct.priceElem.innerHTML = multiplePrice;
  }
  initAmountWidget() {
    const thisProduct = this;

    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }
  addToCart() {
    const thisProduct = this;

    //app.cart.add(thisProduct.prepareCartProduct());  ??

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct.prepareCartProduct(),
      },
    });
    thisProduct.element.dispatchEvent(event);
  }

  prepareCartProduct() {
    const thisProduct = this;

    const productSummary = {
      id: thisProduct.id,
      name: thisProduct.data.name,
      amount: thisProduct.amountWidget.value,
      priceSingle: thisProduct.priceSingle,
      price: thisProduct.multiplePrice,
      params: thisProduct.prepareCartProductParams(),
    };
    return productSummary;
  }

  prepareCartProductParams() {
    const thisProduct = this;
    //console.log('processOrder');

    const formData = utils.serializeFormToObject(thisProduct.form);
    //console.log('formData:', formData);

    // set price to default price
    //let price = thisProduct.data.price;

    //find image fit to param - option
    //let correctImage = thisProduct.data.img.class=paramId + '-' + optionId;
    //console.log(correctImage);

    const params = {};
    // for every category (param)...
    for (let paramId in thisProduct.data.params) {
      // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
      const param = thisProduct.data.params[paramId];
      //console.log('paramId:' + paramId, param);

      // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
      params[paramId] = {
        label: param.label,
        options: {},
      };

      // for every option in this category
      for (let optionId in param.options) {
        // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
        const option = param.options[optionId];
        //console.log('optionId:' + optionId, option);

        // check if there is param with a name of paramId in formData and if it includes optionId
        const optionSelected = formData[paramId]?.includes(optionId);
        // check if the option is not default
        if (optionSelected) {
          const selectOpt = { [optionId]: option.label };

          Object.assign(params[paramId].options, selectOpt);
        }
      }
      /*const productParamsSummary = Object.assign({}, objectBody);
            console.log('productParamsSummary:', productParamsSummary);*/

      /*const productParamsSummary = {
            [paramId]: {
              label: param.label,
              options: {
                optionId: param.options.label,
              },
            },
          };*/
    }
    return params;
  }
}

export default Product;
