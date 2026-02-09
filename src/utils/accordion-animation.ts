/**
 * Automatic accordion animation controller
 * Handles automatic tab cycling with hover-based activation
 */

interface AccordionState {
  currentIndex: number;
  intervalId: number | null;
}

export class AccordionController {
  private accordions: HTMLElement[] = [];
  private state: AccordionState = {
    currentIndex: 0,
    intervalId: null,
  };
  private readonly TAB_DURATION = 10000; // 10 seconds in milliseconds
  /**
   * Initialize the accordion controller
   */
  init(): void {
    // Get all accordion items
    const accordionElements = document.querySelectorAll('[dev-target="accordion"]');

    if (!accordionElements || accordionElements.length === 0) {
      console.error('No accordion elements found with [dev-target="accordion"]');
      return;
    }

    // Convert NodeList to Array and validate each accordion
    accordionElements.forEach((accordion, index) => {
      if (!(accordion instanceof HTMLElement)) {
        console.error(`Accordion at index ${index} is not an HTMLElement`);
        return;
      }

      // Validate required child elements
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

      // Setup hover to set active accordion
      accordion.addEventListener('mouseenter', () => {
        this.goToAccordion(index);
      });
      this.accordions.push(accordion);
    });

    if (this.accordions.length === 0) {
      console.error('No valid accordions found after validation');
      return;
    }

    // Initialize first accordion as active
    this.activateAccordion(0);

    // Start automatic cycling
    this.startAutoCycle();
  }

  /**
   * Activate a specific accordion by index
   */
  private activateAccordion(index: number): void {
    // Deactivate all accordions
    this.accordions.forEach((accordion) => {
      accordion.classList.remove('is-active');
      const svg = accordion.querySelector('[dev-target="accordion-svg"]') as SVGSVGElement;
      if (!svg) {
        console.error(`Active accordion at index ${index} is missing [dev-target="accordion-svg"]`);
        return;
      }
      const circles = svg.querySelectorAll('circle');
      if (!circles || circles.length === 0) {
        console.error(`Active accordion at index ${index} has no circles in its SVG`);
        return;
      }

      circles.forEach((circle) => {
        circle.setAttribute('fill', '#E7E7E7'); // new color
      });
    });

    // Activate the target accordion
    const activeAccordion = this.accordions[index];
    activeAccordion.classList.add('is-active');

    const svg = activeAccordion.querySelector('[dev-target="accordion-svg"]') as SVGSVGElement;
    if (!svg) {
      console.error(`Active accordion at index ${index} is missing [dev-target="accordion-svg"]`);
      return;
    }
    const circles = svg.querySelectorAll('circle');
    if (!circles || circles.length === 0) {
      console.error(`Active accordion at index ${index} has no circles in its SVG`);
      return;
    }

    circles.forEach((circle) => {
      circle.setAttribute('fill', '#3467E5'); // new color
    });

    // Update state
    this.state.currentIndex = index;
  }

  /**
   * Start automatic cycling through accordion tabs
   */
  private startAutoCycle(): void {
    this.state.intervalId = window.setInterval(() => {
      const nextIndex = (this.state.currentIndex + 1) % this.accordions.length;
      this.activateAccordion(nextIndex);
    }, this.TAB_DURATION);
  }

  /**
   * Stop automatic cycling
   */
  stop(): void {
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
      this.state.intervalId = null;
    }
  }

  /**
   * Manually go to a specific accordion index
   */
  goToAccordion(index: number): void {
    if (index < 0 || index >= this.accordions.length) {
      console.error(`Invalid accordion index: ${index}`);
      return;
    }

    // Stop and restart the auto-cycle
    if (this.state.intervalId !== null) {
      clearInterval(this.state.intervalId);
    }

    this.activateAccordion(index);
    this.startAutoCycle();
  }

  /**
   * Clean up and destroy the accordion controller
   */
  destroy(): void {
    this.stop();
    this.accordions = [];
    this.state = {
      currentIndex: 0,
      intervalId: null,
    };
  }
}
