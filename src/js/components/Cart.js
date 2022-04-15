import { select, settings, templates, classNames } from '../settings.js';
import { utils } from '../utils.js';
import CartProduct from './CartProduct.js';

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
      if (event.id == product.id) {
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

export default Cart;
