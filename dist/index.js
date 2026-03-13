"use strict";
(() => {
  // bin/live-reload.js
  new EventSource(`${"http://localhost:3000"}/esbuild`).addEventListener("change", () => location.reload());

  // src/utils/faq-toc.ts
  var ACTIVE_CLASS = "is-active";
  var SCROLL_OFFSET = 160;
  var SCROLL_TO_OFFSET_FALLBACK = 100;
  var TOC_TO_SECTION = {
    "products-and-services": "product-and-services",
    "technical-specifications-and-security": "tech-specifications-and-security"
  };
  var FaqTocController = class {
    tocItems = [];
    sections = [];
    scrollRaf = null;
    boundOnScroll = () => this.onScroll();
    init() {
      this.collectElements();
      this.validateMappings();
      this.initClickHandlers();
      this.initScrollSpy();
      this.updateActiveState();
    }
    validateMappings() {
      const sectionIds = new Set(this.sections.map((s) => s.getAttribute("dev-target")));
      for (const item of this.tocItems) {
        const tocId = item.getAttribute("dev-target-toc");
        if (!tocId) continue;
        const sectionId = TOC_TO_SECTION[tocId] ?? tocId;
        if (!sectionIds.has(sectionId)) {
          console.error(
            `[FaqToc] TOC mismatch: tocId="${tocId}" has no matching section (resolved sectionId="${sectionId}")`
          );
        }
      }
    }
    collectElements() {
      this.tocItems = Array.from(document.querySelectorAll("[dev-target-toc]"));
      this.sections = Array.from(
        document.querySelectorAll(".one-group [dev-target]")
      ).filter(
        (el) => el.hasAttribute("dev-target") && el.getAttribute("dev-target") !== "one-group"
      );
    }
    initClickHandlers() {
      this.tocItems.forEach((item) => {
        item.addEventListener("click", (e) => {
          e.preventDefault();
          this.handleTocClick(item);
        });
      });
    }
    handleTocClick(tocItem) {
      const tocId = tocItem.getAttribute("dev-target-toc");
      if (!tocId) return;
      const sectionId = TOC_TO_SECTION[tocId] ?? tocId;
      const section = this.sections.find((s) => s.getAttribute("dev-target") === sectionId);
      if (!section) {
        console.error(
          `[FaqToc] TOC mismatch: no section found for tocId="${tocId}" (resolved sectionId="${sectionId}")`
        );
        return;
      }
      const nav = document.querySelector(".nav_component");
      const offset = nav ? nav.getBoundingClientRect().height : SCROLL_TO_OFFSET_FALLBACK;
      const top = window.scrollY + section.getBoundingClientRect().top - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
    initScrollSpy() {
      window.addEventListener("scroll", this.boundOnScroll, { passive: true });
    }
    onScroll() {
      if (this.scrollRaf != null) return;
      this.scrollRaf = requestAnimationFrame(() => {
        this.updateActiveState();
        this.scrollRaf = null;
      });
    }
    updateActiveState() {
      const activeSectionId = this.getActiveSectionId();
      if (!activeSectionId) {
        this.tocItems.forEach((item) => item.classList.remove(ACTIVE_CLASS));
        return;
      }
      const tocIdForSection = Object.entries(TOC_TO_SECTION).find(([, sectionId]) => sectionId === activeSectionId)?.[0] ?? activeSectionId;
      this.tocItems.forEach((item) => {
        const tocId = item.getAttribute("dev-target-toc");
        if (tocId === tocIdForSection || tocId === activeSectionId) {
          item.classList.add(ACTIVE_CLASS);
        } else {
          item.classList.remove(ACTIVE_CLASS);
        }
      });
    }
    getActiveSectionId() {
      const viewportTop = window.scrollY + SCROLL_OFFSET;
      let activeSection = null;
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
        return activeSection.getAttribute("dev-target");
      }
      if (this.sections.length) {
        const first = this.sections[0];
        const rect = first.getBoundingClientRect();
        if (rect.top > 0) {
          return first.getAttribute("dev-target");
        }
      }
      return null;
    }
    destroy() {
      window.removeEventListener("scroll", this.boundOnScroll);
      if (this.scrollRaf != null) {
        cancelAnimationFrame(this.scrollRaf);
      }
      this.tocItems.forEach((item) => item.classList.remove(ACTIVE_CLASS));
      this.tocItems = [];
      this.sections = [];
    }
  };

  // src/index.ts
  window.Webflow ||= [];
  window.Webflow.push(() => {
    const faqTocController = new FaqTocController();
    faqTocController.init();
  });
})();
//# sourceMappingURL=index.js.map
