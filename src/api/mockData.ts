import type {
  Bike,
  Lead,
  AdminUser,
  MediaItem,
  GalleryItem,
  Showroom,
  BikeStatus,
  LeadStatus,
} from "@/types";

const SHOWROOMS: Showroom[] = ["Ernakulam", "Aluva"];

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function img(seed: string, w = 900, h = 600) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

// --------------------------------------------------------------------
// BIKES
// --------------------------------------------------------------------

interface BikeSeed {
  brand: string;
  model: string;
  variant?: string;
  cc: number;
  basePrice: number;
}

const BIKE_CATALOG: BikeSeed[] = [
  { brand: "Royal Enfield", model: "Classic 350", variant: "Halcyon", cc: 349, basePrice: 165000 },
  { brand: "Royal Enfield", model: "Bullet 350", variant: "Standard", cc: 349, basePrice: 148000 },
  { brand: "Royal Enfield", model: "Himalayan", variant: "450", cc: 452, basePrice: 245000 },
  { brand: "Royal Enfield", model: "Meteor 350", variant: "Supernova", cc: 349, basePrice: 178000 },
  { brand: "KTM", model: "Duke 200", cc: 199, basePrice: 142000 },
  { brand: "KTM", model: "Duke 390", cc: 373, basePrice: 235000 },
  { brand: "Bajaj", model: "Pulsar NS200", cc: 199, basePrice: 118000 },
  { brand: "Bajaj", model: "Dominar 400", cc: 373, basePrice: 168000 },
  { brand: "Yamaha", model: "R15", variant: "V4", cc: 155, basePrice: 152000 },
  { brand: "Yamaha", model: "MT-15", cc: 155, basePrice: 138000 },
  { brand: "Yamaha", model: "FZ-S", variant: "V3", cc: 149, basePrice: 95000 },
  { brand: "Honda", model: "CB Hornet 2.0", cc: 184, basePrice: 108000 },
  { brand: "Honda", model: "Unicorn", cc: 162, basePrice: 88000 },
  { brand: "Honda", model: "CB350RS", cc: 348, basePrice: 175000 },
  { brand: "TVS", model: "Apache RTR 160", variant: "4V", cc: 159, basePrice: 99000 },
  { brand: "TVS", model: "Apache RR 310", cc: 312, basePrice: 228000 },
  { brand: "Suzuki", model: "Gixxer SF", variant: "250", cc: 249, basePrice: 162000 },
  { brand: "Jawa", model: "42", cc: 293, basePrice: 158000 },
  { brand: "Jawa", model: "Perak", cc: 334, basePrice: 195000 },
  { brand: "Triumph", model: "Speed 400", cc: 398, basePrice: 215000 },
  { brand: "Kawasaki", model: "Ninja 300", cc: 296, basePrice: 245000 },
  { brand: "Harley-Davidson", model: "X440", cc: 440, basePrice: 198000 },
];

const COLORS = ["Stealth Black", "Granite Grey", "Racing Red", "Pearl White", "Matte Blue", "Bronze", "Desert Sand", "Yellow Ochre"];
const CONDITIONS: Bike["condition"][] = ["Excellent", "Good", "Fair"];
const STATES = ["KL-07", "KL-41", "KL-43", "KL-08", "KL-17"];
const STATUSES: BikeStatus[] = ["available", "available", "available", "reserved", "sold", "sold", "draft"];

