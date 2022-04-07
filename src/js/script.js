/* global  utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ('use strict');

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice:
        '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(
      document.querySelector(select.templateOf.menuProduct).innerHTML
    ),
    // CODE ADDED START
    cartProduct: Handlebars.compile(
      document.querySelector(select.templateOf.cartProduct).innerHTML
    ),
    // CODE ADDED END
  };

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
              correctImage.classList.remove(
                classNames.menuProduct.imageVisible
              );
            }
          }
        }
      }
      // multiple price by amount
      let multiplePrice = price * thisProduct.amountWidget.value;
      console.log(thisProduct.amountWidget.value);
      console.log('price:', price);
      console.log('multiplePrice:', multiplePrice);
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

      app.cart.add(thisProduct.prepareCartProduct());
      //app.cart.add(thisProduct.prepareCartProductParams());
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
  class Cart {
    constructor(element) {
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();

      console.log('new Cart', thisCart);
    }

    getElements(element) {
      const thisCart = this;

      thisCart.dom = {
        toggleTrigger: element.querySelector(select.cart.toggleTrigger),
        productList: element.querySelector(select.cart.productList),
        deliveryFee: element.querySelector(select.cart.deliveryFee),
        subtotalPrice: element.querySelector(select.cart.subtotalPrice),
        totalPrice: element.querySelectorAll(select.cart.totalPrice),
        totalNumber: element.querySelector(select.cart.totalNumber),
        form: element.querySelector(select.cart.form),
        phone: element.querySelector(select.cart.phone),
        address: element.querySelector(select.cart.address),
      };

      thisCart.dom.wrapper = element;
    }
    initActions() {
      const thisCart = this;

      thisCart.dom.toggleTrigger.addEventListener('click', function () {
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function () {
        thisCart.update();
      });

      //thisCart.event.detail.cartProduct;
      thisCart.dom.productList.addEventListener('remove', function (event) {
        thisCart.remove(event.detail.cartProduct);
      });
      thisCart.dom.form.addEventListener('submit', function (event) {
        event.preventDefault();
        thisCart.sendOrder();
      });
    }

    sendOrder() {
      const thisCart = this;
      const url = settings.db.url + '/' + settings.db.orders;

      const payload = {
        address: thisCart.dom.address.value,
        phone: thisCart.dom.phone.value,
        totalPrice: thisCart.totalPrice,
        subtotalPrice: thisCart.subtotalPrice,
        totalNumber: thisCart.totalNumber,
        deliveryFee: thisCart.deliveryFee,
        products: [],
      };
      //console.log(payload);

      for (let prod of thisCart.products) {
        payload.products.push(prod.getData());
      }
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      fetch(url, options)
        .then(function (response) {
          return response.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });
    }

    remove(event) {
      const thisCart = this;

      for (let product of thisCart.products) {
        const index = thisCart.products.indexOf(product);
        console.log('index', index);
        const deleted = thisCart.products.splice(index, 1);
        console.log('deleted', deleted);

        console.log(event);
        let productDiv = event.dom.wrapper;
        console.log(event.dom.wrapper);
        productDiv.remove();
        thisCart.update();
      }
    }
    add(menuProduct) {
      // const thisCart = this;

      console.log('adding product', menuProduct);
      const thisCart = this;

      /* generate HTML based on template */
      const generatedHTML = templates.cartProduct(menuProduct);
      //console.log(generatedHTML);

      /* create element DOM using utils.createElementFromHTML*/

      const generatedDOM = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */

      //const menuContainer = document.querySelector(select.containerOf.menu);

      /* add created element to menu*/

      thisCart.dom.productList.appendChild(generatedDOM);

      thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
      console.log('thisCart.products', thisCart.products);
      thisCart.update();
    }

    update() {
      const thisCart = this;

      const deliveryFee = settings.cart.defaultDeliveryFee;
      let totalNumber = 0;

      let subtotalPrice = 0;

      for (let product of thisCart.products) {
        totalNumber += product.amountWidget.value;
        subtotalPrice += product.price;
      }

      if (subtotalPrice != 0) {
        thisCart.totalPrice = subtotalPrice + deliveryFee;
      } else {
        thisCart.totalPrice = 0;
      }

      thisCart.subtotalPrice = subtotalPrice;
      thisCart.deliveryFee = deliveryFee;
      thisCart.totalNumber = totalNumber;

      thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      //console.log(thisCart.dom.totalPrice);
      for (let totalPrice of thisCart.dom.totalPrice) {
        totalPrice.innerHTML = thisCart.totalPrice;
      }
      //thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;

      //console.log('totalNumber:', totalNumber);
      //console.log('subtotalPrice:', subtotalPrice);
      //console.log('thisCart.totalPrice:', thisCart.totalPrice);
    }
  }

  class CartProduct {
    constructor(menuProduct, element) {
      const thisCartProduct = this;
      thisCartProduct.id = menuProduct.id;
      thisCartProduct.amount = menuProduct.amount;
      thisCartProduct.name = menuProduct.name;
      thisCartProduct.params = menuProduct.params;
      thisCartProduct.price = menuProduct.price;
      thisCartProduct.priceSingle = menuProduct.priceSingle;

      thisCartProduct.getElements(element);
      console.log('thisCartProduct:', thisCartProduct);
      thisCartProduct.initAmountWidget();
      thisCartProduct.initActions();
    }
    getElements(element) {
      const thisCartProduct = this;

      thisCartProduct.dom = {
        amountWidget: element.querySelector(select.cartProduct.amountWidget),
        price: element.querySelector(select.cartProduct.price),
        edit: element.querySelector(select.cartProduct.edit),
        remove: element.querySelector(select.cartProduct.remove),
      };
      thisCartProduct.dom.wrapper = element;
    }
    initAmountWidget() {
      const thisCartProduct = this;

      thisCartProduct.amountWidget = new AmountWidget(
        thisCartProduct.dom.amountWidget
      );

      thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
        //thisCartProduct.amount = thisCartProduct.amountWidget.value;
        thisCartProduct.price =
          thisCartProduct.amountWidget.value * thisCartProduct.priceSingle;

        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;

        /*thisCartProduct.price =
          thisCartProduct.amount * thisCartProduct.priceSingle;
        console.log(thisCartProduct.priceSingle);
        thisCartProduct.dom.price.innerHTML = thisCartProduct.price;*/
      });
    }
    remove() {
      const thisCartProduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartProduct,
        },
      });
      thisCartProduct.dom.wrapper.dispatchEvent(event);
    }
    initActions() {
      const thisCartProduct = this;

      thisCartProduct.dom.edit.addEventListener('click', function (event) {
        event.preventDefault();
      });
      thisCartProduct.dom.remove.addEventListener('click', function (event) {
        event.preventDefault();
        thisCartProduct.remove();
        //console.log(thisCartProduct.remove());
      });
    }
    getData() {
      const thisCartProduct = this;

      const cartProductSummary = {
        id: thisCartProduct.id,
        amount: thisCartProduct.amount,
        price: thisCartProduct.price,
        priceSingle: thisCartProduct.priceSingle,
        name: thisCartProduct.name,
        params: thisCartProduct.params,
      };
      //console.log(cartProductSummary);
      return cartProductSummary;
    }
  }
  const app = {
    initMenu: function () {
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for (let productData in thisApp.data.products) {
        new Product(
          thisApp.data.products[productData].id,
          thisApp.data.products[productData]
        );
      }
    },

    initCart: function () {
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);
    },

    initData: function () {
      const thisApp = this;

      thisApp.data = {};
      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function (rawResponse) {
          return rawResponse.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse:', parsedResponse);

          // save parsedResponse as a thisApp.data.products
          thisApp.data.products = parsedResponse;

          // execute initMenu method
          thisApp.initMenu();
        });
      console.log('thisApp.data', JSON.stringify(thisApp.data));
    },
    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();

      thisApp.initCart();
    },
  };

  app.init();
}
