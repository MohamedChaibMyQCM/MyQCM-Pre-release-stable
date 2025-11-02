"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import secureLocalStorage from "react-secure-storage";
import BaseUrl from "@/components/BaseUrl";
import Loading from "@/components/Loading";
import toast from "react-hot-toast";
import PersonalSettings from "./PersonalSettings";
import UniversitySettings from "./UniversitySettings";
import { motion } from "framer-motion";

const Personal_Info = () => {
  const queryClient = useQueryClient();
  const [authToken, setAuthToken] = useState(null);
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const storedToken = secureLocalStorage.getItem("token");
    if (typeof storedToken === "string" && storedToken.length > 0) {
      setAuthToken(storedToken);
    }
    setTokenReady(true);
  }, []);

  const { data: userData, isLoading, error } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      try {
        const response = await BaseUrl.get("/user/profile", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        return response.data?.data || {};
      } catch (err) {
        toast.error("Failed to fetch user data. Please try again later.");
        throw err;
      }
    },
    enabled: !!authToken,
    retry: false,
  });

  const { data: userPro, refetch: refetchUserPro } = useQuery({
    queryKey: ["userPro"],
    queryFn: async () => {
      try {
        const response = await BaseUrl.get("/user/me", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        return response.data?.data || {};
      } catch (err) {
        toast.error("Failed to fetch user data. Please try again later.");
        throw err;
      }
    },
    enabled: !!authToken,
    retry: false,
  });

  const handleNameUpdate = async (newName) => {
    queryClient.setQueryData(["userPro"], (oldData) => ({
      ...(oldData || {}),
      name: newName,
    }));
    queryClient.setQueryData(["userProfile"], (oldData) => ({
      ...(oldData || {}),
      name: newName,
    }));

    await refetchUserPro();
  };

  if (!tokenReady) {
    return (
      <div className="mx-5">
        <Loading />
      </div>
    );
  }

  if (!authToken) {
    return <div className="mx-5">Veuillez vous reconnecter pour voir vos paramètres.</div>;
  }

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <PersonalSettings
          userData={userPro}
          onNameUpdate={handleNameUpdate}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <UniversitySettings userData={userData} />
      </motion.div>
    </div>
  );
};

export default Personal_Info;
