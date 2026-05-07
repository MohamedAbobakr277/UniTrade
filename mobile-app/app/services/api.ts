import { auth } from "./firebase";

const BACKEND_URL = "https://unitrade-backend-five.vercel.app";

async function getAuthToken(): Promise<string | null> {
  try {
    return auth.currentUser ? await auth.currentUser.getIdToken() : null;
  } catch {
    return null;
  }
}

export async function apiRequest(endpoint: string, method: "GET" | "POST" | "PATCH" = "GET", body?: any, isFile: boolean = false) {
  const token = await getAuthToken();
  const headers: any = {
    Authorization: token ? `Bearer ${token}` : "",
  };

  if (!isFile) {
    headers["Content-Type"] = "application/json";
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = isFile ? body : JSON.stringify(body);
  }

  const response = await fetch(`${BACKEND_URL}${endpoint}`, options);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `Server error ${response.status}`);
  }

  return await response.json();
}

export const uploadImage = async (uri: string) => {
  const formData = new FormData();
  formData.append("file", { uri, type: "image/jpeg", name: "upload.jpg" } as any);
  return await apiRequest("/upload", "POST", formData, true);
};

export const generateAI = async (prompt: string, imageUrl?: string) => {
  return await apiRequest("/generate", "POST", { prompt, imageUrl });
};

export const getRecommendations = async (prompt: string) => {
  return await apiRequest("/recommend", "POST", { prompt });
};

export const createProduct = async (productData: any) => {
  return await apiRequest("/products", "POST", productData);
};

export const updateProduct = async (id: string, updateData: any) => {
  return await apiRequest(`/products/${id}`, "PATCH", updateData);
};

export const updateProfile = async (updateData: any) => {
  return await apiRequest("/profile", "POST", updateData);
};

export const toggleFavorite = async (productId: string, action: "add" | "remove") => {
  return await apiRequest("/favorites", "POST", { productId, action });
};

export const sendNotification = async (targetUserId: string, type: string, message: string, link?: string) => {
  return await apiRequest("/notifications", "POST", { targetUserId, type, message, link });
};