function buildBike(seed: BikeSeed, idx: number): Bike {
  const id = `bk-${idx + 1}`;
  const year = 2019 + (idx % 6);
  const ageDiscount = (2025 - year) * 0.06;
  const odometer = 4000 + ((idx * 1737) % 38000);
  const price = Math.round((seed.basePrice * (1 - ageDiscount)) / 500) * 500;
  const status = pick(STATUSES, idx);
  const showroom = pick(SHOWROOMS, idx);
  const condition = pick(CONDITIONS, idx + 1);

  return {
    id,
    brand: seed.brand,
    model: seed.model,
    variant: seed.variant,
    year,
    price,
    originalPrice: seed.basePrice,
    odometer,
    condition,
    fuelType: "Petrol",
    status,
    showroom,
    color: pick(COLORS, idx + 2),
    owners: 1 + (idx % 3),
    registrationState: pick(STATES, idx),
    insuranceValidTill: status !== "sold" ? daysAgo(-((idx % 12) * 30 + 30)) : undefined,
    featured: idx % 5 === 0,
    images: [img(`${id}-a`), img(`${id}-b`), img(`${id}-c`)],
    description: `Well-maintained ${seed.brand} ${seed.model}${seed.variant ? ` ${seed.variant}` : ""} in ${condition.toLowerCase()} condition. Single owner use, all service records available, accident-free. Ready for immediate test ride at our ${showroom} showroom.`,
    specs: {
      engine: `${seed.cc}cc, Single Cylinder`,
      power: `${Math.round(seed.cc * 0.072)} bhp @ ${6000 + (idx % 5) * 200}rpm`,
      torque: `${Math.round(seed.cc * 0.084)} Nm @ ${4000 + (idx % 4) * 300}rpm`,
      transmission: idx % 7 === 0 ? "Semi-Auto" : "Manual",
      mileage: `${28 + (idx % 15)} kmpl`,
    },
    createdAt: daysAgo(60 - (idx % 55)),
    updatedAt: daysAgo(idx % 10),
    views: 80 + ((idx * 53) % 900),
    enquiries: idx % 14,
  };
}

export const BIKES: Bike[] = BIKE_CATALOG.map(buildBike).concat(
  BIKE_CATALOG.slice(0, 8).map((s, i) => buildBike(s, BIKE_CATALOG.length + i))
);

// --------------------------------------------------------------------
// LEADS
// --------------------------------------------------------------------

const FIRST_NAMES = ["Arjun", "Akhil", "Sreelakshmi", "Fahad", "Anjali", "Vishnu", "Devika", "Rahul", "Meera", "Nikhil", "Athira", "Sandeep", "Lakshmi", "Joel", "Farhan", "Gopika", "Aravind", "Riya"];
const LAST_NAMES = ["Nair", "Menon", "Pillai", "Rahman", "Varghese", "Krishnan", "Thomas", "Jose", "Iqbal", "Kurup", "Mathew", "Babu"];
const SOURCES: Lead["source"][] = ["Website", "Instagram", "Walk-in", "Referral", "WhatsApp", "Phone"];
const INTERESTS: Lead["interest"][] = ["Hot", "Warm", "Cold"];
const LEAD_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "negotiating", "converted", "lost"];
const STAFF_NAMES = ["Nershel K.", "Aiswarya R.", "Midhun S.", "Fathima N."];

