import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const getFileAsDataURL = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result); 
      } else {
        reject("Failed to read file.");
      }
    };

    reader.onerror = () => {
      reject("File reading failed.");
    };

    reader.readAsDataURL(file); 
  });
};
