"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/utils/accordion-animation.ts
  var AccordionController = class {
    accordions = [];
    state = {
      currentIndex: 0,
      intervalId: null
    };
    TAB_DURATION = 1e4;
    // 10 seconds in milliseconds
    /**
     * Initialize the accordion controller
     */
    init() {
      const accordionElements = document.querySelectorAll('[dev-target="accordion"]');
      if (!accordionElements || accordionElements.length === 0) {
        console.error('No accordion elements found with [dev-target="accordion"]');
        return;
      }
      accordionElements.forEach((accordion, index) => {
        if (!(accordion instanceof HTMLElement)) {
          console.error(`Accordion at index ${index} is not an HTMLElement`);
          return;
        }
        const title = accordion.querySelector('[dev-target="accordion-title"]');
        const message = accordion.querySelector('[dev-target="accordion-message"]');
        if (!title) {
          console.error(`Accordion at index ${index} is missing [dev-target="accordion-title"]`);
          return;
        }
        if (!message) {
          console.error(`Accordion at index ${index} is missing [dev-target="accordion-message"]`);
          return;
        }
        accordion.addEventListener("mouseenter", () => {
          this.goToAccordion(index);
        });
        this.accordions.push(accordion);
      });
      if (this.accordions.length === 0) {
        console.error("No valid accordions found after validation");
        return;
      }
      this.activateAccordion(0);
      this.startAutoCycle();
    }
    /**
     * Activate a specific accordion by index
     */
    activateAccordion(index) {
      this.accordions.forEach((accordion) => {
        accordion.classList.remove("is-active");
        const svg2 = accordion.querySelector('[dev-target="accordion-svg"]');
        if (!svg2) {
          console.error(`Active accordion at index ${index} is missing [dev-target="accordion-svg"]`);
          return;
        }
        const circles2 = svg2.querySelectorAll("circle");
        if (!circles2 || circles2.length === 0) {
          console.error(`Active accordion at index ${index} has no circles in its SVG`);
          return;
        }
        circles2.forEach((circle) => {
          circle.setAttribute("fill", "#E7E7E7");
        });
      });
      const activeAccordion = this.accordions[index];
      activeAccordion.classList.add("is-active");
      const svg = activeAccordion.querySelector('[dev-target="accordion-svg"]');
      if (!svg) {
        console.error(`Active accordion at index ${index} is missing [dev-target="accordion-svg"]`);
        return;
      }
      const circles = svg.querySelectorAll("circle");
      if (!circles || circles.length === 0) {
        console.error(`Active accordion at index ${index} has no circles in its SVG`);
        return;
      }
      circles.forEach((circle) => {
        circle.setAttribute("fill", "#3467E5");
      });
      this.state.currentIndex = index;
    }
    /**
     * Start automatic cycling through accordion tabs
     */
    startAutoCycle() {
      this.state.intervalId = window.setInterval(() => {
        const nextIndex = (this.state.currentIndex + 1) % this.accordions.length;
        this.activateAccordion(nextIndex);
      }, this.TAB_DURATION);
    }
    /**
     * Stop automatic cycling
     */
    stop() {
      if (this.state.intervalId !== null) {
        clearInterval(this.state.intervalId);
        this.state.intervalId = null;
      }
    }
    /**
     * Manually go to a specific accordion index
     */
    goToAccordion(index) {
      if (index < 0 || index >= this.accordions.length) {
        console.error(`Invalid accordion index: ${index}`);
        return;
      }
      if (this.state.intervalId !== null) {
        clearInterval(this.state.intervalId);
      }
      this.activateAccordion(index);
      this.startAutoCycle();
    }
    /**
     * Clean up and destroy the accordion controller
     */
    destroy() {
      this.stop();
      this.accordions = [];
      this.state = {
        currentIndex: 0,
        intervalId: null
      };
    }
  };

  // src/index.ts
  window.Webflow ||= [];
  window.Webflow.push(() => {
    const accordionController = new AccordionController();
    accordionController.init();
  });
})();
//# sourceMappingURL=index.js.map
