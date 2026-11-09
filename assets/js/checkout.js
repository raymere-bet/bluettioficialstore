/* Checkout page: contact + delivery only, then redirect to payment gateway. */
(function () {
  "use strict";
  var P = window.STORE.PRODUCT;
  var money = window.STORE.money;

  // Load the chosen item (defaults to the on-sale product).
  var order = {
    name: P.name, sub: P.specs, price: P.price, compare: P.compare, img: P.img
  };
  try {
    var saved = JSON.parse(sessionStorage.getItem("order") || "null");
    if (saved && typeof saved.price === "number") order = saved;
  } catch (e) {}

  function set(id, txt) { var el = document.getElementById(id); if (el) el.textContent = txt; }

  var discount = Math.max(0, order.compare - order.price);
  var img = document.getElementById("co-img");
  if (img) img.src = order.img;
  set("co-name", order.name);
  set("co-var", order.sub);
  set("co-price", money(order.price));
  set("co-sub", money(order.price));
  set("co-sub-was", money(order.compare));
  set("co-disc", money(discount));
  set("co-total", money(order.price));
  set("co-save", money(discount));

  // Promo code (visual only — applied at the gateway).
  document.getElementById("co-apply").addEventListener("click", function () {
    var input = document.getElementById("co-promo");
    var note = this;
    if (!input.value.trim()) return;
    note.textContent = "Applied";
    input.style.borderColor = "var(--green)";
  });

  // Validation + redirect.
  var form = document.getElementById("co-form");
  var alertBox = document.getElementById("co-alert");

  form.addEventListener("input", function (e) {
    if (e.target.matches("input, select")) e.target.classList.remove("err");
  });

  form.addEventListener("submit", function (e) { e.preventDefault(); proceed(); });
  document.getElementById("co-continue").addEventListener("click", proceed);

  function proceed() {
    var required = form.querySelectorAll("input[required], select[required]");
    var firstBad = null;
    required.forEach(function (el) {
      var bad = !el.value.trim();
      if (el.type === "email" && el.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) bad = true;
      el.classList.toggle("err", bad);
      if (bad && !firstBad) firstBad = el;
    });

    if (firstBad) {
      alertBox.classList.add("show");
      firstBad.focus();
      firstBad.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    alertBox.classList.remove("show");

    // Persist customer details for the gateway, then redirect.
    try {
      sessionStorage.setItem("customer", JSON.stringify({
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        firstName: document.getElementById("first").value.trim(),
        lastName: document.getElementById("last").value.trim(),
        country: document.getElementById("country").value,
        address: document.getElementById("address").value.trim(),
        address2: document.getElementById("address2").value.trim(),
        postal: document.getElementById("postal").value.trim(),
        city: document.getElementById("city").value.trim()
      }));
    } catch (e) {}

    var btn = document.getElementById("co-continue");
    btn.textContent = "Redirecting…";
    btn.disabled = true;
    window.location.href = window.STORE.PAYMENT_URL;
  }
})();
