import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { deleteImage, extractPathFromUrl } from "../../../../services/supabase";
import {
  deleteCategory as deleteCategoryAPI,
  getCategoryById,
} from "../../../../services/apiCategories";

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  const { mutate: deleteCategory, isPending } = useMutation({
    mutationFn: async (id: number) => {
      const category = await getCategoryById(id);

      if (category?.image_url) {
        try {
          const filePath = extractPathFromUrl(category.image_url);
          if (filePath) {
            await deleteImage("", filePath);
          }
        } catch (error) {
          console.error("Error deleting image:", error);
        }
      }

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
