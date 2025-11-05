import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import supabase from "../../../../services/supabase";
import { deleteCategory as deleteCategoryAPI, getCategoryById } from "../../../../services/apiCategories";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  const { mutate: deleteCategory, isPending } = useMutation({
    mutationFn: async (id: number) => {
      // 1. جلب التصنيف من Backend API للحصول على URL الصورة
      const category = await getCategoryById(id);

      // 2. حذف الصورة من Supabase (cat-img bucket) إذا كانت موجودة
      if (category?.image_url) {
        try {
          // Extract the file name from the URL
          const imageUrl = new URL(category.image_url);
          const fileName = imageUrl.pathname.split("/").pop();

          if (fileName) {
            const { error: deleteImageError } = await supabase.storage
              .from("cat-img")
              .remove([fileName]);

            if (deleteImageError) {
              console.error("Error deleting image:", deleteImageError);
              // Continue with category deletion even if image deletion fails
            }
          }
        } catch (error) {
          console.error("Error parsing image URL:", error);
          // Continue with category deletion
        }
      }

      // 3. حذف التصنيف من Backend API (SQL Server)
      await deleteCategoryAPI(id);
    },
    onSuccess: () => {
      toast.success("تم حذف التصنيف بنجاح");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (error) => {
      toast.error("فشل في حذف التصنيف: " + error.message);
    },
  });

  return { deleteCategory, isPending };
}
