// Seed content for the Samagra B2B grocery procurement platform.
// Product imagery is sourced from the internet (LoremFlickr keyword photos),
// with the frontend providing a graceful fallback if any image fails to load.

const img = (kw, lock) => `https://loremflickr.com/600/600/${encodeURIComponent(kw)}?lock=${lock}`;
const slugify = (s) =>
  s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

let LOCK = 100;
// p(name, category, unit, price, mrp, rating, reviews, keyword, badge)
const p = (name, category, unit, price, mrp, rating, reviews, keyword, badge = '') => {
  LOCK += 1;
  return {
    id: slugify(name) + '-' + LOCK,
    name,
    slug: slugify(name),
    category,
    unit,
    price,
    mrp,
    rating,
    reviews,
    badge,
    inStock: true,
    image: img(keyword, LOCK),
    keyword,
    description: `Premium quality ${name.toLowerCase()} sourced from trusted farms and brands, quality-checked and delivered fresh to your business.`,
    reviewsList: [],
    tags: [],
    discount: 0,
  };
};

export const categories = [
  { id: 'fresh-produce', name: 'Fresh Produce', tagline: 'Farm-fresh fruits & vegetables', image: img('fresh,vegetables,market', 11) },
  { id: 'dairy-eggs', name: 'Dairy & Eggs', tagline: 'Milk, butter, cheese & eggs', image: img('dairy,milk,cheese', 12) },
  { id: 'staples-grains', name: 'Staples & Grains', tagline: 'Rice, flour, pulses & sugar', image: img('rice,grains,pulses', 13) },
  { id: 'frozen-foods', name: 'Frozen Foods', tagline: 'Ready-to-cook & frozen items', image: img('frozen,food,fries', 14) },
  { id: 'beverages', name: 'Beverages', tagline: 'Juices, soft drinks & mixers', image: img('beverages,juice,drinks', 15) },
  { id: 'packaging', name: 'Packaging', tagline: 'Containers, cups & consumables', image: img('packaging,box,cup', 16) },
];

