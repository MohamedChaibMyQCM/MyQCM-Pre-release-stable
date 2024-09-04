import { toast } from "react-toastify";

const handleError = (error) => {
  let errorMsg;

  if (Array.isArray(error.response?.data?.message)) {
    errorMsg = error.response.data.message[0];
  } else if (typeof error.response?.data?.message === "string") {
    errorMsg = error.response.data.message;
  } else {
    errorMsg = "An unexpected error occurred";
  }

  toast.error(errorMsg);
};

export default handleError;