import { useQuery } from "@tanstack/react-query";
import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";

export function useUserSubscription() {
  return useQuery({
    queryKey: ["userSubscription"],
    queryFn: async () => {
      const token = secureLocalStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await BaseUrl.get("/user/subscription/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data.data;
    },
    enabled: !!secureLocalStorage.getItem("token"),
    staleTime: 1000 * 60 * 5, 
    refetchOnWindowFocus: true,
    retry: 1,
  });
}
