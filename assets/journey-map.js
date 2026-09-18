document.addEventListener("DOMContentLoaded", function () {
  const section = document.querySelector("[data-journey-map]");

  if (!section) return;

  const markers = Array.from(section.querySelectorAll(".journey-marker"));
  const citySelectors = Array.from(section.querySelectorAll("[data-city-target]"));
  const card = section.querySelector(".journey-story-card");
  const image = card.querySelector(".journey-story-card__image");
  const location = card.querySelector(".journey-story-card__location");
  const kicker = card.querySelector(".journey-story-card__kicker");
  const title = card.querySelector(".journey-story-card__title");
  const summary = card.querySelector(".journey-story-card__summary");
  const action = card.querySelector(".journey-story-card__action");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function showCity(marker) {
    markers.forEach(function (item) {
      const isActive = item === marker;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    citySelectors.forEach(function (item) {
      const isActive = item.dataset.cityTarget === marker.dataset.city;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    card.classList.remove("is-changing");
    void card.offsetWidth;
    card.classList.add("is-changing");

    image.src = marker.dataset.image;
    image.alt = marker.dataset.imageAlt;
    location.textContent = marker.dataset.country + " · " + marker.dataset.cityLabel;
    kicker.textContent = marker.dataset.kicker;
    title.textContent = marker.dataset.title;
    summary.textContent = marker.dataset.summary;

    if (marker.dataset.status === "published") {
      action.href = marker.dataset.url;
      action.textContent = "閱讀文章 →";
      action.removeAttribute("aria-disabled");
      action.classList.remove("is-disabled");
    } else {
      action.removeAttribute("href");
      action.textContent = "文章準備中";
      action.setAttribute("aria-disabled", "true");
      action.classList.add("is-disabled");
    }
  }

  markers.forEach(function (marker) {
    marker.addEventListener("click", function () {
      showCity(marker);
    });

    marker.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showCity(marker);
      }
    });

    marker.addEventListener("mouseenter", function () {
      if (finePointer.matches) showCity(marker);
    });

    marker.addEventListener("focus", function () {
      showCity(marker);
    });
  });

  citySelectors.forEach(function (selector) {
    selector.addEventListener("click", function () {
      const marker = section.querySelector(
        '[data-city="' + selector.dataset.cityTarget + '"]'
      );
      if (marker) showCity(marker);
    });
  });

  const defaultMarker = section.querySelector('[data-city="lisbon"]') || markers[0];
  if (defaultMarker) showCity(defaultMarker);

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    section.classList.add("is-in-view");
  } else {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            section.classList.add("is-in-view");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);
  }
});
