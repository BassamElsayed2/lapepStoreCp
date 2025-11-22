"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTestemonialById,
  updateTestemonial,
  uploadTestimonialImage,
  Testimonial,
} from "../../../../../../services/apiTestemonial";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  Editor,
  EditorProvider,
  BtnBold,
  BtnBulletList,
  BtnClearFormatting,
  BtnItalic,
  BtnLink,
  BtnNumberedList,
  BtnRedo,
  BtnStrikeThrough,
  BtnStyles,
  BtnUnderline,
  BtnUndo,
  HtmlButton,
  Separator,
  Toolbar,
} from "react-simple-wysiwyg";

const EditTestimonialPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [formData, setFormData] = useState({
    name_ar: "",
    name_en: "",
    content_ar: "",
    content_en: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Fetch testimonial data
  const { data: testimonial, isLoading } = useQuery({
    queryKey: ["testimonial", id],
    queryFn: () => getTestemonialById(id),
    enabled: !!id,
  });

  // Update form data when testimonial is loaded
  useEffect(() => {
    if (testimonial) {
      setFormData({
        name_ar: testimonial.name_ar || "",
        name_en: testimonial.name_en || "",
        content_ar: testimonial.message_ar || "",
        content_en: testimonial.message_en || "",
        image: testimonial.image || "",
      });
      if (testimonial.image) {
        setImagePreview(testimonial.image);
      }
    }
  }, [testimonial]);

  const { mutate, isPending } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Testimonial> }) =>
      updateTestemonial(id, data),
    onSuccess: () => {
      toast.success("تم تحديث التوصية بنجاح");
      queryClient.invalidateQueries({ queryKey: ["testimonial"] });
      router.push("/dashboard/testimonial");
    },
    onError: (err) => {
      toast.error("حدث خطأ أثناء تحديث التوصية");
      console.error(err);
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name_ar ||
      !formData.name_en ||
      !formData.content_ar ||
      !formData.content_en
    ) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = formData.image;

      if (imageFile) {
        imageUrl = await uploadTestimonialImage(imageFile);
      }

      const testimonialData = {
        name_ar: formData.name_ar,
        name_en: formData.name_en,
        message_ar: formData.content_ar,
        message_en: formData.content_en,
        image: imageUrl,
      };

      mutate({ id, data: testimonialData });
    } catch (error) {
      toast.error("حدث خطأ أثناء رفع الصورة");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6A4CFF]"></div>
      </div>
    );
  }

  return (
    <>
      <div className="mb-[25px] md:flex items-center justify-between">
        <h5 className="!mb-0">تعديل التوصية</h5>

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
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            <Link
              href="/dashboard/testimonial"
              className="inline-block relative ltr:pl-[22px] rtl:pr-[22px] transition-all hover:text-[#6A4CFF]"
            >
              التوصيات
            </Link>
          </li>
          <li className="breadcrumb-item inline-block relative text-sm mx-[11px] ltr:first:ml-0 rtl:first:mr-0 ltr:last:mr-0 rtl:last:ml-0">
            تعديل التوصية
          </li>
        </ol>
      </div>

      <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              صورة التوصية
            </label>
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-[#6A4CFF] rounded-md shadow-sm text-sm font-medium text-black dark:text-white bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6A4CFF]/20 transition-colors"
                >
                  <i className="material-symbols-outlined mr-2">upload</i>
                  اختر صورة جديدة
                </label>
              </div>
              {imagePreview && (
                <div className="relative">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="rounded-md object-cover border border-[#6A4CFF]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setImageFile(null);
                      setFormData((prev) => ({ ...prev, image: "" }));
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الاسم (عربي) *
              </label>
              <input
                type="text"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleInputChange}
                className="h-[55px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                placeholder="أدخل الاسم باللغة العربية"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                الاسم (إنجليزي) *
              </label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleInputChange}
                className="h-[55px] rounded-md text-black dark:text-white border border-[#6A4CFF] bg-white dark:bg-gray-900 px-[17px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-[#6A4CFF] focus:ring-2 focus:ring-[#6A4CFF]/20"
                placeholder="Enter name in English"
                required
              />
            </div>
          </div>

          {/* Message Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="sm:col-span-2 mb-[20px] sm:mb-0">
              <label className="mb-[10px] text-black dark:text-white font-medium block">
                التوصية (بالعربي) *
              </label>
              <EditorProvider>
                <Editor
                  value={formData.content_ar}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      content_ar: e.target.value,
                    }));
                  }}
                  style={{ minHeight: "200px" }}
                  className="rsw-editor"
                >
                  <Toolbar className="rsw-toolbar">
                    <BtnUndo />
                    <BtnRedo />
                    <Separator />
                    <BtnBold />
                    <BtnItalic />
                    <BtnUnderline />
                    <BtnStrikeThrough />
                    <Separator />
                    <BtnNumberedList />
                    <BtnBulletList />
                    <Separator />
                    <BtnLink />
                    <BtnClearFormatting />
                    <HtmlButton />
                    <Separator />
                    <BtnStyles />
                  </Toolbar>
                </Editor>
              </EditorProvider>
            </div>

            <div className="sm:col-span-2 mb-[20px] sm:mb-0">
              <label className="mb-[10px] text-black dark:text-white font-medium block">
                التوصية (بالانجليزي) *
              </label>
              <EditorProvider>
                <Editor
                  value={formData.content_en}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      content_en: e.target.value,
                    }));
                  }}
                  style={{ minHeight: "200px" }}
                  className="rsw-editor"
                >
                  <Toolbar className="rsw-toolbar">
                    <BtnUndo />
                    <BtnRedo />
                    <Separator />
                    <BtnBold />
                    <BtnItalic />
                    <BtnUnderline />
                    <BtnStrikeThrough />
                    <Separator />
                    <BtnNumberedList />
                    <BtnBulletList />
                    <Separator />
                    <BtnLink />
                    <BtnClearFormatting />
                    <HtmlButton />
                    <Separator />
                    <BtnStyles />
                  </Toolbar>
                </Editor>
              </EditorProvider>
            </div>
          </div>

          {/* Submit Button */}
          <div className="trezo-card bg-[#F7F7FB] dark:bg-[#1C1C1E] mb-[25px] p-[20px] md:p-[25px] rounded-md">
            <div className="trezo-card-content">
              <button
                type="button"
                onClick={() => router.push("/dashboard/testimonial")}
                className="font-medium inline-block transition-all rounded-md md:text-md ltr:mr-[15px] rtl:ml-[15px] py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-danger-500 text-white hover:bg-danger-400"
              >
                ألغاء
              </button>

              <button
                type="submit"
                disabled={isPending || isUploading}
                className="font-medium inline-block transition-all rounded-md md:text-md py-[10px] md:py-[12px] px-[20px] md:px-[22px] bg-[#6A4CFF] text-white hover:bg-[#5a3ce6] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="inline-block relative ltr:pl-[29px] rtl:pr-[29px]">
                  {isPending || isUploading ? (
                    <>
                      <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2 animate-spin">
                        sync
                      </i>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <i className="material-symbols-outlined ltr:left-0 rtl:right-0 absolute top-1/2 -translate-y-1/2">
                        save
                      </i>
                      حفظ التغييرات
                    </>
                  )}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditTestimonialPage;
