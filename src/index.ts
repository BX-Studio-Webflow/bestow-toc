import './styles/accordion-animations.css';

import { FaqTocController } from '$utils/faq-toc';

window.Webflow ||= [];
window.Webflow.push(() => {
  const faqTocController = new FaqTocController();
  faqTocController.init();
});
