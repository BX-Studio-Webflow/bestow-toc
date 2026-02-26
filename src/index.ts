import { FaqAccordionController } from '$utils/faq-accordion';

window.Webflow ||= [];
window.Webflow.push(() => {
  const faqAccordionController = new FaqAccordionController();
  faqAccordionController.init();
});
