// =========================================================
// ARIA — WESTERN PAGE JAVASCRIPT
// =========================================================

(function () {
  "use strict";


  /* ---------------------------------------------------------
     Toast Message
     --------------------------------------------------------- */

  var toastEl = document.querySelector("[data-toast]");
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.add("is-visible");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2200);
  }


  /* ---------------------------------------------------------
     Cart / Wishlist Badges
     --------------------------------------------------------- */

  var cartCount = 0;
  var wishlistCount = 0;

  function refreshBadges() {

    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = cartCount;
      el.classList.toggle("is-visible", cartCount > 0);
    });

    document.querySelectorAll("[data-wishlist-count]").forEach(function (el) {
      el.textContent = wishlistCount;
      el.classList.toggle("is-visible", wishlistCount > 0);
    });

  }

  refreshBadges();


  /* ---------------------------------------------------------
     Add To Cart — Western Product Cards
     --------------------------------------------------------- */

  document.querySelectorAll(".btn-add-cart").forEach(function (btn) {

    btn.addEventListener("click", function () {

      var card = btn.closest(".product-card");

      var name = card
        ? card.querySelector(".product-card__name").textContent
        : "Item";

      cartCount++;

      refreshBadges();

      showToast(name + " added to your cart");


      var original = btn.textContent;

      btn.textContent = "Added ✓";

      btn.classList.add("is-added");

      btn.disabled = true;


      setTimeout(function () {

        btn.textContent = original;

        btn.classList.remove("is-added");

        btn.disabled = false;

      }, 1400);

    });

  });


  /* ---------------------------------------------------------
     Wishlist Heart Toggle
     --------------------------------------------------------- */

  document.querySelectorAll(".btn-wishlist").forEach(function (btn) {

    btn.addEventListener("click", function () {

      var isActive = btn.classList.toggle("is-active");

      wishlistCount += isActive ? 1 : -1;

      refreshBadges();


      var card = btn.closest(".product-card");

      var name = card
        ? card.querySelector(".product-card__name").textContent
        : "Item";


      if (isActive) {

        showToast(name + " added to wishlist");

      } else {

        showToast(name + " removed from wishlist");

      }

    });

  });


  /* ---------------------------------------------------------
     Western Page:
     Filter Products By Category
     --------------------------------------------------------- */

  document.querySelectorAll(".shop-section").forEach(function (section) {

    var filterBar =
      section.querySelector("[data-filter-bar]");

    var grid =
      section.querySelector("[data-product-grid]");

    var emptyEl =
      section.querySelector("[data-filter-empty]");

    var countEl =
      section.querySelector("[data-filter-count]");

    var sortSelect =
      section.querySelector("[data-sort-select]");


    if (!filterBar || !grid) return;


    var cards =
      Array.from(grid.querySelectorAll(".product-card"));


    // Remember original product order
    cards.forEach(function (card, i) {

      card.dataset.originalOrder = i;

    });


    var activeCategory = "All";


    /* -------------------------------------------------------
       Apply Category Filter
       ------------------------------------------------------- */

    function applyFilter() {

      var visibleCount = 0;


      cards.forEach(function (card) {

        var matches =
          activeCategory === "All" ||
          card.getAttribute("data-category") === activeCategory;


        card.hidden = !matches;


        if (matches) {
          visibleCount++;
        }

      });


      // Update product count
      if (countEl) {

        countEl.textContent =
          visibleCount +
          (visibleCount === 1
            ? " product"
            : " products");

      }


      // Show empty message if no products
      if (emptyEl) {

        emptyEl.hidden =
          visibleCount > 0;

      }

    }


    /* -------------------------------------------------------
       Sort Products
       ------------------------------------------------------- */

    function applySort() {

      if (!sortSelect) return;


      var mode = sortSelect.value;

      var sorted = cards.slice();


      // Low to High
      if (mode === "price-asc") {

        sorted.sort(function (a, b) {

          return (
            parseFloat(a.dataset.price) -
            parseFloat(b.dataset.price)
          );

        });

      }


      // High to Low
      else if (mode === "price-desc") {

        sorted.sort(function (a, b) {

          return (
            parseFloat(b.dataset.price) -
            parseFloat(a.dataset.price)
          );

        });

      }


      // Newest / Most Popular
      else {

        sorted.sort(function (a, b) {

          return (
            a.dataset.originalOrder -
            b.dataset.originalOrder
          );

        });

      }


      // Put sorted cards back into grid
      sorted.forEach(function (card) {

        grid.appendChild(card);

      });

    }


    /* -------------------------------------------------------
       Filter Chip Click
       ------------------------------------------------------- */

    filterBar.addEventListener("click", function (e) {

      var chip =
        e.target.closest("[data-filter-chip]");


      if (!chip) return;


      // Remove active class from all chips
      filterBar
        .querySelectorAll(".filter-chip")
        .forEach(function (c) {

          c.classList.remove("is-active");

        });


      // Add active class to clicked chip
      chip.classList.add("is-active");


      // Get selected category
      activeCategory =
        chip.getAttribute("data-filter-chip");


      // Apply filter
      applyFilter();

    });


    /* -------------------------------------------------------
       Sort Dropdown Change
       ------------------------------------------------------- */

    if (sortSelect) {

      sortSelect.addEventListener(
        "change",
        applySort
      );

    }


    // Run when page loads
    applyFilter();

    applySort();

  });


  /* ---------------------------------------------------------
     Mobile Menu Toggle
     --------------------------------------------------------- */

  var menuToggle =
    document.querySelector(".menu-toggle");

  var navbarNav =
    document.querySelector(".navbar__nav");


  if (menuToggle && navbarNav) {

    menuToggle.addEventListener("click", function () {

      var isOpen =
        navbarNav.classList.toggle("is-open");


      menuToggle.classList.toggle(
        "is-open",
        isOpen
      );


      menuToggle.setAttribute(
        "aria-expanded",
        isOpen ? "true" : "false"
      );

    });

  }


})();