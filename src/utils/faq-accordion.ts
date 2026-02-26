/**
 * FAQ accordion controller
 *
 * Handles:
 * - Left-nav tab clicks → smooth scroll to the matching accordion-group section (by id)
 * - Individual accordion item open/close within each group
 */

export class FaqAccordionController {
  private tabLinks: HTMLElement[] = [];
  private accordionItems: HTMLElement[] = [];

  init(): void {
    this.initTabNav();
    this.initAccordionItems();
  }

  // ─── Left-side tab navigation ───────────────────────────────────────────────

  private initTabNav(): void {
    const links = document.querySelectorAll<HTMLElement>('.tab-link');

    if (!links.length) {
      console.error('No .tab-link elements found');
      return;
    }

    links.forEach((link) => {
      this.tabLinks.push(link);

      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleTabClick(link);
      });
    });
  }

  private handleTabClick(clickedLink: HTMLElement): void {
    const targetId = clickedLink.getAttribute('goto');
    if (!targetId) return;

    // Find the accordion-group whose h5 has the matching dev-target
    const targetTitle = document.querySelector<HTMLElement>(`[dev-target="${targetId}"]`);

    if (!targetTitle) {
      console.error(`No element found with [dev-target="${targetId}"]`);
      return;
    }

    // Scroll the parent accordion-group into view
    const section = targetTitle.closest<HTMLElement>('.accordion-group') ?? targetTitle;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Update active tab
    this.tabLinks.forEach((l) => l.classList.remove('is-active'));
    clickedLink.classList.add('is-active');
  }

  // ─── Accordion open / close ──────────────────────────────────────────────────

  private initAccordionItems(): void {
    const items = document.querySelectorAll<HTMLElement>('.one-accordion-item');

    if (!items.length) {
      console.error('No .one-accordion-item elements found');
      return;
    }

    items.forEach((item) => {
      this.accordionItems.push(item);

      const header = item.querySelector<HTMLElement>('.accordion-header');
      if (!header) return;

      header.addEventListener('click', () => {
        this.toggleAccordion(item);
      });
    });
  }

  private toggleAccordion(item: HTMLElement): void {
    const isOpen = item.classList.contains('is-open');

    // Close all siblings in the same group
    const group = item.closest<HTMLElement>('.accordion-group');
    if (group) {
      group.querySelectorAll<HTMLElement>('.one-accordion-item').forEach((sibling) => {
        sibling.classList.remove('is-open');
      });
    }

    // Toggle clicked item
    if (!isOpen) {
      item.classList.add('is-open');
    }
  }

  destroy(): void {
    this.tabLinks = [];
    this.accordionItems = [];
  }
}
