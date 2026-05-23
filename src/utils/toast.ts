import { toast } from 'sonner';

const DEFAULT_ERROR_DURATION_MS = 5000;
const DEFAULT_SUCCESS_DURATION_MS = 4000;
const DEFAULT_INFO_DURATION_MS = 4000;

export const showError = (message: string) => {
  toast.error(message, {
    duration: DEFAULT_ERROR_DURATION_MS,
  });
};

export const showSuccess = (message: string) => {
  toast.success(message, {
    duration: DEFAULT_SUCCESS_DURATION_MS,
  });
};

export const showInfo = (message: string) => {
  toast.info(message, {
    duration: DEFAULT_INFO_DURATION_MS,
  });
};
