"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Plus,
  Store,
  MapPin,
  Phone,
  Mail,
  FileCheck,
  AlertCircle,
  ChevronRight,
  MoreVertical,
  Upload,
  Loader2,
  Trash2,
  Edit2,
  Power,
  X,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useForm, SubmitHandler, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { restaurantSchema, type RestaurantFormData } from "@/schemas";
import { useRestaurants } from "@/hooks/useRestaurants";
import { toast } from "sonner";
import axios from "axios";
import { Restaurant } from "@/types/restaurant";
import { uploadFile, deleteFile } from "@/lib/upload";
import ConfirmationModal from "@/components/ConfirmationModal";

const LocationPicker = dynamic(
  () => import("@/components/Map/LocationPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-white/5 animate-pulse rounded-2xl border border-white/10 flex items-center justify-center text-white/20">
        Loading Map...
      </div>
    ),
  },
);

interface ScheduleFormData {
  openingHours: Restaurant["openingHours"];
  isManualOverride: boolean;
}

const ScheduleModal = ({
  isOpen,
  onClose,
  restaurant,
  onUpdate,
}: {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant | null;
  onUpdate: (data: ScheduleFormData) => Promise<void>;
}) => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<ScheduleFormData>({
    defaultValues: {
      openingHours: restaurant?.openingHours || [],
      isManualOverride: restaurant?.isManualOverride || false,
    },
  });

  const openingHours = useWatch({
    control,
    name: "openingHours",
  });

  const isManualOverride = useWatch({
    control,
    name: "isManualOverride",
  });

  useEffect(() => {
    if (restaurant) {
      reset({
        openingHours: restaurant.openingHours,
        isManualOverride: restaurant.isManualOverride,
      });
    }
  }, [restaurant, reset]);

  if (!isOpen || !restaurant) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#013644]/80 backdrop-blur-xl animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-[#002833] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#98E32F]/10 flex items-center justify-center text-[#98E32F] border border-[#98E32F]/20">
              <Clock size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Operating Hours</h3>
              <p className="text-xs text-white/40 uppercase tracking-widest font-bold">
                {restaurant.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-white/5 rounded-2xl text-white/20 hover:text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onUpdate)}
          className="p-8 space-y-6 max-h-[55vh] overflow-y-auto custom-scrollbar"
        >
          <label className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-3xl cursor-pointer hover:bg-white/[0.07] transition-all">
            <div>
              <h4 className="font-bold mb-1">Manual Mode</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">
                Disable automatic schedule tracking
              </p>
            </div>
            <div className="relative inline-flex items-center">
              <input
                type="checkbox"
                {...register("isManualOverride")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/20 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#98E32F]"></div>
            </div>
          </label>

          {isManualOverride ? (
            <div className="bg-[#98E32F]/5 border border-[#98E32F]/10 rounded-3xl p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-[#98E32F]/10 rounded-full flex items-center justify-center text-[#98E32F] mx-auto">
                <Power size={32} />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">
                  Manual Control Active
                </h4>
                <p className="text-sm text-white/50 max-w-sm mx-auto mt-2">
                  Your automated schedule is currently paused. You can open or
                  close your restaurant manually using the
                  <span className="text-[#98E32F] font-bold mx-1">
                    Power Toggle
                  </span>
                  on the restaurant card.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {[
                "Sunday",
                "Monday",
                "Tuesday",
                "Wednesday",
                "Thursday",
                "Friday",
                "Saturday",
              ].map((dayName, index) => {
                const isClosed = openingHours?.[index]?.isClosed;
                return (
                  <div
                    key={dayName}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all border ${
                      isClosed
                        ? "bg-red-500/5 border-red-500/10 opacity-60"
                        : "bg-white/5 border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-4 w-32">
                      <span className="text-sm font-bold">{dayName}</span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div
                        className={`flex items-center gap-3 transition-opacity duration-300 ${isClosed ? "opacity-30 pointer-events-none" : "opacity-100"}`}
                      >
                        <input
                          type="time"
                          {...register(`openingHours.${index}.openTime`)}
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#98E32F]/50 transition-all font-mono"
                        />
                        <span className="text-white/20 text-xs">to</span>
                        <input
                          type="time"
                          {...register(`openingHours.${index}.closeTime`)}
                          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#98E32F]/50 transition-all font-mono"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const current = getValues(
                            `openingHours.${index}.isClosed`,
                          );
                          setValue(`openingHours.${index}.isClosed`, !current);
                        }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all border ${
                          isClosed
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-[#98E32F]/10 text-[#98E32F] border-[#98E32F]/20 hover:bg-[#98E32F]/20"
                        }`}
                      >
                        {isClosed ? "CLOSED" : "OPEN"}
                      </button>
                      <input
                        type="hidden"
                        {...register(`openingHours.${index}.day`)}
                      />
                      <input
                        type="hidden"
                        {...register(`openingHours.${index}.isClosed`)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </form>

        <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-8 py-4 rounded-[1.5rem] font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit(onUpdate)}
            disabled={isSubmitting}
            className="flex-[2] bg-[#98E32F] text-[#013644] px-10 py-4 rounded-[1.5rem] font-black hover:shadow-[0_0_30px_rgba(152,227,47,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Save Schedule"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function OwnerRestaurantsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingRestaurant, setSchedulingRestaurant] =
    useState<Restaurant | null>(null);

  const {
    useMyRestaurants,
    createRestaurant,
    submitForVerification,
    updateRestaurant,
    deleteRestaurant,
  } = useRestaurants();
  const { data: restaurants, isLoading } = useMyRestaurants();

  // File states
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [docsUrls, setDocsUrls] = useState<Record<string, string>>({});
  const [uploadingFile, setUploadingFile] = useState<string | null>(null);

  const handleUpdateSchedule = async (data: {
    openingHours: Restaurant["openingHours"];
    isManualOverride: boolean;
  }) => {
    if (!schedulingRestaurant) return;
    try {
      await updateRestaurant.mutateAsync({
        id: schedulingRestaurant._id,
        data: {
          openingHours: data.openingHours,
          isManualOverride: data.isManualOverride,
        },
      });
      toast.success("Schedule updated successfully");
      setIsScheduleModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update schedule");
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      description: "",
      email: "",
      contactNumber: "",
      address: {
        street: "",
        city: "",
        state: "Kerala",
        zipCode: "",
      },
      image: "",
      legalDocs: {
        fssaiLicenseNumber: "",
        fssaiCertificateUrl: "",
        panNumber: "",
        gstNumber: "",
        gstCertificateUrl: "",
        tradeLicenseNumber: "",
        tradeLicenseUrl: "",
        healthCertificateUrl: "",
      },
      isManualOverride: false,
      openingHours: Array.from({ length: 7 }, (_, i) => ({
        day: i,
        openTime: "09:00",
        closeTime: "22:00",
        isClosed: false,
      })),
    },
  });

  // Restore from sessionStorage on mount
  useEffect(() => {
    const savedLogoUrl = sessionStorage.getItem("restaurant-logo-url");
    const savedDocsUrls = sessionStorage.getItem("restaurant-docs-urls");

    if (savedLogoUrl) {
      setLogoUrl(savedLogoUrl);
      setValue("image", savedLogoUrl);
    }

    if (savedDocsUrls) {
      const parsed = JSON.parse(savedDocsUrls);
      setDocsUrls(parsed);
      // Restore form values
      Object.entries(parsed).forEach(([key, url]) => {
        const fieldMap: Record<string, keyof RestaurantFormData["legalDocs"]> =
          {
            fssaiCertificate: "fssaiCertificateUrl",
            gstCertificate: "gstCertificateUrl",
            tradeLicense: "tradeLicenseUrl",
            healthCertificate: "healthCertificateUrl",
          };
        const fieldKey = fieldMap[key];
        if (fieldKey) {
          setValue(`legalDocs.${fieldKey}`, url as string);
        }
      });
    }
  }, [setValue]);

  // Save logoUrl to sessionStorage whenever it changes
  useEffect(() => {
    if (logoUrl) {
      sessionStorage.setItem("restaurant-logo-url", logoUrl);
    }
  }, [logoUrl]);

  // Save docsUrls to sessionStorage whenever it changes
  useEffect(() => {
    if (Object.keys(docsUrls).length > 0) {
      sessionStorage.setItem("restaurant-docs-urls", JSON.stringify(docsUrls));
    }
  }, [docsUrls]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string,
    folder: string = "restaurants",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingFile(type);
      const url = await uploadFile(file, folder);

      if (type === "logo") {
        if (logoUrl) {
          await deleteFile(logoUrl).catch(console.error);
        }
        setLogoUrl(url);
        setValue("image", url);
      } else {
        if (docsUrls[type]) {
          await deleteFile(docsUrls[type]).catch(console.error);
        }
        setDocsUrls((prev) => ({ ...prev, [type]: url }));
        // Type-safe field name mapping
        const fieldMap: Record<string, keyof RestaurantFormData["legalDocs"]> =
          {
            fssaiCertificate: "fssaiCertificateUrl",
            gstCertificate: "gstCertificateUrl",
            tradeLicense: "tradeLicenseUrl",
            healthCertificate: "healthCertificateUrl",
          };
        const fieldKey = fieldMap[type];
        if (fieldKey) {
          setValue(`legalDocs.${fieldKey}`, url);
        }
      }
      toast.success(`${type} uploaded successfully!`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || `Failed to upload ${type}`,
        );
      } else {
        toast.error(`Failed to upload ${type}`);
      }
    } finally {
      setUploadingFile(null);
    }
  };

  const handleRemoveFile = async (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (type === "logo") {
        if (logoUrl) await deleteFile(logoUrl);
        setLogoUrl("");
        setValue("image", "");
      } else {
        const url = docsUrls[type];
        if (url) await deleteFile(url);

        const newDocs = { ...docsUrls };
        delete newDocs[type];
        setDocsUrls(newDocs);

        const fieldMap: Record<string, keyof RestaurantFormData["legalDocs"]> =
          {
            fssaiCertificate: "fssaiCertificateUrl",
            gstCertificate: "gstCertificateUrl",
            tradeLicense: "tradeLicenseUrl",
            healthCertificate: "healthCertificateUrl",
          };
        const fieldKey = fieldMap[type];
        if (fieldKey) {
          setValue(`legalDocs.${fieldKey}`, "");
        }
      }
      toast.success(`${type} removed`);
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast.error("Failed to remove file from server");
    }
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    reset();
    setLogoUrl("");
    setDocsUrls({});
    setSelectedLocation(null);
    setEditingId(null);
    // Clear sessionStorage
    sessionStorage.removeItem("restaurant-logo-url");
    sessionStorage.removeItem("restaurant-docs-urls");
  };

  const handleEdit = (restaurant: Restaurant) => {
    setEditingId(restaurant._id);
    setActiveDropdownId(null);

    // Populate form
    setValue("name", restaurant.name);
    setValue("description", restaurant.description);
    setValue("email", restaurant.email);
    setValue("contactNumber", restaurant.contactNumber);

    setValue("address.street", restaurant.address.street);
    setValue("address.city", restaurant.address.city);
    setValue("address.state", restaurant.address.state);
    setValue("address.zipCode", restaurant.address.zipCode);

    if (restaurant.address.coordinates) {
      setSelectedLocation(restaurant.address.coordinates);
    }

    // Set Image
    if (restaurant.image) {
      setLogoUrl(restaurant.image);
      setValue("image", restaurant.image);
    }

    // Docs
    setValue(
      "legalDocs.fssaiLicenseNumber",
      restaurant.legalDocs.fssaiLicenseNumber,
    );
    setValue("legalDocs.panNumber", restaurant.legalDocs.panNumber);
    setValue("legalDocs.gstNumber", restaurant.legalDocs.gstNumber);
    setValue(
      "legalDocs.tradeLicenseNumber",
      restaurant.legalDocs.tradeLicenseNumber,
    );

    // Map docs urls
    const docsToAdd: Record<string, string> = {};
    if (restaurant.legalDocs.fssaiCertificateUrl) {
      docsToAdd["fssaiCertificate"] = restaurant.legalDocs.fssaiCertificateUrl;
      setValue(
        "legalDocs.fssaiCertificateUrl",
        restaurant.legalDocs.fssaiCertificateUrl,
      );
    }
    if (restaurant.legalDocs.gstCertificateUrl) {
      docsToAdd["gstCertificate"] = restaurant.legalDocs.gstCertificateUrl;
      setValue(
        "legalDocs.gstCertificateUrl",
        restaurant.legalDocs.gstCertificateUrl,
      );
    }
    if (restaurant.legalDocs.tradeLicenseUrl) {
      docsToAdd["tradeLicense"] = restaurant.legalDocs.tradeLicenseUrl;
      setValue(
        "legalDocs.tradeLicenseUrl",
        restaurant.legalDocs.tradeLicenseUrl,
      );
    }
    if (restaurant.legalDocs.healthCertificateUrl) {
      docsToAdd["healthCertificate"] =
        restaurant.legalDocs.healthCertificateUrl;
      setValue(
        "legalDocs.healthCertificateUrl",
        restaurant.legalDocs.healthCertificateUrl,
      );
    }
    setDocsUrls(docsToAdd);

    // Opening Hours
    if (restaurant.openingHours && restaurant.openingHours.length > 0) {
      setValue("openingHours", restaurant.openingHours);
    }
    setValue("isManualOverride", restaurant.isManualOverride || false);

    setIsAddModalOpen(true);
  };

  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({
    isOpen: false,
    id: "",
    name: "",
  });

  const handleDelete = (restaurant: Restaurant) => {
    setActiveDropdownId(null);
    setDeleteConfirmation({
      isOpen: true,
      id: restaurant._id,
      name: restaurant.name,
    });
  };

  const confirmDelete = async () => {
    try {
      await deleteRestaurant.mutateAsync(deleteConfirmation.id);
      toast.success("Restaurant deleted successfully");
    } catch (error) {
      toast.error("Failed to delete restaurant");
      console.error(error);
    }
  };

  const handleToggleOpen = async (
    restaurant: Restaurant,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    try {
      await updateRestaurant.mutateAsync({
        id: restaurant._id,
        data: { isOpen: !restaurant.isOpen },
      });
      toast.success(
        restaurant.isOpen
          ? "Restaurant closed for orders"
          : "Restaurant is now open",
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to update status");
      } else {
        toast.error("Failed to update status");
      }
    }
  };

  const handleCancel = async () => {
    try {
      // Only delete files if we're in registration mode (not editing)
      if (!editingId) {
        // Delete logo if exists
        if (logoUrl) {
          await deleteFile(logoUrl).catch((err) =>
            console.error("Failed to delete logo:", err),
          );
        }

        // Delete all uploaded documents
        const uploadedDocs = Object.values(docsUrls);
        if (uploadedDocs.length > 0) {
          await Promise.all(
            uploadedDocs.map((url) =>
              deleteFile(url).catch((err) =>
                console.error("Failed to delete doc:", err),
              ),
            ),
          );
        }
      }

      toast.info(editingId ? "Edit cancelled" : "Registration cancelled");
    } catch (error) {
      console.error("Error during cancellation cleanup:", error);
    } finally {
      handleCloseModal();
    }
  };

  const onSubmit: SubmitHandler<RestaurantFormData> = async (data) => {
    if (!selectedLocation) {
      toast.error("Please select a location on the map");
      return;
    }

    try {
      if (editingId) {
        await updateRestaurant.mutateAsync({
          id: editingId,
          data: {
            ...data,
            address: {
              ...data.address,
              coordinates: selectedLocation || undefined,
            },
          },
        });
        toast.success("Restaurant updated successfully!");
      } else {
        await createRestaurant.mutateAsync({
          ...data,
          address: {
            ...data.address,
            coordinates: selectedLocation || undefined,
          },
        });
        toast.success("Restaurant registered successfully!");
      }
      handleCloseModal();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Failed to register restaurant",
        );
      } else {
        toast.error("Failed to register restaurant");
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">My Restaurants</h2>
          <p className="text-white/60 text-sm sm:text-base">
            Manage your business locations and their status.
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-[#98E32F] text-[#013644] px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#86c929] transition-all transform hover:scale-105 active:scale-95 w-full sm:w-auto"
        >
          <Plus size={20} />
          Add Restaurant
        </button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-3xl sm:rounded-[2.5rem] h-[400px] animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
          {restaurants?.map((restaurant: Restaurant) => (
            <div
              key={restaurant._id}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden group hover:border-[#98E32F]/30 transition-all"
            >
              <div className="relative h-48">
                <Image
                  src={
                    restaurant.image ||
                    "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"
                  }
                  alt={restaurant.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Open/Close Toggle */}
              </div>

              <div className="p-6">
                {/* Status & Actions Bar */}
                <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/5">
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`
                      px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border 
                      ${
                        restaurant.status === "active"
                          ? "bg-green-500/10 text-green-400 border-green-500/20"
                          : restaurant.status === "pending"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                      }
                    `}
                    >
                      {restaurant.status}
                    </span>

                    {restaurant.status === "active" && (
                      <div className="flex flex-wrap gap-2 items-center">
                        <span
                          className={`
                          px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5
                          ${
                            restaurant.isOpen
                              ? "bg-[#98E32F]/10 text-[#98E32F] border-[#98E32F]/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }
                        `}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${restaurant.isOpen ? "bg-[#98E32F] animate-pulse" : "bg-red-400"}`}
                          ></div>
                          {restaurant.isOpen ? "OPEN" : "CLOSED"}
                        </span>

                        {restaurant.isManualOverride && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await updateRestaurant.mutateAsync({
                                  id: restaurant._id,
                                  data: { resetOverride: true },
                                });
                                toast.success("Schedule resumed");
                              } catch (error) {
                                console.error(error);
                                toast.error("Failed to resume schedule");
                              }
                            }}
                            className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-wider border border-white/10 transition-all text-white/40 hover:text-white"
                          >
                            Reschedule
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {restaurant.status === "active" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSchedulingRestaurant(restaurant);
                          setIsScheduleModalOpen(true);
                        }}
                        className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-[#98E32F] hover:border-[#98E32F]/50 transition-all"
                        title="Operating Hours"
                      >
                        <Clock size={18} />
                      </button>
                    )}

                    {restaurant.status === "active" && (
                      <button
                        onClick={(e) => handleToggleOpen(restaurant, e)}
                        className={`p-2.5 rounded-xl border transition-all ${
                          restaurant.isOpen
                            ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"
                        }`}
                        title={
                          restaurant.isOpen ? "Stop Orders" : "Start Orders"
                        }
                      >
                        <Power size={18} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-2 text-white/50 text-sm">
                      <MapPin size={14} />
                      <span>
                        {restaurant.address.city}, {restaurant.address.state}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDropdownId(
                          activeDropdownId === restaurant._id
                            ? null
                            : restaurant._id,
                        );
                      }}
                      className="p-2 hover:bg-white/5 rounded-xl text-white/40"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {activeDropdownId === restaurant._id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveDropdownId(null)}
                        ></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-[#002833] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 flex flex-col py-1">
                          <button
                            onClick={() => handleEdit(restaurant)}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-white/5 text-left text-sm text-white/80"
                          >
                            <Edit2 size={16} />
                            Edit Details
                          </button>
                          <button
                            onClick={() => handleDelete(restaurant)}
                            className="flex items-center gap-2 px-4 py-3 hover:bg-red-500/10 text-left text-sm text-red-400"
                          >
                            <Trash2 size={16} />
                            Delete Restaurant
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex gap-3">
                  <Link
                    href={`/restaurants/${restaurant._id}`}
                    className="w-full bg-white/5 hover:bg-[#98E32F] hover:text-[#013644] border border-white/10 hover:border-[#98E32F] py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    View Dashboard
                    <ArrowRight
                      size={16}
                      className="group-hover/btn:translate-x-1 transition-transform"
                    />
                  </Link>
                  {restaurant.status === "inactive" && (
                    <button
                      onClick={() => {
                        submitForVerification.mutate(restaurant._id);
                      }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 bg-[#98E32F] text-[#013644] hover:bg-[#86c929]"
                    >
                      Verify Now <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Add New Placeholder */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="border-2 border-dashed border-white/10 rounded-3xl sm:rounded-[2.5rem] flex flex-col items-center justify-center p-8 hover:border-[#98E32F]/50 hover:bg-[#98E32F]/5 group transition-all h-full min-h-[300px] sm:min-h-[400px]"
          >
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus
                size={32}
                className="text-white/20 group-hover:text-[#98E32F]"
              />
            </div>
            <p className="text-lg sm:text-xl font-bold text-white/40 group-hover:text-white">
              Add New Restaurant
            </p>
            <p className="text-xs sm:text-sm text-white/20 mt-1">
              Expand your business
            </p>
          </button>
        </div>
      )}

      {/* Add Restaurant Modal (Overlay) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4">
          <div
            className="absolute inset-0 bg-[#013644]/95 backdrop-blur-md"
            onClick={handleCancel}
          ></div>

          <div className="relative bg-[#002833] border border-white/10 w-full sm:max-w-3xl h-full sm:h-auto sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[100vh] sm:max-h-[90vh]">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex-1 overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 sm:px-8 py-4 sm:py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[#98E32F]/20 rounded-xl">
                    <Store size={20} className="text-[#98E32F] sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold">
                      {editingId ? "Edit Restaurant" : "Register Restaurant"}
                    </h3>
                    <p className="text-white/40 text-[9px] sm:text-[11px] uppercase tracking-widest font-bold">
                      Business Details
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                <div className="p-4 sm:p-8 space-y-10">
                  <div className="space-y-8 sm:space-y-10">
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#98E32F]">
                          Basic Information
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold text-white/50 mb-2 block ml-1 uppercase tracking-wider">
                            Restaurant Name
                          </label>
                          <div className="relative group">
                            <Store
                              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.name ? "text-red-500" : "text-white/20 group-focus-within:text-[#98E32F]"}`}
                              size={16}
                            />
                            <input
                              {...register("name")}
                              type="text"
                              className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-3 sm:py-4 focus:bg-[#98E32F]/5 outline-none transition-all placeholder:text-white/10 text-sm sm:text-base ${errors.name ? "border-red-500/50" : "border-white/10 focus:border-[#98E32F]/50"}`}
                              placeholder="e.g. Malabar Kitchen & Grill"
                            />
                          </div>
                          {errors.name && (
                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="text-xs font-bold text-white/50 mb-2 block ml-1 uppercase tracking-wider">
                            Brand Logo
                          </label>
                          <div className="relative">
                            <input
                              type="file"
                              id="logo-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "logo")}
                            />
                            <label
                              htmlFor="logo-upload"
                              className={`w-full h-[58px] bg-white/5 border border-dashed rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all overflow-hidden relative group ${
                                logoUrl
                                  ? "border-[#98E32F]/50 bg-[#98E32F]/5"
                                  : "border-white/10 text-white/30 hover:bg-[#98E32F]/5 hover:text-[#98E32F] hover:border-[#98E32F]/50"
                              }`}
                            >
                              {(() => {
                                if (uploadingFile === "logo") {
                                  return (
                                    <Loader2
                                      className="animate-spin text-[#98E32F]"
                                      size={18}
                                    />
                                  );
                                } else if (logoUrl) {
                                  return (
                                    <>
                                      <div className="absolute inset-0 flex items-center justify-center p-2">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={logoUrl}
                                          alt="Restaurant Logo Preview"
                                          className="w-full h-full object-contain"
                                          onError={(e) => {
                                            console.error(
                                              "Image failed to load:",
                                              logoUrl,
                                            );
                                            console.error("Error event:", e);
                                          }}
                                          onLoad={() => {
                                            console.log(
                                              "Image loaded successfully:",
                                              logoUrl,
                                            );
                                          }}
                                        />
                                      </div>
                                      <button
                                        onClick={(e) =>
                                          handleRemoveFile(e, "logo")
                                        }
                                        className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg transition-colors z-10"
                                        title="Remove Logo"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                      <div className="absolute inset-0 bg-[#013644]/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity pointer-events-none">
                                        <Upload
                                          size={16}
                                          className="text-white"
                                        />
                                        <span className="text-xs font-bold text-white">
                                          Change Logo
                                        </span>
                                      </div>
                                    </>
                                  );
                                } else {
                                  return (
                                    <>
                                      <Plus size={16} />
                                      <span className="text-xs font-bold">
                                        Upload
                                      </span>
                                    </>
                                  );
                                }
                              })()}
                            </label>
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <label className="text-xs font-bold text-white/50 mb-2 block ml-1 uppercase tracking-wider">
                            Description
                          </label>
                          <textarea
                            {...register("description")}
                            rows={3}
                            className={`w-full bg-white/5 border rounded-2xl px-4 py-4 focus:bg-[#98E32F]/5 outline-none transition-all resize-none text-sm placeholder:text-white/10 ${errors.description ? "border-red-500/50" : "border-white/10 focus:border-[#98E32F]/50"}`}
                            placeholder="Describe your cuisine, ambiance, and specialities..."
                          />
                          {errors.description && (
                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">
                              {errors.description.message}
                            </p>
                          )}
                        </div>

                        <div className="relative group">
                          <label className="text-xs font-bold text-white/50 mb-2 block ml-1 uppercase tracking-wider">
                            Support Email
                          </label>
                          <div className="relative">
                            <Mail
                              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? "text-red-500" : "text-white/20 group-focus-within:text-[#98E32F]"}`}
                              size={18}
                            />
                            <input
                              {...register("email")}
                              type="email"
                              className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-4 focus:bg-[#98E32F]/5 outline-none transition-all placeholder:text-white/10 ${errors.email ? "border-red-500/50" : "border-white/10 focus:border-[#98E32F]/50"}`}
                              placeholder="contact@youbrand.com"
                            />
                          </div>
                          {errors.email && (
                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="relative group">
                          <label className="text-xs font-bold text-white/50 mb-2 block ml-1 uppercase tracking-wider">
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone
                              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.contactNumber ? "text-red-500" : "text-white/20 group-focus-within:text-[#98E32F]"}`}
                              size={18}
                            />
                            <input
                              {...register("contactNumber")}
                              type="tel"
                              className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-4 focus:bg-[#98E32F]/5 outline-none transition-all placeholder:text-white/10 ${errors.contactNumber ? "border-red-500/50" : "border-white/10 focus:border-[#98E32F]/50"}`}
                              placeholder="+91 000 000 0000"
                            />
                          </div>
                          {errors.contactNumber && (
                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">
                              {errors.contactNumber.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#98E32F]">
                          Location & Address
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-3">
                          <label className="text-xs font-bold text-white/50 mb-2 block ml-1 uppercase tracking-wider">
                            Street Address
                          </label>
                          <div className="relative group">
                            <MapPin
                              className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.address?.street ? "text-red-500" : "text-white/20 group-focus-within:text-[#98E32F]"}`}
                              size={18}
                            />
                            <input
                              {...register("address.street")}
                              type="text"
                              className={`w-full bg-white/5 border rounded-2xl pl-12 pr-4 py-4 focus:bg-[#98E32F]/5 outline-none transition-all placeholder:text-white/10 ${errors.address?.street ? "border-red-500/50" : "border-white/10 focus:border-[#98E32F]/50"}`}
                              placeholder="Floor, Building, Area name"
                            />
                          </div>
                          {errors.address?.street && (
                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">
                              {errors.address.street.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            {...register("address.city")}
                            type="text"
                            className={`w-full bg-white/5 border rounded-2xl px-4 py-4 focus:bg-[#98E32F]/5 outline-none transition-all text-sm ${errors.address?.city ? "border-red-500/50" : "border-white/10 focus:border-[#98E32F]/50"}`}
                            placeholder="City"
                          />
                          {errors.address?.city && (
                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">
                              {errors.address.city.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <input
                            {...register("address.state")}
                            type="text"
                            className={`w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 focus:border-[#98E32F]/50 focus:bg-[#98E32F]/5 outline-none transition-all text-sm`}
                            defaultValue="Kerala"
                          />
                        </div>
                        <div>
                          <input
                            {...register("address.zipCode")}
                            type="text"
                            className={`w-full bg-white/5 border rounded-2xl px-4 py-4 focus:bg-[#98E32F]/5 outline-none transition-all text-sm ${errors.address?.zipCode ? "border-red-500/50" : "border-white/10 focus:border-[#98E32F]/50"}`}
                            placeholder="Zip Code"
                          />
                          {errors.address?.zipCode && (
                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">
                              {errors.address.zipCode.message}
                            </p>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Map Selection Integrated */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10"></div>
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#98E32F]">
                          Map Precision
                        </h4>
                        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10"></div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <p className="text-[10px] sm:text-xs text-white/40">
                            Drop a pin exactly where your restaurant entrance is
                            located.
                          </p>
                          {selectedLocation && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#98E32F]/10 rounded-xl self-start sm:self-auto border border-[#98E32F]/20">
                              <div className="w-2 h-2 rounded-full bg-[#98E32F] animate-pulse"></div>
                              <span className="text-[10px] font-mono font-bold text-[#98E32F]">
                                {selectedLocation.lat.toFixed(6)},{" "}
                                {selectedLocation.lng.toFixed(6)}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="h-[300px] sm:h-[400px] relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-inner group">
                          <LocationPicker
                            initialLocation={
                              selectedLocation
                                ? [selectedLocation.lat, selectedLocation.lng]
                                : undefined
                            }
                            onLocationSelect={(lat, lng) =>
                              setSelectedLocation({ lat, lng })
                            }
                          />
                          <div className="absolute inset-0 border-2 border-[#98E32F]/0 group-focus-within:border-[#98E32F]/20 transition-all pointer-events-none rounded-2xl sm:rounded-3xl"></div>
                        </div>

                        <div className="bg-[#98E32F]/[0.05] border border-[#98E32F]/10 p-4 rounded-2xl">
                          <div className="flex items-start gap-3">
                            <AlertCircle
                              size={18}
                              className="text-[#98E32F] shrink-0 mt-0.5"
                            />
                            <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                              This precise location helps delivery partners find
                              you faster. Please ensure the pin is right on your
                              entrance.
                            </p>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="bg-[#98E32F]/[0.02] border border-[#98E32F]/10 rounded-[2rem] p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <FileCheck size={20} className="text-[#98E32F]" />
                        <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-[#98E32F]">
                          Compliance & Documents
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-bold text-white/30 mb-2 block uppercase text-red-400">
                            FSSAI License Number *
                          </label>
                          <input
                            {...register("legalDocs.fssaiLicenseNumber")}
                            type="text"
                            className={`w-full bg-[#013644] border rounded-2xl px-4 py-4 focus:border-[#98E32F] outline-none text-sm shadow-inner ${errors.legalDocs?.fssaiLicenseNumber ? "border-red-500/50 text-red-500" : "border-white/10"}`}
                            placeholder="14-digit Number"
                          />
                          {errors.legalDocs?.fssaiLicenseNumber && (
                            <p className="text-red-500 text-[10px] mt-1 ml-1 font-bold italic">
                              {errors.legalDocs.fssaiLicenseNumber.message}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-white/30 mb-2 block uppercase">
                            Business PAN
                          </label>
                          <input
                            {...register("legalDocs.panNumber")}
                            type="text"
                            className="w-full bg-[#013644] border border-white/10 rounded-2xl px-4 py-4 focus:border-[#98E32F] outline-none text-sm shadow-inner"
                            placeholder="ABCDE1234F"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-white/30 mb-2 block uppercase">
                            GST Number (Optional)
                          </label>
                          <input
                            {...register("legalDocs.gstNumber")}
                            type="text"
                            className="w-full bg-[#013644] border border-white/10 rounded-2xl px-4 py-4 focus:border-[#98E32F] outline-none text-sm shadow-inner"
                            placeholder="22AAAAA0000A1Z5"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-white/30 mb-2 block uppercase">
                            Trade License / D&O No.
                          </label>
                          <input
                            {...register("legalDocs.tradeLicenseNumber")}
                            type="text"
                            className="w-full bg-[#013644] border border-white/10 rounded-2xl px-4 py-4 focus:border-[#98E32F] outline-none text-sm shadow-inner"
                            placeholder="License Number"
                          />
                        </div>

                        <div className="md:col-span-2 mt-4">
                          <div className="flex items-center gap-3 mb-4">
                            <label className="text-[10px] font-bold text-white/30 block uppercase tracking-widest">
                              Upload Digital Copies
                            </label>
                            <div className="h-px flex-1 bg-white/5"></div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              {
                                label: "FSSAI Certificate",
                                key: "fssaiCertificate",
                              },
                              {
                                label: "GST Certificate",
                                key: "gstCertificate",
                              },
                              { label: "Trade License", key: "tradeLicense" },
                              {
                                label: "Health Certificate",
                                key: "healthCertificate",
                              },
                            ].map((doc) => (
                              <div key={doc.key} className="relative group">
                                <input
                                  type="file"
                                  id={`${doc.key}-upload`}
                                  className="hidden"
                                  accept=".pdf,image/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, doc.key, "documents")
                                  }
                                />
                                <label
                                  htmlFor={`${doc.key}-upload`}
                                  className={`w-full aspect-[4/3] bg-[#013644] border border-white/10 border-dashed rounded-[1.5rem] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all p-4 group-active:scale-95 ${
                                    docsUrls[doc.key]
                                      ? "border-[#98E32F]/40 bg-[#98E32F]/5"
                                      : "hover:bg-[#98E32F]/5 hover:border-[#98E32F]/40"
                                  }`}
                                >
                                  <div
                                    className={`p-3 bg-white/5 rounded-full transition-all ${
                                      docsUrls[doc.key]
                                        ? "text-[#98E32F] bg-[#98E32F]/10"
                                        : "text-white/20 group-hover:text-[#98E32F] group-hover:bg-[#98E32F]/10"
                                    }`}
                                  >
                                    {uploadingFile === doc.key ? (
                                      <Loader2
                                        className="animate-spin"
                                        size={18}
                                      />
                                    ) : docsUrls[doc.key] ? (
                                      <FileCheck size={18} />
                                    ) : (
                                      <Upload size={18} />
                                    )}
                                  </div>
                                  <div className="text-center">
                                    <p
                                      className={`text-[10px] font-bold transition-colors ${
                                        docsUrls[doc.key]
                                          ? "text-white"
                                          : "text-white/40 group-hover:text-white"
                                      }`}
                                    >
                                      {doc.label}
                                    </p>
                                    <p className="text-[8px] text-white/20 mt-1 uppercase tracking-tighter">
                                      {docsUrls[doc.key]
                                        ? "Uploaded"
                                        : "PDF or Image"}
                                    </p>
                                  </div>
                                  {docsUrls[doc.key] && (
                                    <button
                                      onClick={(e) =>
                                        handleRemoveFile(e, doc.key)
                                      }
                                      className="absolute top-2 right-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-1.5 rounded-lg transition-all"
                                      title="Remove Document"
                                    >
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>

              <div className="px-6 sm:px-8 py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/[0.02]">
                <div className="flex items-center gap-2 text-white/30 text-[10px] font-bold uppercase tracking-widest order-2 sm:order-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-white/20"></div>
                  Requires Admin Approval
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto order-1 sm:order-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 sm:flex-none px-6 sm:px-8 py-3 rounded-2xl font-bold text-white/40 hover:text-white hover:bg-white/5 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] sm:flex-none bg-[#98E32F] text-[#013644] px-6 sm:px-10 py-3 rounded-2xl font-black text-sm hover:shadow-[0_0_30px_rgba(152,227,47,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : editingId ? (
                      "Update"
                    ) : (
                      "Submit"
                    )}{" "}
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <ScheduleModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        restaurant={schedulingRestaurant}
        onUpdate={handleUpdateSchedule}
      />
      <ConfirmationModal
        isOpen={deleteConfirmation.isOpen}
        onClose={() =>
          setDeleteConfirmation((prev) => ({ ...prev, isOpen: false }))
        }
        onConfirm={confirmDelete}
        title="Delete Restaurant"
        message={`Are you sure you want to delete "${deleteConfirmation.name}"? This action cannot be undone and all associated data will be permanently removed.`}
        confirmText="Delete Restaurant"
        isDangerous={true}
      />
    </div>
  );
}
