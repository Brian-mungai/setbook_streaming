import crypto from 'crypto';

/**
 * Generates a signed embed URL for secure Bunny Stream playback.
 * 
 * @param videoId - The unique Bunny Stream Video GUID
 * @param expirationInSeconds - Link validity period (e.g., 14400 = 4 hours)
 */
export function generateSignedEmbedUrl(
  videoId: string,
  expirationInSeconds: number = 14400
): string {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID;
  const tokenKey = process.env.BUNNY_STREAM_TOKEN_KEY;
  const pullZone = process.env.BUNNY_STREAM_PULL_ZONE || 'iframe.mediadelivery.net';

  if (!libraryId || !tokenKey) {
    console.warn('Bunny Stream environment variables missing! Returning default embed URL.');
    return `https://${pullZone}/embed/${libraryId}/${videoId}`;
  }

  // Calculate UNIX expiration timestamp (in seconds)
  const expires = Math.floor(Date.now() / 1000) + expirationInSeconds;

  // Bunny Stream Token Hash Formula: SHA256(token_key + video_id + expires)
  const tokenString = `${tokenKey}${videoId}${expires}`;
  const token = crypto
    .createHash('sha256')
    .update(tokenString)
    .digest('hex');

  return `https://${pullZone}/embed/${libraryId}/${videoId}?token=${token}&expires=${expires}`;
}