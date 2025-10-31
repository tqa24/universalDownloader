const axios = require("axios");

/**
 * Fetch file info and download URL from Terabox.
 * Accepts both full URLs and short codes.
 * @param {string} inputUrl - Full Terabox URL or short code.
 * @returns {Promise<Object>} - Returns { filename, size, downloadUrl }
 */
async function fetchTeraBox(inputUrl) {
  try {
    const shortUrl = extractShortUrl(inputUrl);
    if (!shortUrl) throw new Error("Invalid Terabox URL or short code.");

    const infoRes = await axios.get(
      `https://terabox.hnn.workers.dev/api/get-info-new?shorturl=${encodeURIComponent(shortUrl)}`,
      {
        headers: getHeaders(),
        maxBodyLength: Infinity,
      }
    );

    const info = infoRes.data;
    if (!info.ok || !info.list?.length) {
      throw new Error("Failed to retrieve file info from Terabox.");
    }

    const file = info.list[0];

    const payload = {
      shareid: info.shareid,
      uk: info.uk,
      sign: info.sign,
      timestamp: info.timestamp,
      fs_id: file.fs_id,
    };

    const downloadRes = await axios.post(
      "https://terabox.hnn.workers.dev/api/get-download",
      JSON.stringify(payload),
      {
        headers: {
          ...getHeaders(),
          "content-type": "application/json",
          origin: "https://terabox.hnn.workers.dev",
        },
        maxBodyLength: Infinity,
      }
    );

    return downloadRes.data;
  } catch (error) {
    throw new Error(`Terabox API request failed: ${error.message}`);
  }
}

/**
 * Extract shorturl from full Terabox link or return if short code provided.
 * @param {string} input
 * @returns {string|null}
 */
function extractShortUrl(input) {
  try {
    if (/^[A-Za-z0-9_-]+$/.test(input)) return input;
    const match = input.match(/(?:\/s\/|shorturl=)([A-Za-z0-9_-]+)/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * These are the common headers used in all API requests.
 * I've created this function to make it easier to modify headers in one place UwU.
 */
function getHeaders() {
  return {
    accept: "*/*",
    "accept-language": "en-US,en;q=0.5",
    dnt: "1",
    priority: "u=1, i",
    referer: "https://terabox.hnn.workers.dev/",
    "sec-ch-ua": '"Chromium";v="142", "Brave";v="142", "Not_A Brand";v="99"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "sec-gpc": "1",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  };
}

module.exports = { fetchTeraBox };