export const products = [
  // ---- Fresh Produce ----
  p('Fresh Tomatoes', 'fresh-produce', '10 kg', 240, 320, 4.6, 412, 'tomato', 'Best Rate'),
  p('Onions', 'fresh-produce', '10 kg', 280, 350, 4.5, 388, 'onion'),
  p('Potatoes', 'fresh-produce', '10 kg', 220, 290, 4.7, 526, 'potato', 'Best Rate'),
  p('Green Capsicum', 'fresh-produce', '5 kg', 320, 400, 4.4, 211, 'capsicum,pepper'),
  p('Carrots', 'fresh-produce', '5 kg', 190, 250, 4.6, 174, 'carrot'),
  p('Cauliflower', 'fresh-produce', '5 kg', 160, 210, 4.3, 142, 'cauliflower'),
  p('Fresh Coriander', 'fresh-produce', '1 kg', 80, 120, 4.5, 96, 'coriander,herbs'),
  p('Ginger', 'fresh-produce', '2 kg', 180, 240, 4.6, 130, 'ginger'),
  p('Garlic', 'fresh-produce', '2 kg', 260, 320, 4.7, 205, 'garlic'),
  p('Bananas (Robusta)', 'fresh-produce', '5 kg', 150, 200, 4.5, 318, 'banana'),
  p('Lemons', 'fresh-produce', '3 kg', 170, 220, 4.4, 88, 'lemon'),
  p('Baby Spinach', 'fresh-produce', '2 kg', 140, 190, 4.6, 110, 'spinach,leaves'),

  // ---- Dairy & Eggs ----
  p('Amul Butter', 'dairy-eggs', '500 g', 265, 290, 4.8, 642, 'butter', 'Best Rate'),
  p('Fresh Paneer', 'dairy-eggs', '1 kg', 320, 380, 4.7, 521, 'paneer,cottage,cheese'),
  p('Mozzarella Cheese', 'dairy-eggs', '1 kg', 480, 560, 4.8, 489, 'mozzarella,cheese', 'Best Rate'),
  p('Cheese Slices', 'dairy-eggs', '750 g', 295, 340, 4.6, 277, 'cheese,slice'),
  p('Full Cream Milk', 'dairy-eggs', '6 x 1 L', 360, 420, 4.7, 398, 'milk'),
  p('Fresh Curd', 'dairy-eggs', '5 kg', 280, 330, 4.5, 184, 'curd,yogurt'),
  p('Fresh Cream', 'dairy-eggs', '1 L', 210, 250, 4.6, 156, 'cream'),
  p('Pure Cow Ghee', 'dairy-eggs', '1 L', 560, 640, 4.8, 412, 'ghee', 'Best Rate'),
  p('Farm Eggs (Tray)', 'dairy-eggs', '30 pcs', 195, 240, 4.6, 503, 'eggs'),
  p('Condensed Milk', 'dairy-eggs', '1 kg', 175, 210, 4.5, 132, 'condensed,milk'),

  // ---- Staples & Grains ----
  p('Basmati Rice (Premium)', 'staples-grains', '25 kg', 2450, 2900, 4.8, 712, 'basmati,rice', 'Best Rate'),
  p('Sona Masoori Rice', 'staples-grains', '25 kg', 1650, 1950, 4.6, 388, 'rice'),
  p('Whole Wheat Atta', 'staples-grains', '25 kg', 980, 1150, 4.7, 421, 'wheat,flour'),
  p('Refined Flour (Maida)', 'staples-grains', '25 kg', 920, 1080, 4.5, 198, 'flour'),
  p('Toor Dal', 'staples-grains', '10 kg', 1450, 1700, 4.6, 254, 'lentils,dal'),
  p('Chana Dal', 'staples-grains', '10 kg', 980, 1150, 4.5, 176, 'chickpea,lentil'),
  p('Moong Dal', 'staples-grains', '10 kg', 1280, 1480, 4.6, 142, 'mung,lentil'),
  p('Refined Sugar', 'staples-grains', '25 kg', 1050, 1250, 4.7, 365, 'sugar'),
  p('Iodised Salt', 'staples-grains', '10 kg', 180, 240, 4.5, 98, 'salt'),
  p('Besan (Gram Flour)', 'staples-grains', '10 kg', 760, 900, 4.6, 121, 'gram,flour'),

  // ---- Frozen Foods ----
  p('French Fries', 'frozen-foods', '2.5 kg', 320, 390, 4.7, 612, 'french,fries', 'Best Rate'),
  p('Chicken Nuggets', 'frozen-foods', '1 kg', 285, 340, 4.6, 421, 'chicken,nuggets'),
  p('Green Peas (Frozen)', 'frozen-foods', '1 kg', 130, 170, 4.5, 188, 'peas'),
  p('Sweet Corn (Frozen)', 'frozen-foods', '1 kg', 145, 185, 4.6, 142, 'corn'),
  p('Veg Spring Rolls', 'frozen-foods', '1 kg', 260, 320, 4.5, 167, 'spring,rolls'),
  p('Chicken Sausages', 'frozen-foods', '1 kg', 310, 380, 4.6, 233, 'sausage'),
  p('Aloo Tikki', 'frozen-foods', '1 kg', 220, 280, 4.5, 154, 'potato,patty'),
  p('Frozen Paneer Tikka', 'frozen-foods', '1 kg', 360, 430, 4.7, 198, 'paneer,tikka'),

  // ---- Beverages ----
  p('Coca-Cola (Pack)', 'beverages', '24 x 300 ml', 480, 600, 4.7, 521, 'cola,soda', 'Best Rate'),
  p('Tropicana Orange Juice', 'beverages', '6 x 1 L', 540, 660, 4.6, 287, 'orange,juice'),
  p('Red Bull Energy', 'beverages', '24 cans', 2280, 2640, 4.5, 142, 'energy,drink'),
  p('Bisleri Water', 'beverages', '12 x 1 L', 180, 240, 4.6, 398, 'water,bottle'),
  p('Tata Tea Premium', 'beverages', '5 kg', 1650, 1900, 4.7, 211, 'tea'),
  p('Roasted Coffee Beans', 'beverages', '1 kg', 720, 850, 4.8, 364, 'coffee,beans', 'Best Rate'),
  p('Mango Pulp (Alphonso)', 'beverages', '3.1 kg', 410, 490, 4.6, 176, 'mango,pulp'),
  p('Lemonade Concentrate', 'beverages', '1 L', 240, 300, 4.4, 88, 'lemonade,syrup'),

  // ---- Packaging ----
  p('Aluminium Foil Containers', 'packaging', '500 pcs', 850, 1050, 4.6, 312, 'aluminium,container', 'Best Rate'),
  p('Paper Cups (250 ml)', 'packaging', '1000 pcs', 620, 780, 4.5, 244, 'paper,cup'),
  p('Kraft Food Boxes', 'packaging', '500 pcs', 1150, 1400, 4.7, 198, 'kraft,box'),
  p('Plastic Containers (Lid)', 'packaging', '500 pcs', 980, 1200, 4.5, 167, 'plastic,container'),
  p('Carry Bags (Compostable)', 'packaging', '1000 pcs', 540, 680, 4.6, 142, 'paper,bag'),
  p('Cling Film Roll', 'packaging', '6 rolls', 360, 450, 4.4, 96, 'cling,film'),
  p('Paper Napkins', 'packaging', '5000 pcs', 480, 600, 4.5, 121, 'napkin,tissue'),
  p('Wooden Cutlery Set', 'packaging', '1000 pcs', 720, 900, 4.6, 88, 'wooden,cutlery'),
  p('Pizza Boxes (12 inch)', 'packaging', '100 pcs', 650, 800, 4.7, 154, 'pizza,box'),
];

