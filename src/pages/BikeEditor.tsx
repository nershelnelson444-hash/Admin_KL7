import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Plus, Trash2, Upload, X, ImagePlus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase, supabaseUrl } from "@/config/SupabaseClient";
import { useBike, useCreateBike, useUpdateBike } from "@/hooks/useBikes";
import type { BikeInput } from "@/services/bikes.service";

const STORAGE_BUCKET = "bike-images";

// ─── Schema ───────────────────────────────────────────────────────────────────
const bikeSchema = z.object({
  brand: z.string().min(1, "Brand is required"),
  model: z.string().min(1, "Model is required"),
  variant: z.string().optional(),
  year: z.coerce.number().int().min(2000).max(new Date().getFullYear()),
  price: z.coerce.number().positive("Enter a valid price"),
  originalPrice: z.coerce.number().optional(),
  odometer: z.coerce.number().int().min(0),
  condition: z.enum(["Excellent", "Good", "Fair"]),
  fuelType: z.enum(["Petrol", "Electric"]),
  status: z.enum(["available", "reserved", "sold", "draft"]),
  showroom: z.enum(["Ernakulam", "Aluva"]),
  color: z.string().min(1, "Colour is required"),
  owners: z.coerce.number().int().min(1),
  registrationState: z.string().min(1, "Registration state is required"),
  insuranceValidTill: z.string().optional(),
  featured: z.boolean(),
  description: z.string().min(10, "Description too short"),
  vehicleOverview: z.string().optional(),
  images: z.array(z.string()).default([]),
  specs: z.object({
    engine: z.string().min(1, "Engine spec required"),
    power: z.string().min(1),
    torque: z.string().min(1),
    transmission: z.enum(["Manual", "Automatic", "Semi-Auto"]),
    mileage: z.string().min(1),
  }),
  drivetrain: z.string().optional(),
  exterior: z.string().optional(),
  interior: z.string().optional(),
  bodyType: z.string().optional(),
  referenceNumber: z.string().optional(),
  vin: z.string().optional(),
  keyFeatures: z.array(z.object({ value: z.string() })).default([]),
});

type BikeFormValues = z.infer<typeof bikeSchema>;

const BRANDS = ["Royal Enfield","KTM","Bajaj","Yamaha","Honda","TVS","Suzuki","Jawa","Triumph","Kawasaki","Harley-Davidson","Hero","BMW","Ducati","Husqvarna"];

