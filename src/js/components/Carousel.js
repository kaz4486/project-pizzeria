import Home from './Home';

class Carousel {
  constructor(element) {
    const thisCarousel = this;

    thisCarousel.render(element);
    thisCarousel.initPlugin(element);
  }

  render(element) {
    const thisCarousel = this;

    thisCarousel.element = element;
  }
  initPlugin() {
    const thisCarousel = this;
    const flkty = new Flickity(thisCarousel.element, {
      // options
      autoPlay: 3000,
      imagesLoaded: true,
    });
  }
}

export default Carousel;
