import { toast } from 'sonner';

export const showError = (message: string) => {
  toast.error(message, {
    duration: 5000,
  });
};

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: 3000,
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    duration: 4000,
  });
};
