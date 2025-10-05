import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

const CATEGORIES = [
  { slug: 'wearables', name: 'Wearables', heroImage: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' },
  { slug: 'smart-home', name: 'Smart Home', heroImage: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a' },
  { slug: 'mobility', name: 'Mobility', heroImage: 'https://images.unsplash.com/photo-1511399322040-9e63f5e5f0e9' },
];

const PRODUCTS = [
  {
    sku: 'AUR-001',
    slug: 'aurora-pulse',
    name: 'Aurora Pulse Headset',
    description: 'Adaptive AI audio headset with biometric privacy shield and contextual cues.',
    category: 'wearables',
    featured: true,
    popularity: 95,
    heroImageUrl: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      battery: '18h adaptive',
      connectivity: 'Wi-Fi 7 + BLE 5.4',
      assistants: ['Neo Support', 'Spatial CoPilot'],
    },
    brand: 'Neo Labs',
    tags: ['audio', 'biometrics', 'ai'],
    price: 499,
  },
  {
    sku: 'NEB-201',
    slug: 'nebula-lens',
    name: 'Nebula Smart Lens',
    description: 'AR-enabled eyewear with contextual overlays and privacy-preserving optics.',
    category: 'wearables',
    featured: true,
    popularity: 88,
    heroImageUrl: 'https://images.unsplash.com/photo-1602748095506-42377cfd4a68?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555488083-3e43882adb18?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549921296-3b4a6b56d6c2?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      display: '4K microLED',
      security: 'On-eye authentication',
      weight: '48g',
    },
    brand: 'Spectra',
    tags: ['ar', 'vision', 'ai'],
    price: 699,
  },
  {
    sku: 'FLX-880',
    slug: 'flux-console',
    name: 'Flux Modular Console',
    description: 'Seamless cross-device command center for your smart home ecosystem.',
    category: 'smart-home',
    featured: true,
    popularity: 92,
    heroImageUrl: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92eee?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1618005199030-9cfa1f1ed8db?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1593941707874-ef25b8b3b3be?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      modules: 12,
      voice: 'Multi-agent orchestration',
      latency: '<1ms edge routing',
    },
    brand: 'Flux Systems',
    tags: ['iot', 'automation'],
    price: 899,
  },
  {
    sku: 'ORB-330',
    slug: 'orbital-scooter',
    name: 'Orbital Foldable Scooter',
    description: 'AI stability control with adaptive suspension for urban mobility.',
    category: 'mobility',
    featured: false,
    popularity: 84,
    heroImageUrl: 'https://images.unsplash.com/photo-1542367597-8849eb950fd8?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1542293787938-4d2226a67681?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      range: '60km',
      recharge: '35 minutes fast charge',
      safety: 'Predictive braking',
    },
    brand: 'Orbital',
    tags: ['mobility', 'ev'],
    price: 1299,
  },
  {
    sku: 'HYB-450',
    slug: 'hyperion-bike',
    name: 'Hyperion Smart Bike',
    description: 'Carbon-fiber e-bike with AI shifting, theft lock, and solar trickle charging.',
    category: 'mobility',
    featured: false,
    popularity: 86,
    heroImageUrl: 'https://images.unsplash.com/photo-1605719124116-8cc8fba0b366?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517170652500-1140c8038e84?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1525104698733-6b7fdd7d1c1c?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      range: '95km assist',
      security: 'Biometric seatpost lock',
      extras: ['Auto route planning', 'Crash detection'],
    },
    brand: 'Hyperion Mobility',
    tags: ['ebike', 'mobility', 'sustainability'],
    price: 3299,
  },
  {
    sku: 'LYR-720',
    slug: 'lyra-smart-speaker',
    name: 'Lyra Smart Speaker',
    description: 'Holographic assistant with room-aware audio sculpting and privacy-first design.',
    category: 'smart-home',
    featured: false,
    popularity: 90,
    heroImageUrl: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      microphones: '12 far-field',
      privacy: 'Edge-only keyword detection',
      assistant: ['Neo Support', 'Lyra Light'],
    },
    brand: 'Lyra Labs',
    tags: ['audio', 'smart-home'],
    price: 349,
  },
  {
    sku: 'SOL-510',
    slug: 'solace-thermal-hoodie',
    name: 'Solace Thermal Hoodie',
    description: 'Adaptive climate hoodie with phase-change fibers and onboard wellness sensors.',
    category: 'wearables',
    featured: false,
    popularity: 82,
    heroImageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      climate: '18°C - 32°C regulation',
      fabric: 'Graphene weave',
      battery: 'Removable 24h pack',
    },
    brand: 'Solace Wearables',
    tags: ['apparel', 'wearable'],
    price: 279,
  },
  {
    sku: 'ATN-980',
    slug: 'aeternum-orb',
    name: 'Aeternum Orb',
    description: 'Ambient AI drone with indoor mapping, pet monitoring, and modular sensors.',
    category: 'smart-home',
    featured: false,
    popularity: 91,
    heroImageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1535743686920-55e4145369fd?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      flightTime: '35 minutes',
      autonomy: 'Level 4 indoor',
      sensors: ['Thermal', 'Lidar', 'Air quality'],
    },
    brand: 'Aeternum Dynamics',
    tags: ['drone', 'home'],
    price: 1199,
  },
  {
    sku: 'PIX-150',
    slug: 'pixie-buds',
    name: 'Pixie Buds',
    description: 'Pocket-size AI earbuds that translate 60 languages in real time and monitor focus.',
    category: 'wearables',
    featured: false,
    popularity: 78,
    heroImageUrl: 'https://images.unsplash.com/photo-1598331668826-d2a1ca4b0c75?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1598331668826-d2a1ca4b0c75?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1612810806695-30ba9cdd7f20?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      battery: '10h playback',
      assistants: ['Neo Support'],
      waterproof: 'IPX6',
    },
    brand: 'Pixie Audio',
    tags: ['audio', 'translation'],
    price: 149,
  },
  {
    sku: 'MOD-045',
    slug: 'modulo-smart-plug',
    name: 'Modulo Smart Plug Pack',
    description: 'Miniature smart plugs with per-appliance energy scoring and anomaly alerts.',
    category: 'smart-home',
    featured: false,
    popularity: 76,
    heroImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1580894908361-967195033215?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      pack: '4 plugs',
      analytics: 'Per-device AI coach',
      safety: 'Thermal shutdown',
    },
    brand: 'Modulo Grid',
    tags: ['energy', 'iot'],
    price: 89,
  },
  {
    sku: 'NMB-640',
    slug: 'nimbus-hub',
    name: 'Nimbus Mobility Hub',
    description: 'Portable fast-charging dock for bikes, scooters, and wearables with solar spillover.',
    category: 'mobility',
    featured: false,
    popularity: 80,
    heroImageUrl: 'https://images.unsplash.com/photo-1529429617124-aeea96e5f8a5?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1511399322040-9e63f5e5f0e9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549921296-3b4a6b56d6c2?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      outputs: '4 high-speed ports',
      solar: 'Foldable 180W array',
      weight: '4.5kg',
    },
    brand: 'Nimbus Mobility',
    tags: ['charging', 'mobility'],
    price: 459,
  },
  {
    sku: 'LUM-320',
    slug: 'lumina-desk-lamp',
    name: 'Lumina Adaptive Desk Lamp',
    description: 'Auto-adjusting LED lamp that tracks eye strain and syncs with circadian rhythms.',
    category: 'smart-home',
    featured: false,
    popularity: 81,
    heroImageUrl: 'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1481277542470-605612bd2d61?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      brightness: '900 lumens',
      sensors: ['Eye strain', 'Ambient light'],
      control: 'Voice + gesture',
    },
    brand: 'Lumina',
    tags: ['lighting', 'wellness'],
    price: 189,
  },
  {
    sku: 'ARC-880',
    slug: 'arc-suspension-bed',
    name: 'Arc Suspension Bed',
    description: 'AI-controlled sleep platform with zero-G presets, scent diffusion, and heart monitoring.',
    category: 'smart-home',
    featured: true,
    popularity: 94,
    heroImageUrl: 'https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?auto=format&fit=crop&w=1200&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1520207588543-4bf0baf6c3ad?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=1200&q=80',
    ],
    specs: {
      modes: ['Zero gravity', 'Recovery', 'Chronotype'],
      bio: 'ECG + respiratory monitoring',
      automation: 'Morning routine triggers',
    },
    brand: 'Arc Living',
    tags: ['sleep', 'wellness'],
    price: 5999,
  },
  {
    sku: 'VELOC-360',
    slug: 'veloce-courier',
    name: 'Veloce Courier Bot',
    description: 'Compact sidewalk rover for same-day deliveries with thermal food module.',
    category: 'mobility',
    featured: true,
    popularity: 89,
    heroImageUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
    gallery: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee',
      'https://images.unsplash.com/photo-1529429617124-aeea96e5f8a5',
    ],
    specs: {
      load: '35kg cargo bay',
      range: '40km city loop',
      autonomy: 'Level 3 sidewalks',
    },
    brand: 'Veloce Robotics',
    tags: ['delivery', 'robotics'],
    price: 7299,
  },
];

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await db.user.upsert({
    where: { email: 'admin@demo.dev' },
    update: {},
    create: {
      email: 'admin@demo.dev',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: password,
    },
  });

  const demoUser = await db.user.upsert({
    where: { email: 'user@demo.dev' },
    update: {},
    create: {
      email: 'user@demo.dev',
      name: 'Demo User',
      role: 'USER',
      passwordHash: password,
    },
  });

  const seedAddresses = [
    {
      userId: admin.id,
      label: 'HQ',
      line1: '88 Quantum Way',
      line2: 'Suite 500',
      city: 'Neo City',
      state: 'CA',
      postalCode: '94016',
      country: 'USA',
      isDefault: true,
    },
    {
      userId: demoUser.id,
      label: 'Home',
      line1: '501 Aurora Blvd',
      line2: null,
      city: 'Seattle',
      state: 'WA',
      postalCode: '98109',
      country: 'USA',
      isDefault: true,
    },
  ];

  for (const address of seedAddresses) {
    await db.userAddress.upsert({
      where: {
        userId_label: {
          userId: address.userId,
          label: address.label ?? 'default',
        },
      },
      update: address,
      create: address,
    });
  }

  const seedPayments = [
    {
      userId: admin.id,
      brand: 'visa',
      last4: '4242',
      expMonth: 9,
      expYear: 2030,
      isDefault: true,
    },
    {
      userId: demoUser.id,
      brand: 'mastercard',
      last4: '1881',
      expMonth: 5,
      expYear: 2029,
      isDefault: true,
    },
  ];

  for (const card of seedPayments) {
    await db.paymentMethod.upsert({
      where: {
        userId_last4_brand: {
          userId: card.userId,
          last4: card.last4,
          brand: card.brand,
        },
      },
      update: card,
      create: card,
    });
  }

  for (const category of CATEGORIES) {
    await db.category.upsert({
      where: { slug: category.slug },
      update: category,
      create: category,
    });
  }

  for (const product of PRODUCTS) {
    const category = await db.category.findUnique({ where: { slug: product.category } });
    if (!category) continue;

    await db.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        sku: product.sku,
        slug: product.slug,
        name: product.name,
        description: product.description,
        categoryId: category.id,
        featured: product.featured,
        popularity: product.popularity,
        heroImageUrl: product.heroImageUrl,
        gallery: product.gallery,
        specs: product.specs,
        brand: product.brand,
        tags: product.tags,
        prices: {
          create: {
            amount: product.price,
            currency: 'usd',
          },
        },
        inventory: {
          create: {
            quantity: 120,
            threshold: 5,
          },
        },
        reviews: {
          create: [
            {
              rating: 5,
              title: 'Insanely polished',
              body: 'The AI assistant powered setup within seconds and suggested accessories I actually wanted.',
            },
            {
              rating: 4,
              title: 'Future proof',
              body: 'Felt like stepping into the future—needs more colors though.',
            },
          ],
        },
      },
    });
  }

  await db.kBArticle.upsert({
    where: { slug: 'shipping-policy' },
    update: {},
    create: {
      slug: 'shipping-policy',
      title: 'Shipping & fulfilment',
      body: 'Orders ship within 48 hours. Express upgrades available at checkout.',
      category: 'logistics',
    },
  });

  console.log('Seed data loaded.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
