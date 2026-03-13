/**
 * FAQ TOC controller: scroll-spy + click-to-scroll
 *
 * Attribute contract:
 *   [dev-target-toc="section-id"] — TOC link; value matches section's dev-target
 *   [dev-target="section-id"]      — section heading (e.g. h4.group-heading)
 *
 * On scroll: highlights the TOC item whose section is in view.
 * On TOC click: scrolls to the corresponding section.
 */

const ACTIVE_CLASS = 'is-active';
const SCROLL_OFFSET = 160; // px from top for "active" detection
const SCROLL_TO_OFFSET_FALLBACK = 100; // px when nav not found

/** TOC id → section dev-target (when they differ in markup) */
const TOC_TO_SECTION: Record<string, string> = {
  'products-and-services': 'product-and-services',
  'technical-specifications-and-security': 'tech-specifications-and-security',
};

export class FaqTocController {
  private tocItems: HTMLElement[] = [];
  private sections: HTMLElement[] = [];
  private scrollRaf: number | null = null;
  private boundOnScroll = () => this.onScroll();

  init(): void {
    this.collectElements();
    this.validateMappings();
    this.initClickHandlers();
    this.initScrollSpy();
    this.updateActiveState(); // set initial state
  }

  private validateMappings(): void {
    const sectionIds = new Set(this.sections.map((s) => s.getAttribute('dev-target')));
    for (const item of this.tocItems) {
      const tocId = item.getAttribute('dev-target-toc');
      if (!tocId) continue;
      const sectionId = TOC_TO_SECTION[tocId] ?? tocId;
      if (!sectionIds.has(sectionId)) {
        console.error(
          `[FaqToc] TOC mismatch: tocId="${tocId}" has no matching section (resolved sectionId="${sectionId}")`
        );
      }
    }
  }

  private collectElements(): void {
    this.tocItems = Array.from(document.querySelectorAll<HTMLElement>('[dev-target-toc]'));
    this.sections = Array.from(
      document.querySelectorAll<HTMLElement>('.one-group [dev-target]')
    ).filter(
      (el) => el.hasAttribute('dev-target') && el.getAttribute('dev-target') !== 'one-group'
    );
  }

  private initClickHandlers(): void {
    this.tocItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleTocClick(item);
      });
    });
  }

  private handleTocClick(tocItem: HTMLElement): void {
    const tocId = tocItem.getAttribute('dev-target-toc');
    if (!tocId) return;

    const sectionId = TOC_TO_SECTION[tocId] ?? tocId;
    const section = this.sections.find((s) => s.getAttribute('dev-target') === sectionId);
    if (!section) {
      console.error(
        `[FaqToc] TOC mismatch: no section found for tocId="${tocId}" (resolved sectionId="${sectionId}")`
      );
      return;
    }

    const nav = document.querySelector<HTMLElement>('.nav_component');
    const offset = nav ? nav.getBoundingClientRect().height : SCROLL_TO_OFFSET_FALLBACK;
    const top = window.scrollY + section.getBoundingClientRect().top - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  private initScrollSpy(): void {
    window.addEventListener('scroll', this.boundOnScroll, { passive: true });
  }

  private onScroll(): void {
    if (this.scrollRaf != null) return;
    this.scrollRaf = requestAnimationFrame(() => {
      this.updateActiveState();
      this.scrollRaf = null;
    });
  }

  private updateActiveState(): void {
    const activeSectionId = this.getActiveSectionId();
    if (!activeSectionId) {
      this.tocItems.forEach((item) => item.classList.remove(ACTIVE_CLASS));
      return;
    }

    const tocIdForSection =
      Object.entries(TOC_TO_SECTION).find(([, sectionId]) => sectionId === activeSectionId)?.[0] ??
      activeSectionId;

    this.tocItems.forEach((item) => {
      const tocId = item.getAttribute('dev-target-toc');
      if (tocId === tocIdForSection || tocId === activeSectionId) {
        item.classList.add(ACTIVE_CLASS);
      } else {
        item.classList.remove(ACTIVE_CLASS);
      }
    });
  }

  private getActiveSectionId(): string | null {
    const viewportTop = window.scrollY + SCROLL_OFFSET;
    let activeSection: HTMLElement | null = null;
    let activeTop = -Infinity;

    for (const section of this.sections) {
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;

      if (top <= viewportTop && top > activeTop) {
        activeTop = top;
        activeSection = section;
      }
    }

    if (activeSection) {
      return activeSection.getAttribute('dev-target');
    }

    if (this.sections.length) {
      const first = this.sections[0];
      const rect = first.getBoundingClientRect();
      if (rect.top > 0) {
        return first.getAttribute('dev-target');
      }
    }

    return null;
  }

  destroy(): void {
    window.removeEventListener('scroll', this.boundOnScroll);
    if (this.scrollRaf != null) {
      cancelAnimationFrame(this.scrollRaf);
    }
    this.tocItems.forEach((item) => item.classList.remove(ACTIVE_CLASS));
    this.tocItems = [];
    this.sections = [];
  }
}
