import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/api';
import type { PixelConfig, ButtonConfig, AppointmentSettings } from '@/types';

const ACADEMY_KEY = 'academy';
const PIXEL_KEY = 'pixel-config';
const BUTTON_KEY = 'button-config';
const BATCHES_KEY = 'batches';
const APPOINTMENT_SETTINGS_KEY = 'appointment-settings';

// Academy hooks
export const useAcademy = (id: string) => {
  return useQuery({
    queryKey: [ACADEMY_KEY, id],
    queryFn: () => api.getAcademy(id),
    enabled: !!id,
  });
};

export const useUpdateAcademy = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Parameters<typeof api.updateAcademy>[1] }) =>
      api.updateAcademy(id, updates),
    onSuccess: (data) => {
      queryClient.setQueryData([ACADEMY_KEY, data.id], data);
    },
  });
};

// Pixel hooks
export const usePixelConfig = (academyId: string) => {
  return useQuery({
    queryKey: [PIXEL_KEY, academyId],
    queryFn: () => api.getPixelConfig(academyId),
    enabled: !!academyId,
  });
};

export const useUpdatePixelConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ academyId, config }: { academyId: string; config: Partial<PixelConfig> }) =>
      api.updatePixelConfig(academyId, config),
    onSuccess: (data, variables) => {
      queryClient.setQueryData([PIXEL_KEY, variables.academyId], data);
    },
  });
};

export const usePixelEvents = (academyId: string, params: Parameters<typeof api.getPixelEvents>[1]) => {
  return useQuery({
    queryKey: [PIXEL_KEY, 'events', academyId, params],
    queryFn: () => api.getPixelEvents(academyId, params),
    enabled: !!academyId,
  });
};

export const usePixelAnalytics = (academyId: string, params: Parameters<typeof api.getPixelAnalytics>[1]) => {
  return useQuery({
    queryKey: [PIXEL_KEY, 'analytics', academyId, params],
    queryFn: () => api.getPixelAnalytics(academyId, params),
    enabled: !!academyId,
  });
};

export const useSendTestPixelEvent = () => {
  return useMutation({
    mutationFn: ({ academyId, event }: { academyId: string; event: Parameters<typeof api.sendTestPixelEvent>[1] }) =>
      api.sendTestPixelEvent(academyId, event),
  });
};

// Button hooks
export const useButtonConfig = (academyId: string) => {
  return useQuery({
    queryKey: [BUTTON_KEY, academyId],
    queryFn: () => api.getButtonConfig(academyId),
    enabled: !!academyId,
  });
};

export const useUpdateButtonConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ academyId, config }: { academyId: string; config: Partial<ButtonConfig> }) =>
      api.updateButtonConfig(academyId, config),
    onSuccess: (data, variables) => {
      queryClient.setQueryData([BUTTON_KEY, variables.academyId], data);
    },
  });
};

export const useButtonAnalytics = (academyId: string, params: Parameters<typeof api.getButtonAnalytics>[1]) => {
  return useQuery({
    queryKey: [BUTTON_KEY, 'analytics', academyId, params],
    queryFn: () => api.getButtonAnalytics(academyId, params),
    enabled: !!academyId,
  });
};

// Batches hooks
export const useBatches = (academyId: string, params?: { active?: boolean }) => {
  return useQuery({
    queryKey: [BATCHES_KEY, academyId, params],
    queryFn: () => api.getBatches(academyId, params),
    enabled: !!academyId,
  });
};

export const useUpdateBatch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ academyId, batchId, updates }: { academyId: string; batchId: string; updates: Parameters<typeof api.updateBatch>[2] }) =>
      api.updateBatch(academyId, batchId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [BATCHES_KEY, variables.academyId] });
    },
  });
};

// Appointment hooks
export const useAppointmentSettings = (academyId: string) => {
  return useQuery({
    queryKey: [APPOINTMENT_SETTINGS_KEY, academyId],
    queryFn: () => api.getAppointmentSettings(academyId),
    enabled: !!academyId,
  });
};

export const useUpdateAppointmentSettings = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ academyId, settings }: { academyId: string; settings: Partial<AppointmentSettings> }) =>
      api.updateAppointmentSettings(academyId, settings),
    onSuccess: (data, variables) => {
      queryClient.setQueryData([APPOINTMENT_SETTINGS_KEY, variables.academyId], data);
    },
  });
};

// Embed code hook
export const useEmbedCode = (academyId: string) => {
  return useQuery({
    queryKey: ['embed-code', academyId],
    queryFn: () => api.getEmbedCode(academyId),
    enabled: !!academyId,
  });
};