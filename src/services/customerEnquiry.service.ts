import { mockDb, networkDelay } from "@/api/mockDb";
import type { CustomerEnquiry, CustomerEnquiryStatus } from "@/types";

export const customerEnquiryService = {
  async list(): Promise<CustomerEnquiry[]> {
    await networkDelay();
    const db = mockDb.get() as any;
    if (!db.customerEnquiries) {
      mockDb.update((d: any) => { d.customerEnquiries = MOCK_CUSTOMER_ENQUIRIES; });
    }
    const all: CustomerEnquiry[] = (mockDb.get() as any).customerEnquiries ?? [];
    return [...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async get(id: string): Promise<CustomerEnquiry | undefined> {
    await networkDelay(150, 300);
    const all: CustomerEnquiry[] = (mockDb.get() as any).customerEnquiries ?? [];
    return all.find((e) => e.id === id);
  },

  async updateStatus(id: string, status: CustomerEnquiryStatus): Promise<CustomerEnquiry> {
    await networkDelay();
    let updated: CustomerEnquiry | undefined;
    mockDb.update((d: any) => {
      d.customerEnquiries = (d.customerEnquiries ?? []).map((e: CustomerEnquiry) => {
        if (e.id !== id) return e;
        updated = { ...e, status, updatedAt: new Date().toISOString() };
        return updated;
      });
    });
    if (!updated) throw new Error("Customer enquiry not found");
    return updated;
  },

  async remove(id: string): Promise<void> {
    await networkDelay();
    mockDb.update((d: any) => {
      d.customerEnquiries = (d.customerEnquiries ?? []).filter((e: CustomerEnquiry) => e.id !== id);
    });
  },
};

// ─── Seed data ─────────────────────────────────────────────────────────────
export const MOCK_CUSTOMER_ENQUIRIES: CustomerEnquiry[] = [
  {
    id: "ce-001", fullName: "Aditya Kumar", email: "aditya@email.com", phone: "+91 9123456789",
    subject: "Bike Enquiry", message: "Hi, I saw the KTM Duke 390 listing online. Is it still available? I'm looking to test ride this weekend if possible.",
    status: "new",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "ce-002", fullName: "Meera Sajan", email: "meera.sajan@gmail.com", phone: "+91 9876001122",
    subject: "Financing Options", message: "I'm interested in financing for the Royal Enfield Meteor 350. Could you please share the EMI options and down payment details?",
    status: "read",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
  },
  {
    id: "ce-003", fullName: "Rohan Varghese", email: "rohanv@hotmail.com", phone: "+91 9544332211",
    subject: "Sell / Trade-In", message: "I want to trade in my 2019 Bajaj Pulsar NS200 for a newer bike. What is the current valuation process and trade-in value I can expect?",
    status: "replied",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: "ce-004", fullName: "Lakshmi Prasad", email: "lakshmi.p@yahoo.com", phone: "+91 9922334455",
    subject: "After-Sales Support", message: "I purchased a Honda CB350 last month. The instrument cluster is showing some erratic readings. When can I bring it for a checkup?",
    status: "new",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: "ce-005", fullName: "Deepak Nambiar", email: "deepak.n@gmail.com", phone: "+91 9811223344",
    subject: "General Enquiry", message: "Are you open on Sundays? I'd like to visit the Ernakulam showroom with my family to look at some options.",
    status: "closed",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
  },
  {
    id: "ce-006", fullName: "Sunita George", email: "sunita.g@email.com", phone: "+91 9655443322",
    subject: "Bike Enquiry", message: "Looking for a good adventure tourer under 3 lakhs. What models do you currently have in stock at the Aluva showroom?",
    status: "new",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
  },
];
