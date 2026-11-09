/* BLUETTI Elite 300 — shared store data + behaviour.
   Single product on sale; other variants shown but locked. */
(function () {
  "use strict";

  var PAYMENT_URL = "https://go.fruitfypay.com/ve1M9zddW4Ff2qfe";

  var PRODUCT = {
    name: "BLUETTI Elite 300 Portable Power Station",
    specs: "2.400W | 3.014,4Wh",
    img: "assets/img/g1.webp",
    price: 109.9,
    compare: 1649.0
  };
  // The requested price point drives the compare-at shown and the discount %.
  PRODUCT.compare = 1649.0;

  function money(n) {
    return n.toFixed(2).replace(".", ",").replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " €";
  }
  function moneyInt(n) {
    return n.toLocaleString("de-DE") + " €";
  }
  PRODUCT.priceLabel = money(PRODUCT.price);
  PRODUCT.compareLabel = money(PRODUCT.compare);
  PRODUCT.saveLabel = money(PRODUCT.compare - PRODUCT.price);
  PRODUCT.offPct = Math.round((1 - PRODUCT.price / PRODUCT.compare) * 100);

  window.STORE = { PRODUCT: PRODUCT, PAYMENT_URL: PAYMENT_URL, money: money, moneyInt: moneyInt };

  /* ---------- Countdown (resets daily) ---------- */
  function startCountdown(el) {
    if (!el) return;
    function tick() {
      var now = new Date();
      var end = new Date(now);
      end.setHours(23, 59, 59, 999);
      var d = Math.max(0, end - now);
      var h = Math.floor(d / 3600000);
      var m = Math.floor((d % 3600000) / 60000);
      var s = Math.floor((d % 60000) / 1000);
      el.textContent = "ends in " + pad(h) + ":" + pad(m) + ":" + pad(s);
    }
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    tick();
    setInterval(tick, 1000);
  }
  window.startCountdown = startCountdown;

  document.addEventListener("DOMContentLoaded", function () {
    startCountdown(document.getElementById("promo-timer"));

    // Fill every element marked with data-money / data-text.
    document.querySelectorAll("[data-money]").forEach(function (el) {
      var v = el.getAttribute("data-money");
      if (v === "price") el.textContent = PRODUCT.priceLabel;
      else if (v === "compare") el.textContent = PRODUCT.compareLabel;
      else if (v === "save") el.textContent = PRODUCT.saveLabel;
    });
    document.querySelectorAll("[data-text]").forEach(function (el) {
      var v = el.getAttribute("data-text");
      if (v === "off") el.textContent = "-" + PRODUCT.offPct + "%";
      if (v === "pct") el.textContent = PRODUCT.offPct + "%";
    });
    document.querySelectorAll("[data-paylink]").forEach(function (el) {
      el.setAttribute("href", PAYMENT_URL);
    });

    /* ---------- Gallery ---------- */
    var main = document.getElementById("gallery-main");
    if (main) {
      var thumbs = document.querySelectorAll(".gallery__thumbs button");
      thumbs.forEach(function (btn) {
        btn.addEventListener("click", function () {
          thumbs.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          main.src = btn.getAttribute("data-full");
        });
      });
      var wrap = document.getElementById("gallery-track");
      if (wrap) {
        wrap.addEventListener("mousemove", function (e) {
          var r = wrap.getBoundingClientRect();
          main.style.transformOrigin =
            ((e.clientX - r.left) / r.width) * 100 + "% " + ((e.clientY - r.top) / r.height) * 100 + "%";
        });
      }
    }

    /* ---------- Variants (only the on-sale one is buyable) ---------- */
    var variantList = document.querySelectorAll(".variant");
    var soldNote = document.getElementById("sold-note");
    var buyBtns = document.querySelectorAll("[data-buynow]");
    var heroImg = document.getElementById("gallery-main");

    function selectVariant(v) {
      variantList.forEach(function (x) { x.classList.remove("active"); });
      v.classList.add("active");

      var locked = v.classList.contains("locked");
      var price = Number(v.getAttribute("data-price"));
      var compare = Number(v.getAttribute("data-compare"));
      var pct = Math.round((1 - price / compare) * 100);

      setTxt("p-title", v.getAttribute("data-name"));
      setTxt("p-price", money(price));
      setTxt("p-was", money(compare));
      setTxt("p-off", "-" + pct + "%");
      setTxt("p-save", money(compare - price));
      setTxt("sb-name", v.getAttribute("data-name"));
      setTxt("sb-price", money(price));
      setTxt("sb-was", money(compare));
      if (heroImg) heroImg.src = v.getAttribute("data-img");
      var sbImg = document.getElementById("sb-img");
      if (sbImg) sbImg.src = v.getAttribute("data-img");

      if (soldNote) soldNote.style.display = locked ? "flex" : "none";
      buyBtns.forEach(function (b) {
        b.disabled = locked;
        b.textContent = locked ? "Not Available" : "Buy Now";
      });
    }
    function setTxt(id, t) { var el = document.getElementById(id); if (el) el.textContent = t; }

    variantList.forEach(function (v) {
      v.addEventListener("click", function () { selectVariant(v); });
    });

    /* ---------- Show more features ---------- */
    var moreBtn = document.getElementById("feat-more");
    if (moreBtn) {
      moreBtn.addEventListener("click", function () {
        document.querySelectorAll(".feature-list .extra").forEach(function (li) { li.hidden = false; });
        moreBtn.remove();
      });
    }

    /* ---------- FAQ ---------- */
    document.querySelectorAll(".faq__q").forEach(function (q) {
      q.addEventListener("click", function () {
        var item = q.parentElement;
        var open = item.classList.contains("open");
        document.querySelectorAll(".faq__item").forEach(function (i) { i.classList.remove("open"); });
        if (!open) item.classList.add("open");
      });
    });

    /* ---------- Sticky buy bar ---------- */
    var sticky = document.getElementById("sticky-buy");
    var anchor = document.getElementById("buy-anchor");
    if (sticky && anchor && "IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        sticky.classList.toggle("show", !entries[0].isIntersecting);
      }, { rootMargin: "-120px 0px 0px 0px" }).observe(anchor);
    }

    /* ---------- Buy now → checkout ---------- */
    function goCheckout() {
      var v = document.querySelector(".variant.active");
      var name = v ? v.getAttribute("data-name") : PRODUCT.name;
      var sub = v ? v.getAttribute("data-sub") : PRODUCT.specs;
      var price = v ? v.getAttribute("data-price") : PRODUCT.price;
      var compare = v ? v.getAttribute("data-compare") : PRODUCT.compare;
      var img = v ? v.getAttribute("data-img") : PRODUCT.img;
      try {
        sessionStorage.setItem("order", JSON.stringify({
          name: name, sub: sub, price: Number(price), compare: Number(compare), img: img
        }));
      } catch (e) {}
      window.location.href = "checkout.html";
    }
    document.querySelectorAll("[data-buynow]").forEach(function (b) {
      b.addEventListener("click", goCheckout);
    });
  });
})();
