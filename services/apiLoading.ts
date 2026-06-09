export type ApiLoadingState = {
  blocking: boolean;
  visible: boolean;
};

type Listener = (state: ApiLoadingState) => void;
type BeginApiRequestOptions = {
  showOverlay?: boolean;
};

let pendingCount = 0;
let visibleCount = 0;
const listeners = new Set<Listener>();

function emit() {
  const state = {
    blocking: pendingCount > 0,
    visible: visibleCount > 0,
  };
  listeners.forEach((listener) => listener(state));
}

export function beginApiRequest(options?: BeginApiRequestOptions) {
  const showOverlay = options?.showOverlay !== false;
  pendingCount += 1;
  if (showOverlay) visibleCount += 1;
  emit();

  let ended = false;
  return () => {
    if (ended) return;
    ended = true;
    pendingCount = Math.max(0, pendingCount - 1);
    if (showOverlay) visibleCount = Math.max(0, visibleCount - 1);
    emit();
  };
}

export async function trackApiRequest<T>(
  work: Promise<T> | (() => Promise<T>),
  options?: BeginApiRequestOptions,
) {
  const end = beginApiRequest(options);
  try {
    return await (typeof work === "function" ? work() : work);
  } finally {
    end();
  }
}

export function subscribeApiLoading(listener: Listener) {
  listeners.add(listener);
  listener({
    blocking: pendingCount > 0,
    visible: visibleCount > 0,
  });
  return () => {
    listeners.delete(listener);
  };
}

export function isApiLoading() {
  return pendingCount > 0;
}
