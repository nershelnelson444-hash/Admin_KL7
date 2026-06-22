import { useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { useBike, useCreateBike, useUpdateBike } from "@/hooks/useBikes";
import type { BikeInput } from "@/services/bikes.service";

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
  images: z.array(z.string()).default([]),
  specs: z.object({
    engine: z.string().min(1, "Engine spec required"),
    power: z.string().min(1),
    torque: z.string().min(1),
    transmission: z.enum(["Manual", "Automatic", "Semi-Auto"]),
    mileage: z.string().min(1),
  }),
});

type BikeFormValues = z.infer<typeof bikeSchema>;

const BRANDS = ["Royal Enfield", "KTM", "Bajaj", "Yamaha", "Honda", "TVS", "Suzuki", "Jawa", "Triumph", "Kawasaki", "Harley-Davidson", "Hero", "BMW"];

export default function BikeEditor() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: bike, isLoading } = useBike(id);
  const createBike = useCreateBike();
  const updateBike = useUpdateBike();

  // zodResolver's inferred type uses unknown for coerced fields; cast to any to avoid mismatch
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BikeFormValues>({
    resolver: zodResolver(bikeSchema) as any,
    defaultValues: {
      status: "draft",
      showroom: "Ernakulam",
      condition: "Good",
      fuelType: "Petrol",
      featured: false,
      owners: 1,
      images: [],
      specs: { transmission: "Manual" },
    },
  });

  useEffect(() => {
    if (bike) reset(bike as unknown as BikeFormValues);
  }, [bike, reset]);

  const onSubmit = async (values: BikeFormValues) => {
    const input = values as unknown as BikeInput;
    if (isEdit && id) {
      await updateBike.mutateAsync({ id, input });
    } else {
      await createBike.mutateAsync(input);
    }
    navigate("/inventory");
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
    name,
    label,
    options,
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
            <SelectTrigger>
              <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
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
            <Link to="/inventory">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        }
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* ── Core Details ── */}
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Core Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Brand</Label>
                    <Controller
                      name="brand"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      )}
                    />
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
                    <Input {...register("year")} type="number" placeholder="2022" />
                    {errors.year && <p className="mt-1 text-xs text-danger">{errors.year.message}</p>}
                  </div>
                  <div>
                    <Label>Colour</Label>
                    <Input {...register("color")} placeholder="e.g. Stealth Black" />
                    {errors.color && <p className="mt-1 text-xs text-danger">{errors.color.message}</p>}
                  </div>
                  <div>
                    <Label>No. of Owners</Label>
                    <Input {...register("owners")} type="number" min={1} />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    {...register("description")}
                    rows={4}
                    placeholder="Describe the bike's condition, service history, highlights…"
                  />
                  {errors.description && <p className="mt-1 text-xs text-danger">{errors.description.message}</p>}
                </div>
              </CardContent>
            </Card>

            {/* Specs */}
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Engine</Label>
                    <Input {...register("specs.engine")} placeholder="e.g. 349cc, Single Cylinder" />
                    {errors.specs?.engine && <p className="mt-1 text-xs text-danger">{errors.specs.engine.message}</p>}
                  </div>
                  <div>
                    <Label>Power</Label>
                    <Input {...register("specs.power")} placeholder="e.g. 20.2 bhp @ 6100rpm" />
                  </div>
                  <div>
                    <Label>Torque</Label>
                    <Input {...register("specs.torque")} placeholder="e.g. 27 Nm @ 4000rpm" />
                  </div>
                  <div>
                    <Label>Mileage</Label>
                    <Input {...register("specs.mileage")} placeholder="e.g. 35 kmpl" />
                  </div>
                  <SelectField
                    name="specs.transmission"
                    label="Transmission"
                    options={[
                      { value: "Manual", label: "Manual" },
                      { value: "Automatic", label: "Automatic" },
                      { value: "Semi-Auto", label: "Semi-Auto" },
                    ]}
                  />
                  <SelectField
                    name="fuelType"
                    label="Fuel Type"
                    options={[
                      { value: "Petrol", label: "Petrol" },
                      { value: "Electric", label: "Electric" },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pricing & Status</CardTitle>
              </CardHeader>
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
                <SelectField
                  name="status"
                  label="Status"
                  options={[
                    { value: "draft", label: "Draft" },
                    { value: "available", label: "Available" },
                    { value: "reserved", label: "Reserved" },
                    { value: "sold", label: "Sold" },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Condition</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SelectField
                  name="showroom"
                  label="Showroom"
                  options={[
                    { value: "Ernakulam", label: "Ernakulam" },
                    { value: "Aluva", label: "Aluva" },
                  ]}
                />
                <SelectField
                  name="condition"
                  label="Condition"
                  options={[
                    { value: "Excellent", label: "Excellent" },
                    { value: "Good", label: "Good" },
                    { value: "Fair", label: "Fair" },
                  ]}
                />
                <div>
                  <Label>Odometer (km)</Label>
                  <Input {...register("odometer")} type="number" placeholder="12000" />
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
              <CardHeader>
                <CardTitle>Visibility</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-ink">Featured listing</div>
                    <div className="text-xs text-muted">Show prominently on public site</div>
                  </div>
                  <Controller
                    name="featured"
                    control={control}
                    render={({ field }) => (
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Add to Inventory"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
