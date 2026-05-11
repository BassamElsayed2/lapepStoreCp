import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { uploadImage } from "../../../../services/supabase";
import { createCategory } from "../../../../services/apiCategories";

export function useAddCategory() {
  const queryClient = useQueryClient();

  const { mutate: addCategory, isPending } = useMutation({
    mutationFn: async ({
      name_ar,
      name_en,
      image,
    }: {
      name_ar: string;
      name_en: string;
      image?: File;
    }) => {
      let image_url = undefined;

      if (image) {
        const { url, error: uploadError } = await uploadImage(
          "categories",
          "",
          image,
        );

        if (uploadError) throw new Error("فشل رفع الصورة");
        image_url = url || undefined;
      }

      await createCategory({ name_ar, name_en, image_url });
    },
    onSuccess: () => {
      toast.success("تمت إضافة التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("فشل في إضافة التصنيف: " + error.message);
    },
  });

  return { addCategory, isPending };
}
