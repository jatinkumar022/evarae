import { toast } from 'sonner';

export const toastApi = {
  success: (title: string, description?: string) =>
    toast.success(title, { description }),
  error: (title: string, description?: string) =>
    toast.error(title, { description }),
  info: (title: string, description?: string) =>
    toast.message(title, { description }),
  warning: (title: string, description?: string) =>
    toast.warning(title, { description, duration: 6000 }),
  promise: <T>(
    p: Promise<T>,
    msgs: { loading: string; success: string; error: string }
  ) =>
    toast.promise(p, {
      loading: msgs.loading,
      success: msgs.success,
      error: msgs.error,
    }),
};

export default toastApi;
