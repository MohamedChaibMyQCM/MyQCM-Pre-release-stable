import BaseUrl from "@/components/BaseUrl";
import secureLocalStorage from "react-secure-storage";

export const completeTrainingSession = async (sessionId) => {
  try {
    const token = secureLocalStorage.getItem("token");
    const response = await BaseUrl.get(
      `/training-session/${sessionId}/complete`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    return response.data
  } catch (error) {
    console.error("Error completing training session:", error);
    throw error;
  }
};