// ─── Component ────────────────────────────────────────────────────────────────
export default function BikeEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [newFeature, setNewFeature] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: bike, isLoading } = useBike(id);
  const createBike = useCreateBike();
  const updateBike = useUpdateBike();

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors, isSubmitting } } =
    useForm<BikeFormValues>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(bikeSchema) as any,
      defaultValues: {
        status: "draft", showroom: "Ernakulam", condition: "Good", fuelType: "Petrol",
        featured: false, owners: 1, images: [], keyFeatures: [],
        specs: { transmission: "Manual" },
      },
    });

  const { fields: featureFields, append: appendFeature, remove: removeFeature } = useFieldArray({
    control,
    name: "keyFeatures",
  });
  const images = watch("images");

  useEffect(() => {
    if (bike) reset(bike as unknown as BikeFormValues);
  }, [bike, reset]);

  // ─── Submit: sends all form data to Supabase `bikes` table ────────────────
  const onSubmit = async (values: BikeFormValues) => {
    const input = values as unknown as BikeInput;

    // Clean up removed images from Supabase Storage (edit mode only)
    if (isEdit && id && bike) {
      const oldUrls = bike.images ?? [];
      const newUrls = values.images ?? [];
      const removed = oldUrls.filter((u) => !newUrls.includes(u));
      const storageUrlPrefix = `${supabaseUrl}/storage/v1/object/public/${STORAGE_BUCKET}/`;
      for (const url of removed) {
        if (url.startsWith(storageUrlPrefix)) {
          const filePath = url.slice(storageUrlPrefix.length);
          await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);
        }
      }
    }

    if (isEdit && id) {
      await updateBike.mutateAsync({ id, input });
    } else {
      await createBike.mutateAsync(input);
    }
    navigate("/inventory");
  };

  // ─── Add image by URL ──────────────────────────────────────────────────────
  const addImage = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    setValue("images", [...(images ?? []), url]);
    setImageUrlInput("");
  };

  const removeImage = (idx: number) => {
    setValue("images", (images ?? []).filter((_, i) => i !== idx));
  };

  // ─── Upload image files to Supabase Storage ────────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    setUploadingImages(true);
    setUploadError(null);

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Unique filename: timestamp + random suffix + original name
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `bikes/${fileName}`;

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, { cacheControl: "3600", upsert: false });

      if (error) {
        setUploadError(`Failed to upload ${file.name}: ${error.message}`);
        setUploadingImages(false);
        return;
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }

    setValue("images", [...(images ?? []), ...uploadedUrls]);
    setUploadingImages(false);
    // Reset the file input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ─── Key Features ──────────────────────────────────────────────────────────
  const addFeature = () => {
    const f = newFeature.trim();
    if (!f) return;
    appendFeature({ value: f });
    setNewFeature("");
  };

  if (isEdit && isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 rounded-card" />
      </div>
    );
  }

  const SelectField = ({
    name, label, options,
  }: {
    name: keyof BikeFormValues | `specs.${keyof BikeFormValues["specs"]}`;
    label: string;
    options: { value: string; label: string }[];
  }) => (
    <div>
      <Label>{label}</Label>
      <Controller
        name={name as keyof BikeFormValues}
        control={control}
        render={({ field }) => (
          <Select value={String(field.value ?? "")} onValueChange={field.onChange}>
            <SelectTrigger><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
            <SelectContent>{options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
          </Select>
        )}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? "Edit Bike" : "Add Bike"}
        description={isEdit ? `Updating: ${bike?.brand} ${bike?.model}` : "New listing for your inventory"}
        actions={
          <Button asChild variant="ghost" size="sm">
            <Link to="/inventory"><ArrowLeft className="h-4 w-4" /> Back</Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Main column ── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Core Details */}
            <Card>
              <CardHeader><CardTitle>Core Details</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Brand / Make</Label>
                    <Controller name="brand" control={control} render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                        <SelectContent>{BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                      </Select>
                    )} />
                    {errors.brand && <p className="mt-1 text-xs text-danger">{errors.brand.message}</p>}
                  </div>
                  <div>
                    <Label>Model</Label>
                    <Input {...register("model")} placeholder="e.g. Classic 350" />
                    {errors.model && <p className="mt-1 text-xs text-danger">{errors.model.message}</p>}
                  </div>
                  <div>
                    <Label>Variant <span className="text-muted">(optional)</span></Label>
                    <Input {...register("variant")} placeholder="e.g. Halcyon" />
                  </div>
                  <div>
                    <Label>Year</Label>
                    <Input {...register("year")} type="number" placeholder="2024" />
                    {errors.year && <p className="mt-1 text-xs text-danger">{errors.year.message}</p>}
                  </div>
                  <div>
                    <Label>Colour / Exterior</Label>
                    <Input {...register("color")} placeholder="e.g. Nardo Grey" />
                    {errors.color && <p className="mt-1 text-xs text-danger">{errors.color.message}</p>}
                  </div>
                  <div>
                    <Label>No. of Owners</Label>
                    <Input {...register("owners")} type="number" min={1} />
                  </div>
                  <div>
                    <Label>Body Type <span className="text-muted">(optional)</span></Label>
                    <Input {...register("bodyType")} placeholder="e.g. Estate, Naked, Sport" />
                  </div>
                  <div>
                    <Label>Drivetrain <span className="text-muted">(optional)</span></Label>
                    <Input {...register("drivetrain")} placeholder="e.g. AWD (Quattro), Chain Drive" />
                  </div>
                  <div>
                    <Label>Interior <span className="text-muted">(optional)</span></Label>
                    <Input {...register("interior")} placeholder="e.g. Black Valcona Leather" />
                  </div>
                  <div>
                    <Label>Reference Number <span className="text-muted">(optional)</span></Label>
                    <Input {...register("referenceNumber")} placeholder="e.g. LUX-010-2024" />
                  </div>
                  <div>
                    <Label>VIN / Chassis Number <span className="text-muted">(optional)</span></Label>
                    <Input {...register("vin")} placeholder="e.g. WAUZZZ4G9PN123456" />
                  </div>
                </div>

                <div>
                  <Label>Vehicle Overview</Label>
                  <Textarea {...register("vehicleOverview")} rows={3}
                    placeholder="Highlight what makes this bike special — unique selling points, history, character…" />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea {...register("description")} rows={4}
                    placeholder="Full description — condition, service history, highlights…" />
                  {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Specifications */}
            <Card>
              <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Engine</Label>
                    <Input {...register("specs.engine")} placeholder="e.g. 4.0L Twin-Turbo V8" />
                    {errors.specs?.engine && <p className="mt-1 text-xs text-danger">{errors.specs.engine.message}</p>}
                  </div>
                  <div>
                    <Label>Power</Label>
                    <Input {...register("specs.power")} placeholder="e.g. 630 HP" />
                  </div>
                  <div>
                    <Label>Torque</Label>
                    <Input {...register("specs.torque")} placeholder="e.g. 800 Nm" />
                  </div>
                  <div>
                    <Label>Mileage / Fuel Economy</Label>
                    <Input {...register("specs.mileage")} placeholder="e.g. 35 kmpl" />
                  </div>
                  <SelectField name="specs.transmission" label="Transmission"
                    options={[
                      { value: "Manual", label: "Manual" },
                      { value: "Automatic", label: "8-Speed Tiptronic Automatic" },
                      { value: "Semi-Auto", label: "Semi-Auto" },
                    ]}
                  />
                  <SelectField name="fuelType" label="Fuel Type"
                    options={[{ value: "Petrol", label: "Petrol" }, { value: "Electric", label: "Electric" }]}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Key Features */}
            <Card>
              <CardHeader><CardTitle>Key Features</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {featureFields.length > 0 && (
                  <ul className="space-y-2">
                    {featureFields.map((field, idx) => (
                      <li key={field.id} className="flex items-center gap-2 rounded-lg bg-canvas px-3 py-2 text-sm text-ink">
                        <span className="flex-1">• {field.value}</span>
                        <button type="button" onClick={() => removeFeature(idx)} className="text-muted hover:text-danger transition-colors">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex gap-2">
                  <Input
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
                    placeholder="e.g. Carbon Ceramic Brakes"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addFeature} className="shrink-0 gap-1">
                    <Plus className="h-4 w-4" /> Add
                  </Button>
                </div>
                <p className="text-xs text-muted">Press Enter or click Add after each feature.</p>
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><ImagePlus className="h-5 w-5" /> Images</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {(images ?? []).length > 0 && (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {(images ?? []).map((url, idx) => (
                      <div key={idx} className="group relative overflow-hidden rounded-xl">
                        <img src={url} alt={`Bike image ${idx + 1}`} className="h-32 w-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-danger text-white opacity-0 transition-opacity group-hover:opacity-100">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        {idx === 0 && (
                          <div className="absolute bottom-2 left-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-bold text-lime-ink">Main</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── File upload (Supabase Storage) ── */}
                <div>
                  <label
                    htmlFor="bike-image-upload"
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line bg-canvas p-6 text-center transition-colors hover:border-ink hover:bg-canvas-dim ${uploadingImages ? "pointer-events-none opacity-60" : ""}`}
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin text-muted" />
                        <span className="text-sm text-muted">Uploading…</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-muted" />
                        <span className="text-sm font-medium text-ink">Click to upload photos</span>
                        <span className="text-xs text-muted">JPG, PNG, WEBP — multiple files supported</span>
                      </>
                    )}
                  </label>
                  <input
                    id="bike-image-upload"
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={uploadingImages}
                  />
                </div>

                {uploadError && (
                  <p className="text-xs text-danger">{uploadError}</p>
                )}

                {/* ── OR paste image URL ── */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 border-t border-line" />
                  <span className="text-xs text-muted">or paste a URL</span>
                  <div className="flex-1 border-t border-line" />
                </div>
                <div className="flex gap-2">
                  <Input
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImage(); } }}
                    placeholder="Paste image URL and press Enter…"
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addImage} className="shrink-0 gap-1">
                    <Upload className="h-4 w-4" /> Add
                  </Button>
                </div>
                <p className="text-xs text-muted">First image is shown as the main listing photo.</p>
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Pricing & Status</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Asking Price (₹)</Label>
                  <Input {...register("price")} type="number" placeholder="175000" />
                  {errors.price && <p className="mt-1 text-xs text-danger">{errors.price.message}</p>}
                </div>
                <div>
                  <Label>Original Price (₹) <span className="text-muted">(optional)</span></Label>
                  <Input {...register("originalPrice")} type="number" placeholder="220000" />
                </div>
                <SelectField name="status" label="Status"
                  options={[
                    { value: "draft", label: "Draft" }, { value: "available", label: "Available" },
                    { value: "reserved", label: "Reserved" }, { value: "sold", label: "Sold" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Location & Condition</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <SelectField name="showroom" label="Showroom"
                  options={[{ value: "Ernakulam", label: "Ernakulam" }, { value: "Aluva", label: "Aluva" }]}
                />
                <SelectField name="condition" label="Condition"
                  options={[
                    { value: "Excellent", label: "Excellent" }, { value: "Good", label: "Good" }, { value: "Fair", label: "Fair" },
                  ]}
                />
                <div>
                  <Label>Odometer / Mileage</Label>
                  <Input {...register("odometer")} type="number" placeholder="e.g. 1 (mi) or 12000 (km)" />
                </div>
                <div>
                  <Label>Registration State</Label>
                  <Input {...register("registrationState")} placeholder="KL-07" />
                </div>
                <div>
                  <Label>Insurance Valid Till</Label>
                  <Input {...register("insuranceValidTill")} type="date" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Visibility</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-ink">Featured listing</div>
                    <div className="text-xs text-muted">Show prominently on public site</div>
                  </div>
                  <Controller name="featured" control={control}
                    render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                  />
                </div>
              </CardContent>
            </Card>

            <Button type="submit" variant="accent" size="lg" className="w-full" disabled={isSubmitting || uploadingImages}>
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Add to Inventory"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
