import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import supabase from "../../../../services/supabase";
import { updateCategory as updateCategoryAPI } from "../../../../services/apiCategories";

interface UpdateCategoryPayload {
  id: number;
  name_ar: string;
  name_en: string;
  image?: File;
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  const { mutate: updateCategory, isPending } = useMutation({
    mutationFn: async ({
      id,
      name_ar,
      name_en,
      image,
    }: UpdateCategoryPayload) => {
      let image_url = undefined;

      // 1. رفع الصورة على Supabase (cat-img bucket) إذا كانت موجودة
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("cat-img")
          .upload(fileName, image);

        if (uploadError) throw new Error(uploadError.message);

        const {
          data: { publicUrl },
        } = supabase.storage.from("cat-img").getPublicUrl(fileName);

        image_url = publicUrl;
      }

      // 2. تحديث البيانات عبر Backend API (SQL Server)
      const updateData: { name_ar: string; name_en: string; image_url?: string } = { name_ar, name_en };
      if (image_url) {
        updateData.image_url = image_url;
      }
      
      await updateCategoryAPI(id, updateData);
    },
    onSuccess: () => {
      toast.success("تم تحديث التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("فشل في تحديث التصنيف: " + error.message);
    },
  });

  return { updateCategory, isPending };
}
