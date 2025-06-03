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
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;
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
      router.push("/dashboard");
      return true;
    }
  } catch (error) {
    secureLocalStorage.removeItem("token");
    return false;
  }

  return false;
};
