import axios from "axios";

const BaseUrl = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
  headers: {
    Accept: "application/json",
  },
});

export default BaseUrl