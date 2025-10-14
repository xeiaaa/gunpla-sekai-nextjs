import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BasicInfoStep({ formData, handleChange }) {
  return (
    <div className="space-y-6 animate-fadeIn">
      <h2 className="text-xl font-semibold text-slate-700 mb-4">
        Basic Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., RX-93 ν Gundam"
          />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input
            name="slug"
            id="slug"
            value={formData.slug}
            onChange={handleChange}
            placeholder="e.g., pgu-02"
          />
        </div>
        <div>
          <Label htmlFor="number">
            Model Number<span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            name="number"
            id="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="e.g., 02"
          />
        </div>
        <div className="md:col-span-2">
          <Label htmlFor="variant">Variants</Label>
          <Input
            type="text"
            name="variant"
            id="variant"
            value={formData.variant}
            onChange={handleChange}
            placeholder="e.g., Ver. Ka, Titanium Finish"
          />
        </div>
      </div>
    </div>
  );
}
