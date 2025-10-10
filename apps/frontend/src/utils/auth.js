import axios from "axios";
import secureLocalStorage from "react-secure-storage";

export const refreshToken = async () => {
  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/user/refresh`,
      {
        withCredentials: true,
        headers: {
          Accept: "application/json",
        },
      }
    );

    const newToken = response.data.token;

    if (newToken) {
      secureLocalStorage.setItem("token", newToken);
      return newToken;
    } else {
      throw new Error("No token received from refresh");
    }
  } catch (error) {
    console.error("Manual token refresh failed:", error);
    secureLocalStorage.removeItem("token");

    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }

    throw error;
  }
};

export const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const checkAuthAndRedirect = async (router) => {
  if (typeof window === "undefined") return false;

  const token = secureLocalStorage.getItem("token");
  if (!token) return false;

  if (isTokenExpired(token)) {
    secureLocalStorage.removeItem("token");
    return false;
  }

  try {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/user/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        withCredentials: true,
      }
    );

    if (response.data) {
      const userData = response.data.data;

      if (!userData.email_verified) {
        router.push("/signup/verification");
        return true;
      }

      // Check profile completion using /user/profile endpoint
      try {
        const profileResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
            withCredentials: true,
          }
        );

        const profileData = profileResponse.data.data;

        // Check if profile is complete - all required fields must exist
        if (
          !profileData ||
          !profileData.university?.id ||
          !profileData.study_field ||
          !profileData.year_of_study ||
          !profileData.unit?.id ||
          !profileData.mode?.id
        ) {
          router.push("/signup/set-profile");
          return true;
        }
      } catch (profileError) {
        // If profile endpoint fails or returns 404, profile needs to be set
        console.error("Error fetching profile:", profileError);
        if (profileError.response?.status === 404) {
          // Profile doesn't exist, redirect to setup
          router.push("/signup/set-profile");
          return true;
        }
        // For other errors, still redirect to setup to be safe
        router.push("/signup/set-profile");
        return true;
      }

      if (!userData.completed_introduction) {
        router.push("/onboarding");
        return true;
      }

      router.push("/dashboard");
      return true;
    }
  } catch (error) {
    secureLocalStorage.removeItem("token");
    return false;
  }

  return false;
};
