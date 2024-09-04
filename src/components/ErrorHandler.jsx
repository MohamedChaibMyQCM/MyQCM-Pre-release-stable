import { toast } from "react-toastify";

const ErrorHandler = ({ error }) => {
  let errorMsg;

  if (typeof error.response.data.message == "array") {
    errorMsg = error.response.data.message[0];
  } else {
    errorMsg = error.response.data.message;
  }
  toast.error(errorMsg);
};

export default ErrorHandler;