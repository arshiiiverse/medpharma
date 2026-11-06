<p align="center"><img src="assets/logo.svg" alt="Medpharma" width="260" /></p>

# Medpharma — Online Pharmacy Website

A complete, fully working front-end for a fictional online pharmacy serving Chandigarh, Mohali and Panchkula. It's a concept project designed and built by **Arshdeep Kaur**.

🌐 **Live demo:** https://arshiiiverse.github.io/medpharma/

## Pages

| Page | What it does |
|---|---|
| `index.html` | Home: hero, product finder, categories, services, best-seller tabs, featured brand, newsletter |
| `catalog.html` | Full catalogue: filters (category, brand, price, rating, discount, new, hide Rx), search, sorting, pagination, and shareable URLs that work with the back button |
| `product.html?id=…` | Product page: quantity, Add to cart, Buy now, PIN-code delivery check, benefits, how to use, related products, `Product` structured data |
| `lab-tests.html` | 10 test packages with filter tabs and sorting; booking with date, time slot and address |
| `doctors.html` | 10 doctor profiles with speciality filter and search; video consultation booking with time slots |
| `orders.html` | Order history with a live status tracker, track by order ID, reorder, cancel, and lab/doctor bookings |
| `about.html` · `contact.html` · `faq.html` · `legal.html` | Company pages, a validated contact form, searchable FAQs (with `FAQPage` structured data), and privacy, terms and returns |
| `404.html` | Custom "page not found" page for GitHub Pages |

## Features on every page

- 🛒 **Cart drawer:** change quantities, remove with undo, see a free-delivery progress bar and your savings, then check out with form validation (Indian mobile number, Tricity PIN codes).
- ♡ **Wishlist drawer:** move items to the cart, add all, or clear with undo.
- 📄 **Prescription upload:** drag and drop, with an image or PDF preview.
- 💾 **Saved in the browser:** the cart, wishlist, orders, bookings and city are kept in `localStorage`.
- 📱 **Responsive** from 360px phones to wide desktops, including a slide-out filter drawer on mobile.
- ♿ **Accessible:** skip link, keyboard focus kept inside open dialogs, Esc to close, ARIA states on controls, reduced-motion support.
- 🔍 **SEO:** a unique title and description per page, canonical URLs, Open Graph tags, JSON-LD structured data (`Pharmacy`, `Product`, `FAQPage`), `sitemap.xml` and `robots.txt`.

## Built with

HTML5 · CSS3 · Vanilla JavaScript (no frameworks, no build step) · GitHub Pages

```
assets/styles.css   shared styles
assets/data.js      products, categories, lab tests, doctors
assets/app.js       header, footer, cart, wishlist, checkout and booking forms
assets/logo.svg     Medpharma logo (logo-mark.svg = icon)
images/             product and page photos
```

## Run locally

Serve the folder with any static server, for example `npx http-server`, and open `index.html`.

## Credits

- Photos from [StockSnap.io](https://stocksnap.io), released under CC0 (public domain). They were resized and compressed for the web.
- The logo and icons are original SVG.

---

*Medpharma here is a fictional demo store. Products, prices, doctors and reviews are sample data. No orders are placed, no payment is taken, and nothing you enter leaves your browser.*
