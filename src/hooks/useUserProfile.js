import { useQuery } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";

export function useUserProfile() {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) return null;
      const response = await BaseUrl.get("/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
    enabled: !!secureLocalStorage.getItem("token"),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
}
