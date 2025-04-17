import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Define toast options
const toastOptions = {
  position: "bottom-right",
  autoClose: 5000,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

// Function to show toast messages
export const showToast = (message, type = "success") => {
  if (type === "success") {
    toast.success(message, toastOptions);
  } else if (type === "error") {
    toast.error(message, toastOptions);
  } else if (type === "info") {
    toast.info(message, toastOptions);
  } else if (type === "warning") {
    toast.warn(message, toastOptions);
  }
};
