"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, Check, Pencil } from "lucide-react";
import {
  Heart,
  Package,
  CheckCircle,
  ShoppingCart,
  Wrench,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "./ui/toast";

enum CollectionStatus {
  WISHLIST = "WISHLIST",
  PREORDER = "PREORDER",
  BACKLOG = "BACKLOG",
  IN_PROGRESS = "IN_PROGRESS",
  BUILT = "BUILT",
}

interface Collection {
  id: string;
  userId: string;
  kitId: string;
  status: CollectionStatus;
  wishlistNotes?: string | null;
  preorderNotes?: string | null;
  backlogNotes?: string | null;
  inProgressNotes?: string | null;
  builtNotes?: string | null;
  price?: number | null;
  wishlistedAt?: string | null;
  preorderedAt?: string | null;
  acquiredAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  addedAt: string;
  updatedAt: string;
}

interface KitCollectionDialogProps {
  kitId: string;
  mode?: "add" | "edit";
  initialData?: Partial<Collection>;
  onSuccess?: () => void;
}

const statusConfig = {
  [CollectionStatus.WISHLIST]: {
    label: "Wishlist",
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-50 hover:bg-red-100",
    borderColor: "border-red-200",
  },
  [CollectionStatus.PREORDER]: {
    label: "Preorder",
    icon: ShoppingCart,
    color: "text-purple-500",
    bgColor: "bg-purple-50 hover:bg-purple-100",
    borderColor: "border-purple-200",
  },
  [CollectionStatus.BACKLOG]: {
    label: "Backlog",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-50 hover:bg-blue-100",
    borderColor: "border-blue-200",
  },
  [CollectionStatus.IN_PROGRESS]: {
    label: "In Progress",
    icon: Wrench,
    color: "text-orange-500",
    bgColor: "bg-orange-50 hover:bg-orange-100",
    borderColor: "border-orange-200",
  },
  [CollectionStatus.BUILT]: {
    label: "Built",
    icon: CheckCircle,
    color: "text-green-500",
    bgColor: "bg-green-50 hover:bg-green-100",
    borderColor: "border-green-200",
  },
};

const getDefaultFormData = (kitId: string) => ({
  kitId,
  status: "",
  wishlistNotes: "",
  preorderNotes: "",
  backlogNotes: "",
  inProgressNotes: "",
  builtNotes: "",
  price: "",
  wishlistedAt: "",
  preorderedAt: "",
  acquiredAt: "",
  startedAt: "",
  completedAt: "",
  id: "",
});

export function KitCollectionDialog({
  kitId,
  mode = "add",
  initialData,
  onSuccess,
}: KitCollectionDialogProps) {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [warningMessage, setWarningMessage] = useState<string>("");
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState(getDefaultFormData(kitId));

  const isEditMode = mode === "edit";

  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  // Load initial data when dialog opens in edit mode
  useEffect(() => {
    if (openDialog && isEditMode && initialData) {
      setFormData({
        kitId,
        status: initialData.status || "",
        wishlistNotes: initialData.wishlistNotes || "",
        preorderNotes: initialData.preorderNotes || "",
        backlogNotes: initialData.backlogNotes || "",
        inProgressNotes: initialData.inProgressNotes || "",
        builtNotes: initialData.builtNotes || "",
        price: initialData.price?.toString() || "",
        wishlistedAt: formatDateForInput(initialData.wishlistedAt),
        preorderedAt: formatDateForInput(initialData.preorderedAt),
        acquiredAt: formatDateForInput(initialData.acquiredAt),
        startedAt: formatDateForInput(initialData.startedAt),
        completedAt: formatDateForInput(initialData.completedAt),
        id: initialData.id,
      });
    }
  }, [openDialog, isEditMode, initialData, kitId]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
      const token = await getToken();
      const endpoint = isEditMode
        ? `${apiUrl}/user-collections/${formData.id}`
        : `${apiUrl}/user-collections`;

      const method = isEditMode ? "PUT" : "POST";

      const cleanedData = Object.entries(formData).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {} as typeof formData
      );

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(cleanedData),
      });

      if (!response.ok) {
        showToast("Failed to save!", "error");
        return;
      }

      showToast("Collection saved successfully!", "success");
      onSuccess?.();
      setOpenDialog(false);
      resetForm();
      queryClient.invalidateQueries({
        queryKey: ["kit-collections", kitId],
      });
    } catch (error) {
      showToast("Failed to save!", "error");
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData(getDefaultFormData(kitId));
    setCurrentStep(1);
    setWarningMessage("");
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.status) {
      setWarningMessage("Please select a status");
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
    setWarningMessage("");
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const steps = [
    { number: 1, label: "Status" },
    { number: 2, label: "Details" },
    { number: 3, label: "Review" },
  ];

  const getStatusDate = () => {
    switch (formData.status) {
      case CollectionStatus.WISHLIST:
        return formData.wishlistedAt;
      case CollectionStatus.PREORDER:
        return formData.preorderedAt;
      case CollectionStatus.BACKLOG:
        return formData.acquiredAt;
      case CollectionStatus.IN_PROGRESS:
        return formData.startedAt;
      case CollectionStatus.BUILT:
        return formData.completedAt;
      default:
        return "";
    }
  };

  const getStatusNotes = () => {
    switch (formData.status) {
      case CollectionStatus.WISHLIST:
        return formData.wishlistNotes;
      case CollectionStatus.PREORDER:
        return formData.preorderNotes;
      case CollectionStatus.BACKLOG:
        return formData.backlogNotes;
      case CollectionStatus.IN_PROGRESS:
        return formData.inProgressNotes;
      case CollectionStatus.BUILT:
        return formData.builtNotes;
      default:
        return "";
    }
  };

  return (
    <Dialog
      open={openDialog}
      onOpenChange={(open) => {
        setOpenDialog(open);
        if (!open) {
          resetForm();
        }
      }}
    >
      <DialogTrigger asChild>
        {isEditMode ? (
          <button className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center">
            <Pencil className="w-4 h-4" />
          </button>
        ) : (
          <Button variant={"outline"} size="sm">
            <Plus className="w-4 h-4 mr-1" /> Add Collection
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Collection" : "Add to Collection"}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8 py-5">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep > step.number
                      ? "bg-green-500 text-white"
                      : currentStep === step.number
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-sm mt-2 font-medium ${
                    currentStep >= step.number
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-1 w-36 mx-4 rounded transition-all ${
                    currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                  }`}
                  style={{ marginTop: "-24px" }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {/* Step 1: Status Selection */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Collection Status *
                </label>
                <span className="text-rose-600 text-sm">{warningMessage}</span>
                <div className="grid grid-cols-5 gap-2">
                  {Object.entries(statusConfig).map(([statusKey, config]) => {
                    const Icon = config.icon;
                    const isActive = formData.status === statusKey;

                    return (
                      <Button
                        key={statusKey}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setFormData((prevData) => ({
                            ...prevData,
                            status: statusKey,
                          }))
                        }
                        className={`flex flex-col items-center gap-1 h-auto py-3 px-2 ${
                          isActive
                            ? `${config.bgColor} ${config.borderColor} border-2`
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          className={`h-4 w-4 ${
                            isActive ? config.color : "text-gray-400"
                          }`}
                        />
                        <span
                          className={`text-xs ${
                            isActive ? config.color : "text-gray-600"
                          }`}
                        >
                          {config.label}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              <p className="text-sm text-gray-500">
                Choose the current status of this kit in your collection
              </p>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {formData.status === CollectionStatus.WISHLIST && (
                <>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Wishlist Notes
                    </label>
                    <textarea
                      name="wishlistNotes"
                      value={formData.wishlistNotes || ""}
                      onChange={handleChange}
                      placeholder="Why do you want this kit?"
                      rows={4}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Wishlisted Date
                    </label>
                    <input
                      type="date"
                      name="wishlistedAt"
                      value={formData.wishlistedAt || ""}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {formData.status === CollectionStatus.PREORDER && (
                <>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Preorder Notes
                    </label>
                    <textarea
                      name="preorderNotes"
                      value={formData.preorderNotes || ""}
                      onChange={handleChange}
                      placeholder="Store, expected delivery date, etc."
                      rows={4}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Preordered Date
                    </label>
                    <input
                      type="date"
                      name="preorderedAt"
                      value={formData.preorderedAt || ""}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {formData.status === CollectionStatus.BACKLOG && (
                <>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Backlog Notes
                    </label>
                    <textarea
                      name="backlogNotes"
                      value={formData.backlogNotes || ""}
                      onChange={handleChange}
                      placeholder="When do you plan to build this?"
                      rows={4}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Acquired Date
                    </label>
                    <input
                      type="date"
                      name="acquiredAt"
                      value={formData.acquiredAt || ""}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {formData.status === CollectionStatus.IN_PROGRESS && (
                <>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      In Progress Notes
                    </label>
                    <textarea
                      name="inProgressNotes"
                      value={formData.inProgressNotes || ""}
                      onChange={handleChange}
                      placeholder="Document your build progress..."
                      rows={4}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Started Date
                    </label>
                    <input
                      type="date"
                      name="startedAt"
                      value={formData.startedAt || ""}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              {formData.status === CollectionStatus.BUILT && (
                <>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Built Notes
                    </label>
                    <textarea
                      name="builtNotes"
                      value={formData.builtNotes || ""}
                      onChange={handleChange}
                      placeholder="How did the build go? Any tips?"
                      rows={4}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 mb-2">
                      Completed Date
                    </label>
                    <input
                      type="date"
                      name="completedAt"
                      value={formData.completedAt || ""}
                      onChange={handleChange}
                      className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Price (optional)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  className="border border-gray-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-4">
                  Review Your Entry
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">Status:</span>
                    <span className="text-gray-900 font-semibold">
                      {formData.status.replace("_", " ")}
                    </span>
                  </div>

                  {getStatusNotes() && (
                    <div className="py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium block mb-2">
                        Notes:
                      </span>
                      <p className="text-gray-700 text-sm bg-white p-3 rounded">
                        {getStatusNotes()}
                      </p>
                    </div>
                  )}

                  {getStatusDate() && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Date:</span>
                      <span className="text-gray-900">
                        {new Date(getStatusDate()).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {formData.price && (
                    <div className="flex justify-between py-2 border-b border-gray-200">
                      <span className="text-gray-600 font-medium">Price:</span>
                      <span className="text-gray-900 font-semibold">
                        ${parseFloat(formData.price.toString()).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Please review your information before submitting
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={resetForm}>
                Reset
              </Button>

              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4" />
                  Submit
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
