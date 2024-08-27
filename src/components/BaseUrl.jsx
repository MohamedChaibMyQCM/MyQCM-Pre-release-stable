import axios from "axios";

const BaseUrl = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
  headers: {
    Accept: "application/json", 
  },
});

export default BaseUrl;
