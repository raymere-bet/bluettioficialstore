# bluettioficialstore

Single-product landing page + checkout for **BLUETTI Elite 300 Portable Power Station**.

## Structure
- `index.html` — product page (the store home). Only the Elite 300 is on sale; the other bundles are shown with a lock and marked "Not available".
- `checkout.html` — contact + delivery form, order summary, then redirects to the payment gateway.
- `assets/` — css, js, fonts and images (self-contained).

## Flow
`Buy Now` -> `checkout.html` -> `Continue to Payment` -> payment gateway URL.

The gateway URL lives in one place: `PAYMENT_URL` in `assets/js/app.js`.

## Deploy
Upload the whole folder to any static host (Netlify, Vercel, Hostinger, cPanel...). No build step.
