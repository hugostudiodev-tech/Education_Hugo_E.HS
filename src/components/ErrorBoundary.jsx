import React from 'react';
import { reportIncident } from '../lib/incident';
import StatusScreen from './system/StatusScreen';

const CHUNK_ERROR_PATTERN = /failed to fetch dynamically imported module|importing a module script failed|error loading dynamically imported module|unable to preload css|loading (css )?chunk|is not a valid javascript mime type|expected a javascript.*module script/i;
const RELOAD_FLAG = 'chunk_reload_attempted';
// componentDidMount can't clear the guard: the boundary mounts (Suspense
// fallback) before the lazy chunk fails, so a cleared flag meant reload loops.
const RELOAD_COOLDOWN_MS = 60_000;
const HARD_RESET_FLAG = 'chunk_hard_reset_attempted';

/**
 * Tải lại thường không cứu được khi chính service worker hay bộ nhớ đệm giữ
 * index.html cũ: trang tải lại vẫn trỏ vào file JS đã bị thay sau deploy, và
 * Safari báo "Importing a module script failed" lần nữa. Lần thứ hai thì gỡ
 * service worker, xoá cache rồi mới tải lại — một lần mỗi phiên.
 */
async function hardResetAndReload() {
  try {
    const registrations = await navigator.serviceWorker?.getRegistrations?.() || [];
    await Promise.all(registrations.map((registration) => registration.unregister()));
  } catch { /* ignore */ }
  try {
    const keys = await window.caches?.keys?.() || [];
    await Promise.all(keys.map((key) => window.caches.delete(key)));
  } catch { /* ignore */ }
  window.location.reload();
}

export function isChunkLoadError(error) {
  return CHUNK_ERROR_PATTERN.test(error?.message || '');
}

/** Tải lại sang bản mới: lần 1 tải lại thường, lần 2 xoá service worker + cache. Hết lượt → false. */
export function tryChunkReload() {
  let last = 0;
  try { last = Number(sessionStorage.getItem(RELOAD_FLAG) || 0); } catch { /* ignore */ }
  if (Date.now() - last > RELOAD_COOLDOWN_MS) {
    try { sessionStorage.setItem(RELOAD_FLAG, String(Date.now())); } catch { /* ignore */ }
    window.location.reload();
    return true;
  }
  let hardResetDone = true;
  try { hardResetDone = sessionStorage.getItem(HARD_RESET_FLAG) === '1'; } catch { /* ignore */ }
  if (hardResetDone) return false;
  try { sessionStorage.setItem(HARD_RESET_FLAG, '1'); } catch { /* ignore */ }
  hardResetAndReload();
  return true;
}

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, autoReloading: false, componentStack: '', code: '', at: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Ở dev thì giữ lại để in THẲNG ra màn hình: chuỗi frame của react-dom
    // trong console không cho biết component nào ném lỗi, còn componentStack
    // thì có — dán một ảnh chụp màn hình là đủ để chẩn đoán.
    if (import.meta.env.DEV) this.setState({ componentStack: errorInfo?.componentStack || '' });

    // A new deploy replaced the hashed JS chunk files, but this tab is still
    // running an older index.html that references the old filenames. A single
    // hard reload fetches the current index.html + matching chunks. Guarded
    // by a timestamp so a genuinely broken deploy doesn't reload forever — and
    // only that case is worth reporting; a stale tab after deploy is expected.
    // Hết lượt tự tải lại thì vẫn KHÔNG phải sự cố: hiện "Đã có phiên bản mới" + nút cập nhật.
    if (isChunkLoadError(error)) {
      this.setState(tryChunkReload() ? { autoReloading: true } : { updateReady: true });
      return;
    }

    // Mã HG-XXXXXX: người dùng thấy trên màn lỗi, admin thấy cùng mã trong
    // Telegram và ErrorLog ("Giám sát hệ thống" → ô tìm).
    const code = reportIncident({
      type: 'react-error-boundary',
      name: error?.name || 'ReactError',
      message: error?.message,
      stack: `${error?.stack || ''}\n${errorInfo?.componentStack || ''}`,
    });
    // Tên component gần nhất trong componentStack = "ở đâu" đọc được bằng mắt.
    const where = (errorInfo?.componentStack || '').match(/at (\w+)/)?.[1] || '';
    this.setState({ code, where, at: new Date().toLocaleString() });
  }

  render() {
    if (this.state.hasError) {
      if (this.state.autoReloading) return <StatusScreen kind="updating" />;
      if (this.state.updateReady) return <StatusScreen kind="updated" onRetry={hardResetAndReload} />;
      const { error, code, where, at, componentStack } = this.state;
      return (
        <>
          <StatusScreen
            kind="crash"
            code={code}
            detail={import.meta.env.DEV ? { what: `${error?.name || 'Error'}: ${error?.message || ''}`, where: [window.location.pathname, where].filter(Boolean).join(' · '), when: at } : undefined}
          />
          {import.meta.env.DEV && componentStack && (
            <pre className="fixed bottom-2 left-2 right-2 max-h-48 overflow-auto rounded-xl bg-muted p-3 text-left text-[11px] leading-relaxed text-muted-foreground">
              {componentStack.trim().split('\n').slice(0, 8).join('\n')}
            </pre>
          )}
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
