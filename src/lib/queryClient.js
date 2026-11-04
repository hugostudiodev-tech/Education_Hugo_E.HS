import { QueryClient, dehydrate, hydrate } from "@tanstack/react-query";
import { readCache, writeCache } from "./offlineCache";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      // Giữ đủ lâu để bản lưu trên máy còn dùng được khi mở lại app.
      gcTime: 7 * 86_400_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (typeof error?.retryable === "boolean") return error.retryable && failureCount < 2;
        const status = Number(error?.status || 0);
        if (status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
    },
    mutations: {
      retry: false,
    },
  },
});

// Danh mục + nội dung bài học: lưu xuống máy, mở app là có ngay (kể cả offline), rồi tải mới nền.
const KEY = "queries:v1";
const persisted = (query) => query.queryKey[0] === "coder-lessons" && query.state.status === "success";
// Bản lưu hỏng / chưa có (lần đầu mở, sau đăng xuất) thì bỏ qua — không bao giờ được làm trắng màn.
try {
  const saved = readCache(KEY);
  if (saved && Array.isArray(saved.queries)) hydrate(queryClient, { mutations: [], ...saved });
} catch { writeCache(KEY, null); }
let timer;
queryClient.getQueryCache().subscribe(() => {
  clearTimeout(timer);
  // ponytail: ghi lại toàn bộ sau 1 giây yên — vài trăm KB, đủ nhanh; quá 5MB thì writeCache tự bỏ qua.
  timer = setTimeout(() => writeCache(KEY, dehydrate(queryClient, { shouldDehydrateQuery: persisted })), 1000);
});
