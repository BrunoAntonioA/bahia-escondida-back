export function matchesClientId(
  recordClientId: string | number,
  clientId: number,
): boolean {
  return String(recordClientId) === String(clientId);
}
