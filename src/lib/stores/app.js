import { writable } from 'svelte/store';

export const deals = writable([]);
export const questionsUsed = writable(0);
export const toast = writable(null);
export const confettiActive = writable(false);
export const activeTab = writable('tracker');

let toastTimer;
export function showToast(msg) {
  toast.set(msg);
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.set(null), 3200);
}

export function fireConfetti() {
  confettiActive.set(true);
  setTimeout(() => confettiActive.set(false), 4000);
}