function buildLead(idx: number): Lead {
  const first = pick(FIRST_NAMES, idx);
  const last = pick(LAST_NAMES, idx + 3);
  const bike = pick(BIKES, idx * 2 + 1);
  return {
    id: `ld-${idx + 1}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    phone: `+91 9${(700000000 + idx * 137921) % 100000000}`,
    interestedBikeId: bike.id,
    interestedBikeName: `${bike.brand} ${bike.model}`,
    status: pick(LEAD_STATUSES, idx),
    source: pick(SOURCES, idx + 1),
    interest: pick(INTERESTS, idx),
    budget: Math.round((bike.price * (0.9 + (idx % 4) * 0.05)) / 1000) * 1000,
    notes: "Asked about exchange offer and financing options. Wants test ride this weekend.",
    showroom: pick(SHOWROOMS, idx),
    createdAt: daysAgo(25 - (idx % 24)),
    lastContact: daysAgo(idx % 6),
    assignedTo: pick(STAFF_NAMES, idx),
  };
}

export const LEADS: Lead[] = Array.from({ length: 22 }, (_, i) => buildLead(i));

// --------------------------------------------------------------------
// USERS (staff)
// --------------------------------------------------------------------

export const USERS: AdminUser[] = [
  {
    id: "usr-1",
    name: "Nershel K.",
    email: "nershel@kl7garage.in",
    phone: "+91 98470 11122",
    role: "Owner",
    status: "active",
    showroom: "Both",
    dealsClosed: 142,
    joinedAt: daysAgo(900),
    lastActive: daysAgo(0),
  },
  {
    id: "usr-2",
    name: "Aiswarya R.",
    email: "aiswarya@kl7garage.in",
    phone: "+91 98460 22334",
    role: "Sales Executive",
    status: "active",
    showroom: "Ernakulam",
    dealsClosed: 67,
    joinedAt: daysAgo(420),
    lastActive: daysAgo(0),
  },
  {
    id: "usr-3",
    name: "Midhun S.",
    email: "midhun@kl7garage.in",
    phone: "+91 95440 33556",
    role: "Sales Executive",
    status: "active",
    showroom: "Aluva",
    dealsClosed: 54,
    joinedAt: daysAgo(380),
    lastActive: daysAgo(1),
  },
  {
    id: "usr-4",
    name: "Fathima N.",
    email: "fathima@kl7garage.in",
    phone: "+91 94470 44778",
    role: "Support",
    status: "active",
    showroom: "Both",
    dealsClosed: 0,
    joinedAt: daysAgo(210),
    lastActive: daysAgo(2),
  },
  {
    id: "usr-5",
    name: "Akhil Varghese",
    email: "akhil@kl7garage.in",
    phone: "+91 99470 55990",
    role: "Admin",
    status: "invited",
    showroom: "Ernakulam",
    dealsClosed: 0,
    joinedAt: daysAgo(3),
    lastActive: daysAgo(3),
  },
  {
    id: "usr-6",
    name: "Joel Mathew",
    email: "joel@kl7garage.in",
    phone: "+91 96330 66112",
    role: "Sales Executive",
    status: "suspended",
    showroom: "Aluva",
    dealsClosed: 12,
    joinedAt: daysAgo(260),
    lastActive: daysAgo(45),
  },
];

// --------------------------------------------------------------------
// MEDIA LIBRARY
// --------------------------------------------------------------------

const MEDIA_TAGS = [["showroom"], ["bike", "hero"], ["delivery"], ["workshop"], ["event"], ["bike", "detail"]];

export const MEDIA_ITEMS: MediaItem[] = Array.from({ length: 26 }, (_, i) => {
  const bike = i % 3 === 0 ? pick(BIKES, i) : undefined;
  return {
    id: `md-${i + 1}`,
    name: bike ? `${bike.brand}-${bike.model}-${i + 1}.jpg` : `kl7-asset-${i + 1}.jpg`,
    url: img(`media-${i}`, 1000, 750),
    type: "image" as const,
    sizeKb: 220 + ((i * 67) % 980),
    tags: pick(MEDIA_TAGS, i),
    linkedBikeId: bike?.id,
    uploadedAt: daysAgo(40 - (i % 38)),
    uploadedBy: pick(STAFF_NAMES, i),
    width: 1000,
    height: 750,
  };
});

// --------------------------------------------------------------------
// GALLERY
// --------------------------------------------------------------------

const GALLERY_CATEGORIES: GalleryItem["category"][] = ["Showroom", "Customer Delivery", "Events", "Workshop", "Bikes"];

export const GALLERY_ITEMS: GalleryItem[] = Array.from({ length: 18 }, (_, i) => ({
  id: `gl-${i + 1}`,
  imageUrl: img(`gallery-${i}`, 1000, 1000),
  caption:
    pick(GALLERY_CATEGORIES, i) === "Customer Delivery"
      ? `${pick(FIRST_NAMES, i)} taking delivery of their new ride`
      : pick(GALLERY_CATEGORIES, i) === "Events"
      ? "KL7 Garage weekend ride-out meet"
      : pick(GALLERY_CATEGORIES, i) === "Workshop"
      ? "Pre-delivery inspection in progress"
      : "Showroom floor, Ernakulam",
  category: pick(GALLERY_CATEGORIES, i),
  showroom: pick([...SHOWROOMS, "Both"] as const, i),
  order: i,
  published: i % 6 !== 5,
  createdAt: daysAgo(50 - (i % 48)),
}));
