const animatedElements = document.querySelectorAll("[data-animate]");

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.2 }
);

animatedElements.forEach((element) => observer.observe(element));

const projectScroller = document.querySelector(".project-scroller");

if (projectScroller) {
  let fadeRafId = 0;
  let fadeTimeoutId = 0;
  const fadeSize = 28;

  const updateProjectFades = () => {
    const maxScrollLeft = Math.max(
      0,
      projectScroller.scrollWidth - projectScroller.clientWidth
    );
    const scrollLeft = projectScroller.scrollLeft;
    const epsilon = 4;
    const showLeft = maxScrollLeft > 0 && scrollLeft > epsilon;
    const showRight = maxScrollLeft > 0 && scrollLeft < maxScrollLeft - epsilon;

    projectScroller.style.setProperty(
      "--fade-left",
      showLeft ? `${fadeSize}px` : "0px"
    );
    projectScroller.style.setProperty(
      "--fade-right",
      showRight ? `${fadeSize}px` : "0px"
    );
  };

  const scheduleFadeUpdate = () => {
    if (fadeRafId) {
      return;
    }
    fadeRafId = window.requestAnimationFrame(() => {
      fadeRafId = 0;
      updateProjectFades();
    });
  };

  const handleScroll = () => {
    scheduleFadeUpdate();
    if (fadeTimeoutId) {
      window.clearTimeout(fadeTimeoutId);
    }
    fadeTimeoutId = window.setTimeout(updateProjectFades, 140);
  };

  updateProjectFades();

  projectScroller.addEventListener("scroll", handleScroll, {
    passive: true,
  });

  window.addEventListener("resize", scheduleFadeUpdate);
  window.addEventListener("load", () => {
    scheduleFadeUpdate();
    window.setTimeout(scheduleFadeUpdate, 160);
  });

  projectScroller.addEventListener(
    "wheel",
    (event) => {
      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);

      const prefersHorizontal = absX > absY || event.shiftKey;

      if (!prefersHorizontal || absY === 0) {
        return;
      }

      event.preventDefault();
      const delta = absX > absY ? event.deltaX : event.deltaY;
      projectScroller.scrollLeft += delta;
    },
    { passive: false }
  );
}
