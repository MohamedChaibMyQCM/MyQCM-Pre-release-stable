"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import PersonalSettings from "./PersonalSettings";
import UniversitySettings from "./UniversitySettings";

const Personal_Info = () => {
  const queryClient = useQueryClient();

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data?.data || {};
      } catch (err) {
        toast.error("Failed to fetch user data. Please try again later.");
      }
    },
  });

  const { data: userPro, refetch: refetchUserPro } = useQuery({
    queryKey: ["userPro"],
    queryFn: async () => {
      try {
        const token = secureLocalStorage.getItem("token");
        const response = await BaseUrl.get("/user/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return response.data?.data || {};
      } catch (err) {
        toast.error("Failed to fetch user data. Please try again later.");
      }
    },
  });

  const handleNameUpdate = async (newName) => {
    queryClient.setQueryData(['userPro'], (oldData) => ({
      ...oldData,
      name: newName
    }));
    queryClient.setQueryData(['userProfile'], (oldData) => ({
      ...oldData,
      name: newName
    }));
    
    await refetchUserPro();
  };

  if (isLoading) {
    return (
      <div className="mx-5">
        <Loading />
      </div>
    );
  }

  if (error) {
    return <div className="mx-5">Error loading user data</div>;
  }

  return (
    <div className="mx-5">
      <PersonalSettings 
        userData={userPro} 
        onNameUpdate={handleNameUpdate} 
      />
      <UniversitySettings userData={userData} />
    </div>
  );
};

export default Personal_Info;