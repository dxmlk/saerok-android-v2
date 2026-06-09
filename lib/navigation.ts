// Simple navigation helpers to open detail pages with an optional `from` origin
export function openSaerokDetail(router: any, collectionId: string | number, opts: { from?: string; replace?: boolean; extraParams?: Record<string, any> } = {}) {
  const params = { collectionId: String(collectionId), from: opts.from, ...(opts.extraParams ?? {}) };
  const route = { pathname: "/saerok/[collectionId]", params } as any;
  if (opts.replace) {
    router.replace(route);
    return;
  }
  router.push(route);
}

export function openDexDetail(router: any, birdId: string | number, opts: { from?: string; replace?: boolean; extraParams?: Record<string, any> } = {}) {
  const params = { birdId: String(birdId), from: opts.from, ...(opts.extraParams ?? {}) };
  const route = { pathname: "(tabs)/dex/[birdId]", params } as any;
  if (opts.replace) {
    router.replace(route);
    return;
  }
  router.push(route);
}
