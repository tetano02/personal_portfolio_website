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
  let activePointerId = null;
  let dragStartX = 0;
  let dragStartScrollLeft = 0;
  let draggedDistance = 0;
  let shouldSuppressClick = false;
  const dragActivationDistance = 6;

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

  const stopDrag = () => {
    if (activePointerId === null) {
      return;
    }

    if (draggedDistance <= dragActivationDistance) {
      shouldSuppressClick = false;
    }

    activePointerId = null;
    draggedDistance = 0;
    projectScroller.classList.remove("is-dragging");
  };

  projectScroller.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    activePointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartScrollLeft = projectScroller.scrollLeft;
    draggedDistance = 0;
    shouldSuppressClick = false;
    projectScroller.classList.add("is-dragging");
    projectScroller.setPointerCapture(event.pointerId);
  });

  projectScroller.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointerId) {
      return;
    }

    const deltaX = event.clientX - dragStartX;
    draggedDistance = Math.max(draggedDistance, Math.abs(deltaX));
    projectScroller.scrollLeft = dragStartScrollLeft - deltaX;

    if (draggedDistance > dragActivationDistance) {
      shouldSuppressClick = true;
      if (event.cancelable) {
        event.preventDefault();
      }
    }
  });

  const endPointerDrag = (event) => {
    if (event.pointerId !== activePointerId) {
      return;
    }
    stopDrag();
  };

  projectScroller.addEventListener("pointerup", endPointerDrag);
  projectScroller.addEventListener("pointercancel", endPointerDrag);
  projectScroller.addEventListener("lostpointercapture", stopDrag);
  projectScroller.addEventListener("dragstart", (event) => {
    event.preventDefault();
  });
  projectScroller.addEventListener(
    "click",
    (event) => {
      if (!shouldSuppressClick) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      shouldSuppressClick = false;
    },
    true
  );
}