export const content = {
  hero: {
    mainImage: '',
    eyebrow: 'B2B Procurement, Simplified',
    titlePrefix: 'Simplifying Procurement For',
    titleHighlight: 'Restaurants, Cafes & Hotels',
    subtitle:
      'Reliable supply, transparent pricing, quality assurance and faster deliveries for your business.',
    stats: [
      { value: '500+', label: 'Business Customers' },
      { value: '50+', label: 'Cities Covered' },
      { value: '10,000+', label: 'Orders Delivered' },
      { value: '99%', label: 'On-Time Delivery' },
    ],
  },
  features: [
    { icon: 'shield', title: 'Consistent Quality', text: 'Sourced from trusted farms and top brands with strict quality checks.' },
    { icon: 'truck', title: 'Reliable Deliveries', text: 'On-time delivery, every time. Never run out of stock for your business.' },
    { icon: 'tag', title: 'Transparent Pricing', text: 'No hidden charges. Best prices with complete transparency.' },
    { icon: 'headset', title: 'Dedicated Support', text: 'Personal account managers and 24x7 support on WhatsApp & call.' },
  ],
  steps: [
    { icon: 'sprout', title: 'Sourcing', text: 'From trusted farmers & brands' },
    { icon: 'check', title: 'Quality Check', text: 'Multi-level quality inspection' },
    { icon: 'warehouse', title: 'Warehouse', text: 'Hygienic storage & handling' },
    { icon: 'package', title: 'Packaging', text: 'Safe & secure packaging' },
    { icon: 'truck', title: 'Delivery', text: 'On-time delivery to your doorstep' },
  ],
  industries: [
    { id: 'restaurants', name: 'Restaurants', image: img('restaurant,kitchen,interior', 21), points: ['Consistent quality ingredients for delicious & safe food', 'Bulk pricing that improves your margins', 'Reliable supply that keeps your kitchen running', 'Wide range of products under one roof'] },
    { id: 'cafes', name: 'Cafes', image: img('cafe,coffee,interior', 22), points: ['Fresh dairy, coffee beans & bakery essentials', 'Premium beverages and mixers', 'Compostable packaging & consumables', 'Flexible order quantities'] },
    { id: 'hotels', name: 'Hotels', image: img('hotel,buffet,kitchen', 23), points: ['Large-volume supply with reliable lead times', 'Imported & gourmet ingredients', 'Dedicated account management', 'Consolidated billing & GST invoices'] },
    { id: 'cloud-kitchens', name: 'Cloud Kitchens', image: img('cloud,kitchen,cooking', 24), points: ['Ready-to-cook frozen range for fast prep', 'Demand prediction & scheduled deliveries', 'Cost control with transparent pricing', 'Custom packaging for delivery brands'] },
    { id: 'caterers', name: 'Caterers', image: img('catering,buffet,event', 25), points: ['Bulk staples and produce for events', 'Last-mile reliability for time-bound orders', 'Wide SKU range in a single order', 'Best wholesale rates'] },
  ],
  comparison: {
    traditional: ['Unreliable Deliveries', 'Opaque / Unstable Pricing', 'Limited Product Range', 'Less Quality Assurance', 'Manual Ordering', 'No Dedicated Support'],
    platform: ['On-Time, Reliable Deliveries', 'Transparent & Stable Pricing', 'Wide Range Of Products', 'Strict Quality Checks', 'Easy Ordering (Web / WhatsApp)', 'Dedicated Account Manager'],
  },
  stories: [
    { id: 1, business: 'The Daily Cafe', location: 'Mumbai', quote: 'Reduced our procurement cost by 12% with better quality and on-time delivery.', author: 'Arjun Mehta', role: 'Owner' },
    { id: 2, business: 'Spice Garden Restaurant', location: 'Delhi', quote: 'Wide product range and consistent supply helps us focus on what matters most — our customers.', author: 'Neha Kapoor', role: 'Manager' },
    { id: 3, business: 'CloudBite Cloud Kitchen', location: 'Bangalore', quote: 'Samagra helped us reduce wastage by 18% with better inventory planning.', author: 'Rohan Shetty', role: 'Founder' },
    { id: 4, business: 'Coast Kitchen', location: 'Goa', quote: 'Fresh seafood and produce delivered every morning. Our chefs love the quality.', author: 'Maria Fernandes', role: 'Head Chef' },
  ],
  bigStats: [
    { value: '500+', label: 'Business Customers' },
    { value: '50+', label: 'Cities Covered' },
    { value: '10,000+', label: 'Orders Delivered' },
    { value: '100+', label: 'Products Available' },
  ],
  trust: [
    { name: 'FSSAI', sub: 'Lic No. 10021062000258' },
    { name: 'ISO 22000', sub: 'Certified' },
    { name: 'HACCP', sub: 'Certified' },
    { name: 'Google', sub: '4.8 / 5' },
    { name: 'Trustpilot', sub: '4.7 / 5' },
  ],
  marquee: [
    'Farm-Fresh Produce',
    'Wholesale Pricing',
    'Next-Day Delivery',
    'Quality Assured',
    '1000+ Products',
    '50+ Cities',
    'Zero Stockouts',
  ],
  cta: {
    eyebrow: 'Ready when you are',
    title: 'Upgrade your',
    titleHighlight: 'procurement',
    titleSuffix: 'today.',
    subtitle: 'Join hundreds of restaurants, cafes and hotels that trust Samagra for fresher supply, better prices and on-time delivery.',
  },
  faqs: [
    { q: 'What is the minimum order quantity?', a: 'Our minimum order value is ₹1,000. Most products are available in wholesale pack sizes suited for businesses.' },
    { q: 'How long does delivery take?', a: 'Most orders are delivered next-day. Express delivery is available in select cities within a few hours.' },
    { q: 'Do you deliver outside my city?', a: 'We currently serve 50+ cities across India and are expanding rapidly. Enter your pincode at checkout to confirm serviceability.' },
    { q: 'What payment methods do you accept?', a: 'We accept UPI, credit/debit cards, net banking, and offer credit terms for eligible businesses.' },
    { q: 'Can I return products if I am not satisfied?', a: 'Yes. If a product does not meet our quality promise, raise a return within 24 hours for a full refund or replacement.' },
    { q: 'Do you offer credit terms for businesses?', a: 'Eligible businesses can avail flexible credit periods. Talk to your account manager to set up credit.' },
  ],
};

