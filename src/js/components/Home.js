/* eslint-disable no-undef */
import { templates, select, classNames } from '../settings.js';

class Home {
  constructor(element) {
    const thisHome = this;

    thisHome.render(element);
    thisHome.initWidgets(thisHome.dom.carousel);
  }

  render(element) {
    const thisHome = this;

    const generatedHTML = templates.home();

    thisHome.dom = {};

    thisHome.dom.wrapper = element;

    thisHome.dom.wrapper.innerHTML = generatedHTML;

    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(
      select.home.carousel
    );

    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.navLinks = document.querySelectorAll(select.nav.links);
    thisHome.homeLinks = document.querySelectorAll(select.nav.homeLinks);
    console.log(thisHome.homeLinks);

    const idFromHash = window.location.hash.replace('#/', '');

    let pageMatchingHash = thisHome.pages[0].id;

    for (let page of thisHome.pages) {
      if (page.id == idFromHash) {
        pageMatchingHash = page.id;
        break;
      }
    }

    thisHome.activatePage(pageMatchingHash);

    for (let link of thisHome.homeLinks) {
      link.addEventListener('click', function (event) {
        const clickedElement = this;
        event.preventDefault();

        /* get page id from href attribute */
        const id = clickedElement.getAttribute('href').replace('#', '');

        /* run this.App.activatePage with that id */
        thisHome.activatePage(id);

        /* change URL hash */
        window.location.hash = '#/' + id;
      });
    }
  }
  activatePage(pageId) {
    const thisHome = this;

    /* add class 'active to matching pages, remove from non-matching */
    for (let page of thisHome.pages) {
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class 'active to matching links, remove from non-matching */
    for (let link of thisHome.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  }
  initWidgets(element) {
    //const thisHome = this;

    new Flickity(element);
  }
}

export default Home;
