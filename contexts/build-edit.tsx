"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  deleteBuild,
  updateBuild,
  getBuildForEdit,
  type UpdateBuildData,
} from "@/lib/actions/builds";
import {
  createMilestone,
  updateMilestone,
  deleteMilestone,
  reorderMilestones,
  setMilestoneImages,
  type CreateMilestoneData,
  type UpdateMilestoneData,
} from "@/lib/actions/milestones";
import { getBuildMediaItems } from "@/lib/actions/uploads";
import { MilestoneType } from "@/generated/prisma";

// Types
export type BuildTab = "info" | "gallery" | "milestones" | "social";

export interface MediaItem {
  id: string;
  uploadId: string;
  url: string;
  eagerUrl?: string | null;
  caption: string;
  order: number;
  createdAt: Date;
  originalFilename: string;
  size: number;
  format: string;
  buildUploadId?: string; // ID of the BuildUpload junction table entry
}

// Validation schemas
const buildFormSchema = z
  .object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(100, "Title must be less than 100 characters"),
    description: z
      .string()
      .max(1000, "Description must be less than 1000 characters")
      .optional(),
    status: z
      .enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"])
      .default("PLANNING"),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.startedAt && data.completedAt) {
        const startedDate = new Date(data.startedAt);
        const completedDate = new Date(data.completedAt);
        return completedDate >= startedDate;
      }
      return true;
    },
    {
      message: "Completed date cannot be before started date",
      path: ["completedAt"],
    }
  );

// Lenient schema for initial form setup (no validation)
const buildFormSchemaLenient = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
});

