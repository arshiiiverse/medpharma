/* =========================================================
   Medpharma — catalogue data (sample data for the demo store)
   ========================================================= */
window.MP_DATA = (function () {
  const CATEGORIES = [
    { id: 'medicines', name: 'Medicines',              img: 'images/paracetamol.jpg',  blurb: 'Everyday OTC medicines and prescription essentials.' },
    { id: 'vitamins',  name: 'Vitamins & Supplements', img: 'images/oranges.jpg',      blurb: 'Daily nutrition, immunity and gut health.' },
    { id: 'skin',      name: 'Skin Care',              img: 'images/skin-care.jpg',    blurb: 'Dermatologist-approved care for every skin type.' },
    { id: 'fitness',   name: 'Fitness & Nutrition',    img: 'images/whey.jpg',         blurb: 'Protein and wholesome snacks for active days.' },
    { id: 'baby',      name: 'Baby Care',              img: 'images/baby-lotion.jpg',  blurb: 'Gentle, paediatrician-tested baby essentials.' },
    { id: 'ayurveda',  name: 'Ayurveda',               img: 'images/ashwagandha.jpg',  blurb: 'Traditional herbal wellness, standardised for quality.' },
    { id: 'devices',   name: 'Health Devices',         img: 'images/stethoscope.jpg',  blurb: 'Reliable devices for home health monitoring.' },
    { id: 'hygiene',   name: 'Masks & Hygiene',        img: 'images/face-masks.jpg',   blurb: 'Protection for you and your family.' }
  ];

  const P = (o) => Object.assign({ isNew: false, rx: false, stock: 25 }, o);

  const PRODUCTS = [
    // ---- Medicines ----
    P({ id: 1, name: 'Paracetamol 500 mg Tablets', pack: 'Strip of 15 tablets', cat: 'medicines', brand: 'MediPlus', price: 32, mrp: 35, rating: 4.8, reviews: 5320, sold: 4200, img: 'images/paracetamol.jpg',
        desc: 'Fast, effective relief from fever, headache, body ache and toothache. Gentle on the stomach when taken as directed.',
        highlights: ['Relieves fever and mild-to-moderate pain', 'Suitable for adults and children over 12', 'Works within 30–60 minutes'],
        use: 'Adults: 1–2 tablets every 4–6 hours as needed. Do not exceed 8 tablets in 24 hours.' }),
    P({ id: 2, name: 'Iron & Folic Acid Tablets', pack: 'Strip of 30 tablets', cat: 'medicines', brand: 'MediPlus', price: 119, mrp: 145, rating: 4.5, reviews: 640, sold: 720, rx: true, img: 'images/tablets.jpg',
        desc: 'Supports healthy haemoglobin levels and helps prevent iron-deficiency anaemia. Commonly prescribed during pregnancy.',
        highlights: ['Ferrous fumarate with folic acid', 'Supports red blood cell formation', 'Prescription required'],
        use: 'Take as prescribed by your doctor, usually one tablet daily after a meal.' }),
    P({ id: 3, name: 'Cetirizine 10 mg Tablets', pack: 'Strip of 10 tablets', cat: 'medicines', brand: 'Allercare', price: 22, mrp: 25, rating: 4.6, reviews: 2890, sold: 2600, img: 'images/cetirizine.jpg',
        desc: 'Antihistamine for relief from sneezing, runny nose, itchy eyes and skin allergies. Once-a-day dose.',
        highlights: ['24-hour allergy relief', 'Relieves sneezing, itching and watery eyes', 'Once-daily dosing'],
        use: 'Adults: 1 tablet once daily, preferably at night. May cause drowsiness.' }),
    P({ id: 4, name: 'Antacid Chewable Tablets', pack: 'Pack of 20 tablets', cat: 'medicines', brand: 'MediPlus', price: 59, mrp: 70, rating: 4.4, reviews: 1180, sold: 950, isNew: true, img: 'images/antacid.jpg',
        desc: 'Quick relief from acidity, heartburn and indigestion with a cool mint flavour.',
        highlights: ['Neutralises excess stomach acid', 'Mint flavour, sugar-free', 'Starts working in minutes'],
        use: 'Chew 1–2 tablets after meals or when symptoms occur. Maximum 8 tablets a day.' }),

    // ---- Vitamins & supplements ----
    P({ id: 5, name: 'Omega-3 Fish Oil 1000 mg', pack: '60 softgels', cat: 'vitamins', brand: 'Verde Wellness', price: 549, mrp: 699, rating: 4.8, reviews: 1234, sold: 980, isNew: true, img: 'images/omega3.jpg',
        desc: 'Triple-strength omega-3 with EPA and DHA to support heart, brain and joint health. Molecularly distilled for purity.',
        highlights: ['330 mg EPA + 220 mg DHA per softgel', 'Supports heart, brain and eye health', 'No fishy aftertaste'],
        use: '1 softgel twice daily with meals, or as directed by a healthcare professional.' }),
    P({ id: 6, name: 'Vitamin C 1000 mg Tablets', pack: '60 tablets', cat: 'vitamins', brand: 'Verde Wellness', price: 299, mrp: 399, rating: 4.7, reviews: 2210, sold: 1500, img: 'images/vitamin-c.jpg',
        desc: 'High-strength vitamin C with zinc for everyday immunity and healthy, glowing skin.',
        highlights: ['1000 mg vitamin C + 10 mg zinc', 'Supports immunity and collagen formation', 'Vegetarian tablets'],
        use: '1 tablet daily after breakfast.' }),
    P({ id: 7, name: 'Daily Multivitamin for Adults', pack: '90 tablets', cat: 'vitamins', brand: 'NutriCore', price: 649, mrp: 799, rating: 4.6, reviews: 1410, sold: 870, img: 'images/multivitamin.jpg',
        desc: 'A complete blend of 24 vitamins and minerals to fill daily nutrition gaps and support energy levels.',
        highlights: ['24 essential vitamins and minerals', 'Supports energy, immunity and metabolism', '3-month supply'],
        use: '1 tablet daily with a meal.' }),
    P({ id: 8, name: 'Probiotic Gut Health', pack: '30 capsules', cat: 'vitamins', brand: 'Verde Wellness', price: 599, mrp: 749, rating: 4.6, reviews: 670, sold: 540, isNew: true, img: 'images/probiotic.jpg',
        desc: '20 billion CFU across 10 clinically studied strains for better digestion and a balanced gut.',
        highlights: ['20 billion CFU, 10 strains', 'Supports digestion and reduces bloating', 'Delayed-release capsules'],
        use: '1 capsule daily, 30 minutes before breakfast.' }),
    P({ id: 9, name: 'Calcium + Vitamin D3 Tablets', pack: '60 tablets', cat: 'vitamins', brand: 'NutriCore', price: 249, mrp: 320, rating: 4.5, reviews: 960, sold: 810, img: 'images/calcium-d3.jpg',
        desc: 'Calcium carbonate with vitamin D3 for stronger bones and teeth, especially for women over 30.',
        highlights: ['500 mg calcium + 250 IU vitamin D3', 'Supports bone density', 'Easy-to-swallow tablets'],
        use: '1 tablet twice daily after meals.' }),
    P({ id: 10, name: 'Vitamin C Effervescent — Orange', pack: 'Tube of 20 tablets', cat: 'vitamins', brand: 'Verde Wellness', price: 199, mrp: 249, rating: 4.7, reviews: 1530, sold: 1350, img: 'images/oranges.jpg',
        desc: 'A refreshing fizzy orange drink with vitamin C and zinc — an easy way to stay hydrated and support immunity.',
        highlights: ['Tasty orange flavour', 'Vitamin C + zinc + electrolytes', 'Sugar-free'],
        use: 'Dissolve 1 tablet in a glass of water once daily.' }),

    // ---- Skin care ----
    P({ id: 11, name: 'Sunscreen SPF 50 PA++++', pack: '50 g', cat: 'skin', brand: 'DermaLeaf', price: 449, mrp: 525, rating: 4.7, reviews: 1650, sold: 1100, img: 'images/sunscreen.jpg',
        desc: 'Lightweight, non-greasy broad-spectrum sunscreen with no white cast. Suitable for Indian skin tones.',
        highlights: ['SPF 50 PA++++ broad-spectrum protection', 'Matte finish, no white cast', 'Water-resistant for 80 minutes'],
        use: 'Apply generously 15 minutes before sun exposure. Reapply every 2–3 hours.' }),
    P({ id: 12, name: 'Marine Collagen Peptides', pack: '200 g powder', cat: 'skin', brand: 'DermaLeaf', price: 1199, mrp: 1399, rating: 4.5, reviews: 820, sold: 430, isNew: true, img: 'images/collagen.jpg',
        desc: 'Hydrolysed marine collagen with vitamin C and hyaluronic acid for skin elasticity, hair and nails.',
        highlights: ['Type I collagen, 5 g per serving', 'With vitamin C and hyaluronic acid', 'Unflavoured, mixes easily'],
        use: 'Mix 1 scoop (5 g) in water or juice once daily.' }),
    P({ id: 13, name: 'Gentle Foaming Face Cleanser', pack: '150 ml', cat: 'skin', brand: 'DermaLeaf', price: 375, mrp: 425, rating: 4.4, reviews: 1120, sold: 760, img: 'images/cleanser.jpg',
        desc: 'A soap-free, pH-balanced cleanser that removes dirt and oil without drying your skin.',
        highlights: ['pH 5.5, soap-free', 'Suitable for sensitive skin', 'Fragrance-free'],
        use: 'Massage onto damp skin morning and night, then rinse.' }),
    P({ id: 14, name: 'Hydrating Moisturiser with Ceramides', pack: '100 ml', cat: 'skin', brand: 'DermaLeaf', price: 425, mrp: 499, rating: 4.6, reviews: 980, sold: 690, img: 'images/moisturiser.jpg',
        desc: 'A rich yet fast-absorbing moisturiser that repairs the skin barrier and keeps skin hydrated for 24 hours.',
        highlights: ['3 essential ceramides', '24-hour hydration', 'Non-comedogenic'],
        use: 'Apply to face and neck after cleansing, morning and night.' }),
    P({ id: 15, name: '10% Vitamin C Face Serum', pack: '30 ml', cat: 'skin', brand: 'Glowveda', price: 549, mrp: 699, rating: 4.5, reviews: 1460, sold: 1020, isNew: true, img: 'images/face-serum.jpg',
        desc: 'A brightening serum that fades dark spots and evens out skin tone for a natural glow.',
        highlights: ['10% stabilised vitamin C', 'Fades dark spots and pigmentation', 'Lightweight, quick-absorbing'],
        use: 'Apply 3–4 drops to clean skin in the morning, followed by sunscreen.' }),

    // ---- Fitness ----
    P({ id: 16, name: 'Whey Protein Isolate — Chocolate', pack: '1 kg', cat: 'fitness', brand: 'PeakForm', price: 2899, mrp: 3499, rating: 4.6, reviews: 980, sold: 610, img: 'images/whey.jpg',
        desc: '27 g of fast-absorbing protein per scoop for muscle recovery, with low sugar and no added fillers.',
        highlights: ['27 g protein, 6 g BCAAs per scoop', 'Under 1 g sugar', 'Lab-tested for purity'],
        use: 'Mix 1 scoop with 200 ml water or milk after your workout.' }),
    P({ id: 17, name: 'Premium Roasted Hazelnuts', pack: '250 g', cat: 'fitness', brand: 'PeakForm', price: 399, mrp: 475, rating: 4.4, reviews: 410, sold: 330, img: 'images/almonds.jpg',
        desc: 'Crunchy, lightly roasted hazelnuts — a healthy snack packed with good fats, fibre and vitamin E.',
        highlights: ['Rich in vitamin E and healthy fats', 'No added salt or oil', 'Resealable pack'],
        use: 'Enjoy a handful (about 30 g) as a snack.' }),

    // ---- Baby care ----
    P({ id: 18, name: 'Gentle Baby Lotion', pack: '200 ml', cat: 'baby', brand: 'Tiny Bloom', price: 245, mrp: 289, rating: 4.8, reviews: 760, sold: 680, img: 'images/baby-lotion.jpg',
        desc: 'A mild, tear-free lotion with shea butter and aloe vera that keeps baby skin soft for 24 hours.',
        highlights: ['Paediatrician-tested', 'Shea butter + aloe vera', 'Paraben- and sulphate-free'],
        use: 'Gently massage onto baby’s skin after bath.' }),
    P({ id: 19, name: 'Diaper Rash Cream', pack: '50 g', cat: 'baby', brand: 'Tiny Bloom', price: 189, mrp: 220, rating: 4.8, reviews: 990, sold: 870, img: 'images/baby-cream.jpg',
        desc: 'Zinc oxide cream that soothes and protects delicate skin from diaper rash.',
        highlights: ['With zinc oxide and calendula', 'Forms a protective barrier', 'Safe from day one'],
        use: 'Apply a thin layer at every diaper change.' }),

    // ---- Ayurveda ----
    P({ id: 20, name: 'Ashwagandha 500 mg Capsules', pack: '60 capsules', cat: 'ayurveda', brand: 'Vedic Roots', price: 349, mrp: 399, rating: 4.6, reviews: 1890, sold: 1300, img: 'images/ashwagandha.jpg',
        desc: 'Standardised KSM-66 ashwagandha root extract to help manage stress and support restful sleep.',
        highlights: ['KSM-66 root extract, 5% withanolides', 'Helps reduce stress', 'Supports energy and sleep'],
        use: '1 capsule twice daily after meals with warm water or milk.' }),
    P({ id: 21, name: 'Giloy Immunity Tablets', pack: '60 tablets', cat: 'ayurveda', brand: 'Vedic Roots', price: 179, mrp: 210, rating: 4.5, reviews: 1240, sold: 990, img: 'images/giloy.jpg',
        desc: 'Giloy (Guduchi) extract — a traditional Ayurvedic herb to strengthen natural immunity.',
        highlights: ['Pure giloy stem extract', 'Supports natural immunity', 'No artificial additives'],
        use: '1–2 tablets twice daily after meals.' }),

    // ---- Devices ----
    P({ id: 22, name: 'Dual-Head Stethoscope', pack: '1 unit', cat: 'devices', brand: 'AccuLife', price: 999, mrp: 1499, rating: 4.5, reviews: 340, sold: 210, img: 'images/stethoscope.jpg',
        desc: 'A lightweight dual-head stethoscope with clear acoustics — ideal for students, nurses and home care.',
        highlights: ['Dual-head chest piece', 'Soft-seal ear tips', '1-year warranty'],
        use: 'Clean the chest piece with an alcohol swab between uses.' }),

    // ---- Hygiene ----
    P({ id: 23, name: 'Reusable Cotton Face Masks', pack: 'Pack of 5', cat: 'hygiene', brand: 'SafeHands', price: 199, mrp: 299, rating: 4.4, reviews: 2100, sold: 1900, img: 'images/face-masks.jpg',
        desc: 'Triple-layer, breathable cotton masks with adjustable ear loops. Washable up to 30 times.',
        highlights: ['3-layer protection', 'Adjustable ear loops and nose wire', 'Washable and reusable'],
        use: 'Wash after each use in warm soapy water and air-dry.' }),
    P({ id: 24, name: 'Kids Face Masks', pack: 'Pack of 3', cat: 'hygiene', brand: 'SafeHands', price: 149, mrp: 199, rating: 4.6, reviews: 860, sold: 720, isNew: true, img: 'images/kids-masks.jpg',
        desc: 'Comfortable, colourful masks sized for children aged 4–12, with soft elastic ear loops.',
        highlights: ['Sized for ages 4–12', 'Soft, breathable fabric', 'Washable and reusable'],
        use: 'Wash before first use and after each wear.' })
  ];

  /* ---- Lab test packages ---- */
  const LAB_TESTS = [
    { id: 1,  name: 'Full Body Checkup', params: 72, price: 1499, mrp: 2999, tat: '24 hrs', fasting: '10–12 hrs fasting', tag: 'full', popular: true,
      includes: ['Complete blood count', 'Lipid profile', 'Liver function', 'Kidney function', 'Thyroid profile', 'Blood sugar (fasting)'] },
    { id: 2,  name: 'Advanced Full Body Checkup', params: 92, price: 2499, mrp: 4999, tat: '24–48 hrs', fasting: '10–12 hrs fasting', tag: 'full',
      includes: ['Everything in Full Body Checkup', 'Vitamin D & B12', 'HbA1c', 'Iron studies', 'Urine routine'] },
    { id: 3,  name: 'Thyroid Profile (T3, T4, TSH)', params: 3, price: 399, mrp: 600, tat: '12 hrs', fasting: 'No fasting needed', tag: 'thyroid', popular: true,
      includes: ['Total T3', 'Total T4', 'TSH (ultra-sensitive)'] },
    { id: 4,  name: 'HbA1c (3-month sugar average)', params: 1, price: 349, mrp: 500, tat: '12 hrs', fasting: 'No fasting needed', tag: 'diabetes',
      includes: ['Glycated haemoglobin (HbA1c)', 'Estimated average glucose'] },
    { id: 5,  name: 'Diabetes Care Package', params: 8, price: 799, mrp: 1400, tat: '24 hrs', fasting: '8–10 hrs fasting', tag: 'diabetes', popular: true,
      includes: ['Fasting blood sugar', 'Post-meal blood sugar', 'HbA1c', 'Kidney function (creatinine, urea)', 'Urine microalbumin'] },
    { id: 6,  name: 'Lipid Profile', params: 8, price: 499, mrp: 900, tat: '12 hrs', fasting: '10–12 hrs fasting', tag: 'heart',
      includes: ['Total cholesterol', 'HDL', 'LDL', 'VLDL', 'Triglycerides', 'Cholesterol ratios'] },
    { id: 7,  name: 'Heart Health Package', params: 18, price: 1299, mrp: 2400, tat: '24 hrs', fasting: '10–12 hrs fasting', tag: 'heart',
      includes: ['Lipid profile', 'hs-CRP', 'Homocysteine', 'Blood sugar', 'ECG (at centre)'] },
    { id: 8,  name: 'Vitamin D & B12', params: 2, price: 899, mrp: 1800, tat: '24 hrs', fasting: 'No fasting needed', tag: 'vitamins', popular: true,
      includes: ['25-OH Vitamin D', 'Vitamin B12'] },
    { id: 9,  name: 'Complete Blood Count (CBC)', params: 24, price: 299, mrp: 450, tat: '8 hrs', fasting: 'No fasting needed', tag: 'basic',
      includes: ['Haemoglobin', 'RBC, WBC & platelet counts', 'Differential count', 'ESR'] },
    { id: 10, name: "Women's Wellness Package", params: 64, price: 1799, mrp: 3500, tat: '24–48 hrs', fasting: '10–12 hrs fasting', tag: 'women',
      includes: ['Full body checkup', 'Iron studies', 'Calcium & Vitamin D', 'Thyroid profile', 'PCOD hormones (LH, FSH)'] }
  ];
  const LAB_TAGS = [['', 'All tests'], ['full', 'Full body'], ['diabetes', 'Diabetes'], ['thyroid', 'Thyroid'], ['heart', 'Heart'], ['vitamins', 'Vitamins'], ['women', 'Women'], ['basic', 'Basic']];

  /* ---- Doctors (fictional profiles) ---- */
  const SPECS = [
    { id: 'gp',    name: 'General Physician', fee: 199 },
    { id: 'derm',  name: 'Dermatologist',     fee: 349 },
    { id: 'paed',  name: 'Paediatrician',     fee: 299 },
    { id: 'gyn',   name: 'Gynaecologist',     fee: 399 },
    { id: 'ortho', name: 'Orthopaedic',       fee: 349 },
    { id: 'ent',   name: 'ENT Specialist',    fee: 299 }
  ];
  const DOCTORS = [
    { id: 1,  name: 'Dr. Ananya Sharma',   spec: 'gp',    qual: 'MBBS',                  exp: 9,  rating: 4.8, consults: 3200, langs: 'English, Hindi, Punjabi', color: '#c9f0e0' },
    { id: 2,  name: 'Dr. Rohit Malhotra',  spec: 'gp',    qual: 'MBBS, MD (Medicine)',   exp: 14, rating: 4.9, consults: 5400, langs: 'English, Hindi',          color: '#dbe6ff' },
    { id: 3,  name: 'Dr. Simran Kaur',     spec: 'derm',  qual: 'MBBS, MD (Dermatology)', exp: 11, rating: 4.8, consults: 2900, langs: 'English, Hindi, Punjabi', color: '#ffd9c9' },
    { id: 4,  name: 'Dr. Vikram Sethi',    spec: 'derm',  qual: 'MBBS, DDVL',            exp: 7,  rating: 4.6, consults: 1500, langs: 'English, Hindi',          color: '#fff1c2' },
    { id: 5,  name: 'Dr. Neha Bansal',     spec: 'paed',  qual: 'MBBS, MD (Paediatrics)', exp: 12, rating: 4.9, consults: 4100, langs: 'English, Hindi',         color: '#ffe0ea' },
    { id: 6,  name: 'Dr. Arjun Mehta',     spec: 'paed',  qual: 'MBBS, DCH',             exp: 6,  rating: 4.7, consults: 1200, langs: 'English, Hindi, Punjabi', color: '#c9f0e0' },
    { id: 7,  name: 'Dr. Priya Gill',      spec: 'gyn',   qual: 'MBBS, MS (OBG)',        exp: 15, rating: 4.9, consults: 3800, langs: 'English, Hindi, Punjabi', color: '#e8dcff' },
    { id: 8,  name: 'Dr. Kavita Rao',      spec: 'gyn',   qual: 'MBBS, DGO',             exp: 10, rating: 4.7, consults: 2100, langs: 'English, Hindi',          color: '#dbe6ff' },
    { id: 9,  name: 'Dr. Harpreet Sandhu', spec: 'ortho', qual: 'MBBS, MS (Orthopaedics)', exp: 13, rating: 4.8, consults: 2600, langs: 'English, Hindi, Punjabi', color: '#ffd9c9' },
    { id: 10, name: 'Dr. Aman Verma',      spec: 'ent',   qual: 'MBBS, MS (ENT)',        exp: 8,  rating: 4.7, consults: 1700, langs: 'English, Hindi',          color: '#fff1c2' }
  ];

  /* ---- Admin overrides (saved in this browser by admin.html) ---- */
  const read = k => { try { return JSON.parse(localStorage.getItem('mp-' + k)); } catch (_) { return null; } };
  const saved = read('products');
  const ALL_PRODUCTS = Array.isArray(saved) && saved.length ? saved.map(P) : PRODUCTS;
  const SETTINGS = Object.assign({ freeShipping: 499, shippingFee: 49, announcement: 'Free delivery on orders above ₹499 · Delivered within 24 hours' }, read('settings') || {});

  return {
    CATEGORIES, LAB_TESTS, LAB_TAGS, SPECS, DOCTORS, SETTINGS,
    DEFAULT_PRODUCTS: PRODUCTS,                                   // original catalogue (for "reset")
    ALL_PRODUCTS,                                                 // includes hidden products (old orders still resolve)
    PRODUCTS: ALL_PRODUCTS.filter(p => p.active !== false)        // what shoppers see
  };
})();
