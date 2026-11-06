# Remedy Lane — Online Pharmacy Website

A fully working front-end for a fictional online pharmacy serving Chandigarh, Mohali and Panchkula. It's a concept project designed and built by **Arshdeep Kaur**.

🌐 **Live demo:** https://arshiiiverse.github.io/remedy-lane/

## What works

- 🛒 **Cart:** add items, change quantities and remove them with undo. A free-delivery progress bar, MRP savings and the delivery fee are calculated live. The cart is saved in the browser, so it survives a refresh.
- 💳 **Checkout:** validates the name, Indian mobile number, address and Tricity PIN code (160/140/134). It offers cash or UPI on delivery and shows an order confirmation with an order ID and delivery date.
- 📄 **Prescription upload:** drag and drop or browse for a file, with an image or PDF preview and a 5 MB limit.
- 🧪 **Lab test booking:** choose a test, a date (tomorrow onwards) and a home-collection time slot.
- 👩‍⚕️ **Doctor consultation:** choose a speciality and fee; the page shows today's remaining time slots.
- 🔎 **Search and filters:** header search (also on mobile), a "Find a product" bar (category, brand and name), category tabs and quick filters such as Under ₹500, New Arrivals and Offers.
- ↕️ **Sorting** by popularity, price, rating or discount.
- ♡ **Wishlist** saved in the browser.
- 📱 **Responsive** from 360px phones up to wide desktops.
- ♿ **Accessible:** keyboard focus is trapped inside open dialogs, Esc closes them, controls have ARIA states, and there's a skip link and reduced-motion support.
- 🔍 **SEO:** meta description, canonical URL, Open Graph tags and `Pharmacy` structured data (JSON-LD).

## Built with

HTML5 · CSS3 (Grid, Flexbox, custom properties) · Vanilla JavaScript · localStorage · GitHub Pages

There are no frameworks or build tools. Everything is in `index.html`, with the photos in `/images`.

## Run locally

Open `index.html` in a browser, or serve the folder with any static server.

## Credits

- Photos from [StockSnap.io](https://stocksnap.io), released under CC0 (public domain). They were resized and compressed for the web.
- Icons are hand-written inline SVG.

---

*Remedy Lane is not a real pharmacy. Products, prices and reviews are sample data. No orders are placed, no payment is taken, and uploaded files never leave your browser.*