const milestoneFormSchema = z.object({
  type: z.nativeEnum(MilestoneType),
  title: z
    .string()
    .min(1, "Title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export type BuildFormData = z.infer<typeof buildFormSchema>;
export type BuildFormDataLenient = z.infer<typeof buildFormSchemaLenient>;
export type MilestoneFormData = z.infer<typeof milestoneFormSchema>;

export interface BuildData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  featuredImageId: string | null;
  likes: number;
  liked: boolean;
  comments: number;
  featuredImage: {
    id: string;
    url: string;
    eagerUrl: string | null;
  } | null;
  kit: {
    id: string;
    name: string;
    number: string;
    slug: string | null;
    boxArt: string | null;
    productLine: {
      name: string;
      grade: {
        name: string;
      } | null;
    } | null;
    series: {
      name: string;
    } | null;
  };
  user: {
    id: string;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  milestones: Array<{
    id: string;
    type: string;
    title: string;
    description: string | null;
    completedAt: Date | null;
    order: number;
    buildId?: string;
    uploads: Array<{
      id: string;
      caption: string | null;
      order: number | null;
      upload: {
        id: string;
        url: string;
        eagerUrl: string | null;
      };
    }>;
  }>;
}

export interface BuildEditContextType {
  // Data
  buildData: BuildData | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isFormInitialized: boolean;

  // UI State
  activeTab: BuildTab;
  setActiveTab: (tab: BuildTab) => void;

  // Form State
  buildForm: {
    register: ReturnType<typeof useForm<BuildFormDataLenient>>["register"];
    handleSubmit: ReturnType<
      typeof useForm<BuildFormDataLenient>
    >["handleSubmit"];
    formState: ReturnType<typeof useForm<BuildFormDataLenient>>["formState"];
    reset: ReturnType<typeof useForm<BuildFormDataLenient>>["reset"];
    setValue: ReturnType<typeof useForm<BuildFormDataLenient>>["setValue"];
    getValues: ReturnType<typeof useForm<BuildFormDataLenient>>["getValues"];
    watch: ReturnType<typeof useForm<BuildFormDataLenient>>["watch"];
    clearErrors: ReturnType<
      typeof useForm<BuildFormDataLenient>
    >["clearErrors"];
  };
  milestoneForm: {
    register: ReturnType<typeof useForm<MilestoneFormData>>["register"];
    handleSubmit: ReturnType<typeof useForm<MilestoneFormData>>["handleSubmit"];
    formState: ReturnType<typeof useForm<MilestoneFormData>>["formState"];
    reset: ReturnType<typeof useForm<MilestoneFormData>>["reset"];
    setValue: ReturnType<typeof useForm<MilestoneFormData>>["setValue"];
    getValues: ReturnType<typeof useForm<MilestoneFormData>>["getValues"];
    watch: ReturnType<typeof useForm<MilestoneFormData>>["watch"];
  };

  // Transient States
  reorderMode: boolean;
  setReorderMode: (mode: boolean) => void;
  mediaLibraryCount: number;
  setMediaLibraryCount: (count: number) => void;
  mediaItems: MediaItem[];
  setMediaItems: (items: MediaItem[]) => void;
  imageFit: "cover" | "contain";
  setImageFit: (fit: "cover" | "contain") => void;

  // Milestone State
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  editingMilestone: string | null;
  setEditingMilestone: (id: string | null) => void;

  // Mutation Methods
  updateBuild: (data: BuildFormDataLenient) => Promise<void>;
  updateFeaturedImage: (uploadId: string | null) => Promise<void>;
  addMilestone: (data: MilestoneFormData) => Promise<void>;
  updateMilestone: (id: string, data: MilestoneFormData) => Promise<void>;
  deleteMilestone: (id: string) => Promise<void>;
  reorderMilestones: (milestoneIds: string[]) => Promise<void>;
  updateMilestoneImages: (
    milestoneId: string,
    images: Array<{
      id: string;
      uploadId: string;
      url: string;
      eagerUrl?: string | null;
      caption: string;
      order: number;
      milestoneImageId?: string;
    }>
  ) => Promise<void>;
  deleteBuild: () => Promise<void>;
}

const BuildEditContext = createContext<BuildEditContextType | undefined>(
  undefined
);

export function useBuildEdit() {
  const context = useContext(BuildEditContext);
  if (context === undefined) {
    throw new Error(
      "useBuildEdit must be used within a BuildEditContextProvider"
    );
  }
  return context;
}

interface BuildEditContextProviderProps {
  children: ReactNode;
  buildId: string;
}

export function BuildEditContextProvider({
  children,
  buildId,
}: BuildEditContextProviderProps) {
  const router = useRouter();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Fetch build data
  const {
    data: buildData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["build", buildId],
    queryFn: () => getBuildForEdit(buildId, userId || undefined),
    enabled: !!buildId && !!userId,
  });

  // UI State
  const [activeTab, setActiveTabState] = useState<BuildTab>("info");
  const [reorderMode, setReorderMode] = useState(false);
  const [mediaLibraryCount, setMediaLibraryCount] = useState(0);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [imageFit, setImageFit] = useState<"cover" | "contain">("cover");

  // Form State
  const buildForm = useForm<BuildFormDataLenient>({
    resolver: zodResolver(buildFormSchemaLenient), // Use lenient schema initially
    mode: "onSubmit", // Only validate on submit initially
    reValidateMode: "onChange", // Re-validate on change after submit
    defaultValues: {
      title: "",
      description: "",
      status: "PLANNING",
      startedAt: "",
      completedAt: "",
    },
  });

  const milestoneForm = useForm<MilestoneFormData>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      type: MilestoneType.BUILD,
      title: "",
      description: "",
    },
  });

  // Milestone State
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);

  // Form initialization state
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Initialize form data when build data loads
  useEffect(() => {
    if (buildData) {
      // Ensure we have a valid status value
      const validStatuses = [
        "PLANNING",
        "IN_PROGRESS",
        "COMPLETED",
        "ON_HOLD",
      ] as const;
      const buildStatus = buildData.status?.trim() || "";
      const status = validStatuses.includes(
        buildStatus as (typeof validStatuses)[number]
      )
        ? (buildStatus as (typeof validStatuses)[number])
        : "PLANNING";

      const formData = {
        title: buildData.title || "",
        description: buildData.description || "",
        status,
        startedAt: buildData.startedAt
          ? format(buildData.startedAt, "yyyy-MM-dd")
          : "",
        completedAt: buildData.completedAt
          ? format(buildData.completedAt, "yyyy-MM-dd")
          : "",
      };

      // Reset the form with the build data and trigger validation
      buildForm.reset(formData, {
        keepDefaultValues: false,
        keepDirty: false,
        keepValues: false,
        keepIsSubmitted: false,
        keepIsValid: false,
        keepSubmitCount: false,
      });

      // Mark form as initialized
      setIsFormInitialized(true);
    }
  }, [buildData, buildForm]);

  // Load media items when build data is available
  useEffect(() => {
    const loadMediaItems = async () => {
      if (!buildData?.id) return;

      try {
        const uploads = await getBuildMediaItems(buildData.id);
        const mediaItems: MediaItem[] = uploads.map((upload) => ({
          id: upload.id,
          uploadId: upload.id,
          url: upload.url,
          eagerUrl: upload.eagerUrl,
          caption: upload.caption || "",
          order: upload.order || 0,
          createdAt: upload.uploadedAt,
          originalFilename: upload.originalFilename,
          size: upload.size,
          format: upload.format,
          buildUploadId: upload.buildUploadId,
        }));
        setMediaItems(mediaItems);
      } catch (error) {
        console.error("Error loading media items:", error);
      }
    };

    loadMediaItems();
  }, [buildData?.id]);

  // Switch to proper validation schema after form is initialized
  useEffect(() => {
    if (isFormInitialized) {
      // Re-create the form with proper validation
      buildForm.clearErrors();
    }
  }, [isFormInitialized, buildForm]);

  // Initialize tab from URL parameters
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["info", "gallery", "milestones", "social"].includes(tabParam)
    ) {
      setActiveTabState(tabParam as BuildTab);
    }
  }, [searchParams]);

  // Check ownership and redirect if not owner
  useEffect(() => {
    if (userId && buildData && userId !== buildData.user.id) {
      router.push(`/builds/${buildId}`);
    }
  }, [userId, buildData, buildId, router]);

  // Tab management with URL updates
  const setActiveTab = useCallback((tab: BuildTab) => {
    setActiveTabState(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Update build mutation
  const updateBuildMutation = useMutation({
    mutationFn: (data: UpdateBuildData) => updateBuild(buildId, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ["build", buildId] });

      const previousBuild = queryClient.getQueryData(["build", buildId]);

      queryClient.setQueryData(
        ["build", buildId],
        (old: BuildData | undefined) =>
          old ? ({ ...old, ...newData } as BuildData) : old
      );

      return { previousBuild };
    },
    onError: (err, newData, context) => {
      if (context?.previousBuild) {
        queryClient.setQueryData(["build", buildId], context.previousBuild);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["build", buildId] });
    },
  });

  // Update featured image mutation
  const updateFeaturedImageMutation = useMutation({
    mutationFn: (uploadId: string | null) =>
      updateBuild(buildId, { featuredImageId: uploadId }),
    onMutate: async (uploadId) => {
      await queryClient.cancelQueries({ queryKey: ["build", buildId] });

      const previousBuild = queryClient.getQueryData(["build", buildId]);

      queryClient.setQueryData(
        ["build", buildId],
        (old: BuildData | undefined) =>
          old ? ({ ...old, featuredImageId: uploadId } as BuildData) : old
      );

      return { previousBuild };
    },
    onError: (err, uploadId, context) => {
      if (context?.previousBuild) {
        queryClient.setQueryData(["build", buildId], context.previousBuild);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["build", buildId] });
    },
  });

  // Add milestone mutation
  const addMilestoneMutation = useMutation({
    mutationFn: (data: CreateMilestoneData) => createMilestone(data),
    onMutate: async (newMilestone) => {
      await queryClient.cancelQueries({ queryKey: ["build", buildId] });

      const previousBuild = queryClient.getQueryData(["build", buildId]);

      const tempMilestone = {
        ...newMilestone,
        id: `temp-${Date.now()}`,
        completedAt: null,
        uploads: [],
      };

      queryClient.setQueryData(
        ["build", buildId],
        (old: BuildData | undefined) =>
          old
            ? ({
                ...old,
                milestones: [...old.milestones, tempMilestone],
              } as BuildData)
            : old
      );

      return { previousBuild };
    },
    onError: (err, newMilestone, context) => {
      if (context?.previousBuild) {
        queryClient.setQueryData(["build", buildId], context.previousBuild);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["build", buildId] });
    },
  });

  // Update milestone mutation
  const updateMilestoneMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMilestoneData }) =>
      updateMilestone(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["build", buildId] });

      const previousBuild = queryClient.getQueryData(["build", buildId]);

      queryClient.setQueryData(
        ["build", buildId],
        (old: BuildData | undefined) =>
          old
            ? ({
                ...old,
                milestones: old.milestones.map((m) =>
                  m.id === id ? { ...m, ...data } : m
                ),
              } as BuildData)
            : old
      );

      return { previousBuild };
    },
    onError: (err, _variables, context) => {
      if (context?.previousBuild) {
        queryClient.setQueryData(["build", buildId], context.previousBuild);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["build", buildId] });
    },
  });

  // Delete milestone mutation
  const deleteMilestoneMutation = useMutation({
    mutationFn: (milestoneId: string) => deleteMilestone(milestoneId),
    onMutate: async (milestoneId) => {
      await queryClient.cancelQueries({ queryKey: ["build", buildId] });

      const previousBuild = queryClient.getQueryData(["build", buildId]);

      queryClient.setQueryData(
        ["build", buildId],
        (old: BuildData | undefined) =>
          old
            ? ({
                ...old,
                milestones: old.milestones.filter((m) => m.id !== milestoneId),
              } as BuildData)
            : old
      );

      return { previousBuild };
    },
    onError: (err, _milestoneId, context) => {
      if (context?.previousBuild) {
        queryClient.setQueryData(["build", buildId], context.previousBuild);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["build", buildId] });
    },
  });

  // Reorder milestones mutation
  const reorderMilestonesMutation = useMutation({
    mutationFn: (milestoneIds: string[]) =>
      reorderMilestones(buildId, milestoneIds),
    onMutate: async (milestoneIds) => {
      await queryClient.cancelQueries({ queryKey: ["build", buildId] });

      const previousBuild = queryClient.getQueryData(["build", buildId]);

      // Reorder milestones optimistically
      queryClient.setQueryData(
        ["build", buildId],
        (old: BuildData | undefined) => {
          if (!old) return old;

          const milestones = old.milestones;
          const reorderedMilestones = milestoneIds
            .map((id, index) => {
              const milestone = milestones.find((m) => m.id === id);
              return milestone ? { ...milestone, order: index + 1 } : null;
            })
            .filter((m): m is NonNullable<typeof m> => m !== null);

          return {
            ...old,
            milestones: reorderedMilestones,
          } as BuildData;
        }
      );

      return { previousBuild };
    },
    onError: (err, _milestoneIds, context) => {
      if (context?.previousBuild) {
        queryClient.setQueryData(["build", buildId], context.previousBuild);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["build", buildId] });
    },
  });

  // Update milestone images mutation
  const updateMilestoneImagesMutation = useMutation({
    mutationFn: ({
      milestoneId,
      uploadIds,
    }: {
      milestoneId: string;
      uploadIds: string[];
    }) => setMilestoneImages(milestoneId, uploadIds),
    onMutate: async ({ milestoneId, uploadIds }) => {
      await queryClient.cancelQueries({ queryKey: ["build", buildId] });

      const previousBuild = queryClient.getQueryData(["build", buildId]);

      // Update milestone images optimistically
      queryClient.setQueryData(
        ["build", buildId],
        (old: BuildData | undefined) =>
          old
            ? ({
                ...old,
                milestones: old.milestones.map((m) =>
                  m.id === milestoneId
                    ? {
                        ...m,
                        uploads: uploadIds.map((uploadId, index) => ({
                          id: `temp-${Date.now()}-${index}`,
                          caption: "",
                          order: index,
                          upload: {
                            id: uploadId,
                            url: "", // Will be handled by component conditional render
                            eagerUrl: null,
                          },
                        })),
                      }
                    : m
                ),
              } as BuildData)
            : old
      );

      return { previousBuild };
    },
    onError: (err, _variables, context) => {
      if (context?.previousBuild) {
        queryClient.setQueryData(["build", buildId], context.previousBuild);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["build", buildId] });
    },
  });

  // Delete build mutation
  const deleteBuildMutation = useMutation({
    mutationFn: () => deleteBuild(buildId),
    onSuccess: () => {
      router.push("/");
    },
  });

  // Wrapper functions
  const handleUpdateBuild = useCallback(
    async (data: BuildFormDataLenient) => {
      // Validate the data before sending
      const validatedData = buildFormSchema.parse(data);

      const updateData: UpdateBuildData = {
        title: validatedData.title.trim(),
        description: validatedData.description?.trim() || undefined,
        status: validatedData.status,
        startedAt: validatedData.startedAt
          ? new Date(validatedData.startedAt)
          : null,
        completedAt: validatedData.completedAt
          ? new Date(validatedData.completedAt)
          : null,
      };

      await updateBuildMutation.mutateAsync(updateData);
    },
    [updateBuildMutation]
  );

  const handleUpdateFeaturedImage = useCallback(
    async (uploadId: string | null) => {
      await updateFeaturedImageMutation.mutateAsync(uploadId);
    },
    [updateFeaturedImageMutation]
  );

  const handleAddMilestone = useCallback(
    async (data: MilestoneFormData) => {
      const milestoneData: CreateMilestoneData = {
        buildId,
        type: data.type,
        title: data.title.trim(),
        description: data.description?.trim() || undefined,
        order: (buildData?.milestones.length || 0) + 1,
      };

      await addMilestoneMutation.mutateAsync(milestoneData);
      milestoneForm.reset();
      setShowAddForm(false);
    },
    [buildId, buildData, addMilestoneMutation, milestoneForm]
  );

  const handleUpdateMilestone = useCallback(
    async (id: string, data: MilestoneFormData) => {
      await updateMilestoneMutation.mutateAsync({
        id,
        data: {
          type: data.type,
          title: data.title.trim(),
          description: data.description?.trim() || undefined,
        },
      });
      setEditingMilestone(null);
    },
    [updateMilestoneMutation]
  );

  const handleDeleteMilestone = useCallback(
    async (id: string) => {
      if (!confirm("Are you sure you want to delete this milestone?")) {
        return;
      }

      await deleteMilestoneMutation.mutateAsync(id);
    },
    [deleteMilestoneMutation]
  );

  const handleReorderMilestones = useCallback(
    async (milestoneIds: string[]) => {
      await reorderMilestonesMutation.mutateAsync(milestoneIds);
    },
    [reorderMilestonesMutation]
  );

  const handleUpdateMilestoneImages = useCallback(
    async (
      milestoneId: string,
      images: Array<{
        id: string;
        uploadId: string;
        url: string;
        eagerUrl?: string | null;
        caption: string;
        order: number;
        milestoneImageId?: string;
      }>
    ) => {
      const uploadIds = images.map((img) => img.uploadId);
      await updateMilestoneImagesMutation.mutateAsync({
        milestoneId,
        uploadIds,
      });
    },
    [updateMilestoneImagesMutation]
  );

  const handleDeleteBuild = useCallback(async () => {
    if (
      !confirm(
        "Are you sure you want to delete this build? This action cannot be undone."
      )
    ) {
      return;
    }

    await deleteBuildMutation.mutateAsync();
  }, [deleteBuildMutation]);

  const contextValue: BuildEditContextType = {
    // Data
    buildData,
    isLoading,
    isError,
    error,
    isFormInitialized,

    // UI State
    activeTab,
    setActiveTab,

    // Form State
    buildForm: {
      register: buildForm.register,
      handleSubmit: buildForm.handleSubmit,
      formState: buildForm.formState,
      reset: buildForm.reset,
      setValue: buildForm.setValue,
      getValues: buildForm.getValues,
      watch: buildForm.watch,
      clearErrors: buildForm.clearErrors,
    },
    milestoneForm: {
      register: milestoneForm.register,
      handleSubmit: milestoneForm.handleSubmit,
      formState: milestoneForm.formState,
      reset: milestoneForm.reset,
      setValue: milestoneForm.setValue,
      getValues: milestoneForm.getValues,
      watch: milestoneForm.watch,
    },

    // Transient States
    reorderMode,
    setReorderMode,
    mediaLibraryCount,
    setMediaLibraryCount,
    mediaItems,
    setMediaItems,
    imageFit,
    setImageFit,

    // Milestone State
    showAddForm,
    setShowAddForm,
    editingMilestone,
    setEditingMilestone,

    // Mutation Methods
    updateBuild: handleUpdateBuild,
    updateFeaturedImage: handleUpdateFeaturedImage,
    addMilestone: handleAddMilestone,
    updateMilestone: handleUpdateMilestone,
    deleteMilestone: handleDeleteMilestone,
    reorderMilestones: handleReorderMilestones,
    updateMilestoneImages: handleUpdateMilestoneImages,
    deleteBuild: handleDeleteBuild,
  };

  return (
    <BuildEditContext.Provider value={contextValue}>
      {children}
    </BuildEditContext.Provider>
  );
}
