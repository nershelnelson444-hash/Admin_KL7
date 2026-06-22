export type Showroom = "Ernakulam" | "Aluva";

// ─── Sell Enquiry (from "Sell Your Bike" form on main site) ──────────────────
export type SellBikeType = "Sport" | "Naked" | "Adventure" | "Cruiser" | "Scooter" | "Classic" | "Off-Road" | "Other";
export type SellCondition = "New" | "Like New" | "Good" | "Fair";
export type PreferredContact = "WhatsApp" | "Phone Call" | "Email";
export type SellEnquiryStatus = "new" | "contacted" | "appraised" | "deal_closed" | "declined";

export interface SellEnquiry {
  id: string;
  // bike details
  brand: string;
  model: string;
  year: number;
  mileage: number; // km
  engineCC: number;
  bikeType: SellBikeType;
  condition: SellCondition;
  askingPrice: number; // RM
  notes: string;
  // contact
  fullName: string;
  phone: string;
  email: string;
  preferredContact: PreferredContact;
  // admin
  status: SellEnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Customer Enquiry (from "Contact Us" form on main site) ──────────────────
export type EnquirySubject =
  | "General Enquiry"
  | "Bike Enquiry"
  | "Sell / Trade-In"
  | "Financing Options"
  | "After-Sales Support";
export type CustomerEnquiryStatus = "new" | "read" | "replied" | "closed";

export interface CustomerEnquiry {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: EnquirySubject;
  message: string;
  status: CustomerEnquiryStatus;
  createdAt: string;
  updatedAt: string;
}

// ─── Calendar Task (admin-created reminders) ─────────────────────────────────
export interface CalendarTask {
  id: string;
  date: string; // ISO yyyy-mm-dd
  title: string;
  description?: string;
  color: string; // CSS color
  createdAt: string;
}

export type BikeStatus = "available" | "reserved" | "sold" | "draft";
export type BikeCondition = "Excellent" | "Good" | "Fair";
export type FuelType = "Petrol" | "Electric";
export type Transmission = "Manual" | "Automatic" | "Semi-Auto";

export interface BikeSpecs {
  engine: string; // e.g. "349cc, Single Cylinder"
  power: string; // e.g. "20.2 bhp @ 6100rpm"
  torque: string; // e.g. "27 Nm @ 4000rpm"
  transmission: Transmission;
  mileage: string; // kmpl claim, e.g. "35 kmpl"
}

export interface Bike {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  originalPrice?: number;
  odometer: number; // km run
  condition: BikeCondition;
  fuelType: FuelType;
  status: BikeStatus;
  showroom: Showroom;
  color: string;
  owners: number;
  registrationState: string;
  insuranceValidTill?: string;
  featured: boolean;
  images: string[];
  description: string;
  specs: BikeSpecs;
  createdAt: string;
  updatedAt: string;
  views: number;
  enquiries: number;
}

export type LeadStatus = "new" | "contacted" | "qualified" | "negotiating" | "converted" | "lost";
export type LeadSource = "Website" | "Instagram" | "Walk-in" | "Referral" | "WhatsApp" | "Phone";
export type LeadInterest = "Hot" | "Warm" | "Cold";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  interestedBikeId?: string;
  interestedBikeName?: string;
  status: LeadStatus;
  source: LeadSource;
  interest: LeadInterest;
  budget?: number;
  notes: string;
  showroom: Showroom;
  createdAt: string;
  lastContact: string;
  assignedTo?: string;
}

export type UserRole = "Owner" | "Admin" | "Sales Executive" | "Support";
export type UserStatus = "active" | "invited" | "suspended";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  showroom: Showroom | "Both";
  dealsClosed: number;
  joinedAt: string;
  lastActive: string;
}

export type MediaType = "image" | "video" | "document";

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  type: MediaType;
  sizeKb: number;
  tags: string[];
  linkedBikeId?: string;
  uploadedAt: string;
  uploadedBy: string;
  width?: number;
  height?: number;
}

export type GalleryCategory = "Showroom" | "Customer Delivery" | "Events" | "Workshop" | "Bikes";

export interface GalleryItem {
  id: string;
  imageUrl: string;
  caption: string;
  category: GalleryCategory;
  showroom: Showroom | "Both";
  order: number;
  published: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalInventory: number;
  available: number;
  sold: number;
  reserved: number;
  totalRevenue: number;
  monthRevenue: number;
  revenueDelta: number;
  activeLeads: number;
  hotLeads: number;
  avgDaysToSell: number;
  inventoryHealthPct: number;
  conversionRate: number;
}

export interface SalesTrendPoint {
  month: string;
  sold: number;
  revenue: number;
}

export interface InventoryByBrand {
  brand: string;
  count: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}
