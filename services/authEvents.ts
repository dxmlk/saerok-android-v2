type Listener = () => void;

let listeners: Listener[] = [];

export function onAuthExpired(listener: Listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function emitAuthExpired() {
  listeners.forEach((l) => l());
}
