import type { AxiosInstance } from "axios";
import type { HeaderMedia, HeaderMediaInput } from "./types";

function toFormData(input: HeaderMediaInput) {
  const formData = new FormData();
  if (input.file) formData.append("File", input.file);
  if (input.title) formData.append("Title", input.title);
  if (input.description) formData.append("Description", input.description);
  if (input.linkUrl) formData.append("LinkUrl", input.linkUrl);
  formData.append("IsActive", String(input.isActive));
  formData.append("DisplayOrder", String(input.displayOrder));
  return formData;
}

export async function getHeaderMedia(api: AxiosInstance, onlyActive: boolean) {
  const { data } = await api.get<HeaderMedia[]>(`/HeaderMedia?onlyActive=${onlyActive}`);
  return Array.isArray(data) ? data : [];
}

export async function createHeaderMedia(api: AxiosInstance, input: HeaderMediaInput) {
  const { data } = await api.post<HeaderMedia>("/HeaderMedia", toFormData(input));
  return data;
}

export async function updateHeaderMedia(api: AxiosInstance, id: number, input: HeaderMediaInput) {
  const { data } = await api.put<HeaderMedia>(`/HeaderMedia/${id}`, toFormData(input));
  return data;
}

export async function deleteHeaderMedia(api: AxiosInstance, id: number) {
  await api.delete(`/HeaderMedia/${id}`);
}
