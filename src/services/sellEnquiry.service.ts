import { mockDb, networkDelay, newId } from "@/api/mockDb";
import type { SellEnquiry, SellEnquiryStatus } from "@/types";

export const sellEnquiryService = {
  async list(): Promise<SellEnquiry[]> {
    await networkDelay();
    const db = mockDb.get() as any;
    if (!db.sellEnquiries) {
      mockDb.update((d: any) => { d.sellEnquiries = MOCK_SELL_ENQUIRIES; });
    }
    const all: SellEnquiry[] = (mockDb.get() as any).sellEnquiries ?? [];
    return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async get(id: string): Promise<SellEnquiry | undefined> {
    await networkDelay(150, 300);
    const all: SellEnquiry[] = (mockDb.get() as any).sellEnquiries ?? [];
    return all.find((e) => e.id === id);
  },

  async updateStatus(id: string, status: SellEnquiryStatus): Promise<SellEnquiry> {
    await networkDelay();
    let updated: SellEnquiry | undefined;
    mockDb.update((d: any) => {
      d.sellEnquiries = (d.sellEnquiries ?? []).map((e: SellEnquiry) => {
        if (e.id !== id) return e;
        updated = { ...e, status, updatedAt: new Date().toISOString() };
        return updated;
      });
    });
    if (!updated) throw new Error("Sell enquiry not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await networkDelay();
    mockDb.update((d: any) => {
      d.sellEnquiries = (d.sellEnquiries ?? []).filter((e: SellEnquiry) => e.id !== id);
    });
  },
};

// ─── Seed data ─────────────────────────────────────────────────────────────
export const MOCK_SELL_ENQUIRIES: SellEnquiry[] = [
  {
    id: "se-001", brand: "Royal Enfield", model: "Classic 350", year: 2021,
    mileage: 18500, engineCC: 349, bikeType: "Classic", condition: "Good",
    askingPrice: 145000, notes: "Single owner, all service records available, minor scratch on tank.",
    fullName: "Arjun Nair", phone: "+91 9876543210", email: "arjun@email.com",
    preferredContact: "WhatsApp", status: "new",
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "se-002", brand: "KTM", model: "Duke 390", year: 2022,
    mileage: 9200, engineCC: 390, bikeType: "Naked", condition: "Like New",
    askingPrice: 265000, notes: "ABS model, Supermoto tyres fitted. Original tyres included.",
    fullName: "Sneha Menon", phone: "+91 9845123456", email: "sneha.m@gmail.com",
    preferredContact: "Phone Call", status: "contacted",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "se-003", brand: "Yamaha", model: "R15 V4", year: 2023,
    mileage: 4100, engineCC: 155, bikeType: "Sport", condition: "Like New",
    askingPrice: 170000, notes: "Racing blue. Stock bike, no modifications.",
    fullName: "Rahul Das", phone: "+91 9654321098", email: "rahul.das@outlook.com",
    preferredContact: "WhatsApp", status: "appraised",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
  },
  {
    id: "se-004", brand: "Bajaj", model: "Dominar 400", year: 2020,
    mileage: 32000, engineCC: 400, bikeType: "Adventure", condition: "Good",
    askingPrice: 175000, notes: "Long rides, maintained well. New chain and sprocket.",
    fullName: "Priya Krishnan", phone: "+91 9711223344", email: "priya.k@mail.com",
    preferredContact: "Email", status: "new",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
  {
    id: "se-005", brand: "Honda", model: "CB300R", year: 2021,
    mileage: 12800, engineCC: 293, bikeType: "Naked", condition: "Good",
    askingPrice: 220000, notes: "Great commuter. Minor dent on right panel repaired.",
    fullName: "Vikram Pillai", phone: "+91 9988776655", email: "vikram@gmail.com",
    preferredContact: "WhatsApp", status: "deal_closed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
];
