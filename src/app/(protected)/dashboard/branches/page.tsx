"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  getBranches, 
  updateBranch, 
  deleteBranch, 
  uploadBranchImage,
  Branch 
} from "../../../../../services/apiBranches";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";

type FormData = {
  name_ar: string;
  name_en: string;
  area_ar: string;
  area_en: string;
  address_ar: string;
  address_en: string;
  works_hours: string;
  phone: string;
  google_map: string;
};

const BranchesList: React.FC = () => {
  const [branchesList, setBranchesList] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const branchesPerPage = 8;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormData>();

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const data = await getBranches();
        setBranchesList(data);
      } catch (error) {
        console.error("Error fetching branches:", error);
        toast.error("فشل في تحميل الفروع");
      }
    };

    fetchBranches();
  }, []);

  const handleDeleteBranch = async (id: string | number) => {
    try {
      await deleteBranch(typeof id === 'string' ? parseInt(id) : id);
      setBranchesList((prev) => prev.filter((branch) => branch.id.toString() !== id.toString()));
      toast.success("تم حذف الفرع بنجاح");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const handleEditClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setValue("name_ar", branch.name_ar || "");
    setValue("name_en", branch.name_en || "");
    setValue("area_ar", branch.area_ar || "");
    setValue("area_en", branch.area_en || "");
    setValue("address_ar", branch.address_ar || "");
    setValue("address_en", branch.address_en || "");
    setValue("works_hours", branch.works_hours || "");
    setValue("phone", branch.phone || "");
    setValue("google_map", branch.google_map || "");
    setPreviewImage(branch.image || null);
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const onEditSubmit = async (data: FormData) => {
    if (!selectedBranch) return;
    setLoading(true);

    try {
      let imageUrl = selectedBranch.image || undefined;

      // Upload new image if provided
      if (selectedImage) {
        imageUrl = await uploadBranchImage(selectedImage);
      }

      // Update branch
      const branchId = typeof selectedBranch.id === 'string' ? parseInt(selectedBranch.id) : selectedBranch.id;
      const updatedBranch = await updateBranch(branchId, {
        name_ar: data.name_ar,
        name_en: data.name_en,
        area_ar: data.area_ar,
        area_en: data.area_en,
        address_ar: data.address_ar,
        address_en: data.address_en,
        works_hours: data.works_hours,
        phone: data.phone,
        google_map: data.google_map,
        image: imageUrl || undefined,
      });

      setBranchesList((prev) =>
        prev.map((branch) =>
          branch.id === selectedBranch.id ? updatedBranch : branch
        )
      );

      toast.success("تم تحديث الفرع بنجاح");
      setIsEditModalOpen(false);
      reset();
      setSelectedImage(null);
      setPreviewImage(null);
      setSelectedBranch(null);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ البحث والفلترة
  const filteredBranches = branchesList.filter((branch) => {
    const matchesSearch =
      (branch.name_ar || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (branch.name_en || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (branch.area_ar || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (branch.area_en || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredBranches.length / branchesPerPage);
  const paginatedBranches = filteredBranches.slice(
    (currentPage - 1) * branchesPerPage,
    currentPage * branchesPerPage
  );

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">قائمة الفروع</h5>

        <ol className="breadcrumb mt-[12px] md:mt-0 rtl:flex-row-reverse">
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-[#6A4CFF]"
            >
              <i className="material-symbols-outlined absolute ltr:left-0 rtl:right-0 !text-lg -mt-px text-[#6A4CFF] top-1/2 -translate-y-1/2">
                home
              </i>
              رئيسية
            </Link>
          </li>
          <li className="breadcrumb-item inline-block  relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            الفروع
          </li>
        </ol>
      </div>
      <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-tabs branches-tabs">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-[20px] md:mb-[25px] gap-4">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-none">
                <input
                  type="text"
                  placeholder="ابحث عن فرع..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 pr-10 border transition border-purple-300 hover:bg-purple-90 rounded-lg outline-none dark:border-[#172036] dark:hover:bg-[#21123da7] dark:bg-gray-900 dark:text-white"
                />
                <i className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
                  search
                </i>
              </div>
            </div>
          <Link
            href="/dashboard/branches/create-branch"
            className="inline-block transition-all rounded-md font-medium px-[13px] py-[6px] text-[#6A4CFF] border border-[#6A4CFF] hover:bg-[#6A4CFF] hover:text-white"
          >
            <span className="relative pl-6">
              <i className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2">
                add
              </i>
              أضف فرع جديد
            </span>
          </Link>
        </div>

        <div className="table-responsive overflow-x-auto">
          <table className="w-full">
            <thead className="text-black dark:text-white text-end">
              <tr>
                {[
                  "اسم الفرع",
                  "المنطقة",
                  "الصوره",
                  "رقم الهاتف",
                  "التاريخ",
                  "أجرأت",
                ].map((head, i) => (
                  <th
                    key={i}
                    className="font-medium ltr:text-left rtl:text-right px-[20px] py-[11px] bg-[#6A4CFF] text-white dark:bg-[#21123da7] dark:text-white whitespace-nowrap ltr:first:rounded-tl-md ltr:last:rounded-tr-md rtl:first:rounded-tr-md rtl:last:rounded-tl-md"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-black dark:text-white">
              {paginatedBranches.map((branch) => (
                <tr
                  key={branch.id}
                  className="border-t border-gray-100 dark:border-[#172036] hover:bg-purple-100 dark:hover:bg-[#21123da7] transition-colors"
                >
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                    <div>
                      <div className="font-bold text-black dark:text-white">{branch.name_ar}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {branch.name_en}
                      </div>
                    </div>
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                    <div>
                      <div className="font-medium text-black dark:text-white">{branch.area_ar}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {branch.area_en}
                      </div>
                    </div>
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                    {branch.image ? (
                      <Image
                        src={branch.image}
                        alt={branch.name_ar || "Branch"}
                        width={60}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    ) : (
                      <div className="w-[60px] h-[40px] bg-gray-100 dark:bg-[#21123da7] rounded-md flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs">
                        لا توجد صورة
                      </div>
                    )}
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l text-black dark:text-white">
                    {branch.phone || "غير محدد"}
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l text-black dark:text-white">
                    {new Date(branch.created_at).toLocaleDateString("ar-EG", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="ltr:text-left rtl:text-right whitespace-nowrap px-[20px] py-[15px] border-b border-gray-100 dark:border-[#172036] ltr:first:border-l ltr:last:border-r rtl:first:border-r rtl:last:border-l">
                    <div className="flex items-center gap-[9px]">
                      <div className="relative group">
                        <button
                          onClick={() => handleEditClick(branch)}
                          className="text-gray-500 leading-none hover:text-[#6A4CFF] transition-colors"
                        >
                          <i className="material-symbols-outlined !text-md">
                            edit
                          </i>
                        </button>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4326CC] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          تعديل
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4326CC]"></div>
                        </div>
                      </div>

                      <div className="relative group">
                        <button
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="text-danger-500 leading-none hover:text-danger-600 transition-colors"
                        >
                          <i className="material-symbols-outlined !text-md">
                            delete
                          </i>
                        </button>

                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#4326CC] text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          مسح
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#4326CC]"></div>
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedBranches.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    لا توجد فروع متاحة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray bg-opacity-10 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-modal-title"
          >
            <div className="bg-white dark:bg-[#1d1d1d] rounded-xl shadow-2xl p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
              <div className="flex justify-between items-center mb-6">
                <h2
                  id="edit-modal-title"
                  className="text-2xl font-bold text-black dark:text-white"
                >
                  تعديل الفرع
                </h2>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    reset();
                    setSelectedImage(null);
                    setPreviewImage(null);
                    setSelectedBranch(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  aria-label="إغلاق النافذة"
                >
                  <i className="material-symbols-outlined">close</i>
                </button>
              </div>

              <form onSubmit={handleSubmit(onEditSubmit)}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اسم الفرع (ar)
                    </label>
                    <input
                      {...register("name_ar", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "الاسم يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                    />
                    {errors.name_ar && (
                      <p className="text-red-500 mt-1">
                        {errors.name_ar.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اسم الفرع (en)
                    </label>
                    <input
                      {...register("name_en", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "الاسم يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                    />
                    {errors.name_en && (
                      <p className="text-red-500 mt-1">
                        {errors.name_en.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اسم المنطقة (ar)
                    </label>
                    <input
                      {...register("area_ar", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "اسم المنطقة يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                    />
                    {errors.area_ar && (
                      <p className="text-red-500 mt-1">
                        {errors.area_ar.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      اسم المنطقة (en)
                    </label>
                    <input
                      {...register("area_en", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "اسم المنطقة يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                    />
                    {errors.area_en && (
                      <p className="text-red-500 mt-1">
                        {errors.area_en.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      العنوان (ar)
                    </label>
                    <input
                      {...register("address_ar", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                    />
                    {errors.address_ar && (
                      <p className="text-red-500 mt-1">
                        {errors.address_ar.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      العنوان (en)
                    </label>
                    <input
                      {...register("address_en", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "العنوان يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                    />
                    {errors.address_en && (
                      <p className="text-red-500 mt-1">
                        {errors.address_en.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      ساعات العمل
                    </label>
                    <input
                      {...register("works_hours", {
                        required: true,
                        minLength: {
                          value: 1,
                          message: "ساعات العمل يجب أن تكون 1 ساعة على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                    />
                    {errors.works_hours && (
                      <p className="text-red-500 mt-1">
                        {errors.works_hours.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      رقم الهاتف
                    </label>
                    <input
                      {...register("phone", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "رقم الهاتف يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                    />
                    {errors.phone && (
                      <p className="text-red-500 mt-1">
                        {errors.phone.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      الموقع الجغرافي (google map)
                    </label>
                    <input
                      {...register("google_map", {
                        required: true,
                        minLength: {
                          value: 3,
                          message: "الرابط يجب أن يكون 3 أحرف على الأقل",
                        },
                      })}
                      className="h-[45px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-4 block w-full outline-0 transition-all focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                    />
                    {errors.google_map && (
                      <p className="text-red-500 mt-1">
                        {errors.google_map.message || "مطلوب"}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block font-medium text-black dark:text-white">
                      الصورة
                    </label>
                    <div className="relative flex items-center justify-center overflow-hidden rounded-md py-8 px-4 border border-[#6A4CFF]">
                      <div className="flex items-center justify-center">
                        <div className="w-8 h-8 border border-gray-100 dark:border-[#21123da7] flex items-center justify-center rounded-md text-[#6A4CFF] text-lg ltr:mr-3 rtl:ml-3">
                          <i className="ri-upload-2-line"></i>
                        </div>
                        <p className="text-black dark:text-white">
                          <strong>اضغط لرفع الصورة</strong>
                          <br /> JPG, PNG, WEBP (الحد الأقصى 50 ميجابايت)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                      />
                    </div>

                    {previewImage && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <div className="relative w-[50px] h-[50px]">
                          <Image
                            src={previewImage}
                            alt="preview"
                            width={50}
                            height={50}
                            className="rounded-md border border-[#6A4CFF]"
                          />
                          <button
                            type="button"
                            className="absolute top-[-5px] right-[-5px] bg-orange-500 text-white w-[20px] h-[20px] flex items-center justify-center rounded-full text-xs"
                            onClick={() => {
                              setSelectedImage(null);
                              setPreviewImage(null);
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditModalOpen(false);
                      reset();
                      setSelectedImage(null);
                      setPreviewImage(null);
                      setSelectedBranch(null);
                    }}
                    disabled={loading}
                    className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-[#21123da7] dark:hover:bg-[#1a2942] text-gray-700 dark:text-gray-200 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="إلغاء التعديل"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 rounded-lg bg-[#6A4CFF] hover:bg-[#5a3ce6] text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#6A4CFF] focus:ring-offset-2"
                    aria-label="حفظ التغييرات"
                  >
                    {loading ? "جاري الحفظ..." : "حفظ التغييرات"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-100 dark:border-[#172036] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625] transition-colors"
              aria-label="الصفحة السابقة"
            >
              السابق
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 border border-gray-100 dark:border-[#172036] rounded transition-colors ${
                  currentPage === i + 1
                    ? "bg-[#6A4CFF] text-white border-[#6A4CFF]"
                    : "hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625]"
                }`}
                aria-label={`الصفحة ${i + 1}`}
                aria-current={currentPage === i + 1 ? "page" : undefined}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-100 dark:border-[#172036] rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#DFF3E3] dark:hover:bg-[#0E1625] transition-colors"
              aria-label="الصفحة التالية"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default BranchesList;
