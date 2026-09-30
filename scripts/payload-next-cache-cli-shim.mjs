// Payload CLI scripts run outside a Next.js request. Cache revalidation has no
// runtime effect there, and collection hooks already treat it as best-effort.
export function revalidatePath() {}
export function revalidateTag() {}
export function unstable_cache(callback) {
  return callback;
}