export const defaultSettings = {
  whatsapp: '919999999999',
  contact: {
    phone: '+91 98765 43210',
    email: 'hello@samagra.com',
    address: 'Mumbai, Maharashtra, India',
  },
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
  },
  legal: {
    privacyUrl: '',
    termsUrl: '',
  },
};

export const ALL_PERMISSIONS = [
  'dashboard:view',
  'products:read',   'products:write',   'products:delete',
  'categories:read', 'categories:write', 'categories:delete',
  'orders:read',     'orders:write',
  'leads:read',      'leads:write',
  'reviews:read',    'reviews:write',    'reviews:delete',
  'content:read',    'content:write',
  'users:read',      'users:write',      'users:delete',
  'roles:read',      'roles:write',      'roles:delete',
  'settings:manage',
  'coupons:read',    'coupons:write',    'coupons:delete',
];

export const defaultRoles = [
  {
    id: 'super-admin',
    name: 'Super Admin',
    description: 'Full access to all features',
    permissions: ALL_PERMISSIONS,
    isSystem: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'store-manager',
    name: 'Store Manager',
    description: 'Manage products, orders, leads and reviews',
    permissions: [
      'dashboard:view',
      'products:read', 'products:write',
      'categories:read', 'categories:write',
      'orders:read', 'orders:write',
      'leads:read', 'leads:write',
      'reviews:read', 'reviews:write', 'reviews:delete',
    ],
    isSystem: false,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'customer',
    name: 'Customer',
    description: 'Registered public user — can browse, add to cart and place orders',
    permissions: [],
    isSystem: true,
    createdAt: new Date(0).toISOString(),
  },
  {
    id: 'content-editor',
    name: 'Content Editor',
    description: 'Edit website content and categories',
    permissions: [
      'dashboard:view',
      'categories:read', 'categories:write',
      'content:read', 'content:write',
      'products:read',
    ],
    isSystem: false,
    createdAt: new Date(0).toISOString(),
  },
];

export function seed() {
  return {
    categories,
    products,
    content,
    settings: defaultSettings,
    leads: [],
    orders: [],
    users: [],
    roles: defaultRoles,
    coupons: [],
  };
}
