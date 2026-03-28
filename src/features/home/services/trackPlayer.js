const RAPID_API_KEY = '9b7a9f4e70msh5daae8532c79b23p1e2474jsn89811fbd60d5'; // Replace this!
const RAPID_API_HOST = 'yt-all-stream-data.p.rapidapi.com';

const commonHeaders = {
  'Content-Type': 'application/json',
  'x-rapidapi-key': RAPID_API_KEY,
  'x-rapidapi-host': RAPID_API_HOST,
};

/**
 * Main wrapper function used by the UI component
 */
export const getAdFreeStreamUrl = async (trackName, artistName) => {
  try {
    // Step 1: Search for the video ID
    const videoId = await getYoutubeId(trackName, artistName);
    if (!videoId) {
      console.warn("No video ID found for the track.");
      return null;
    }

    // Step 2: Get the MP3 streaming link
    const dlRes = await fetch(`https://${RAPID_API_HOST}/mp3dl`, {
      method: 'POST',
      headers: commonHeaders,
      body: JSON.stringify({ id: videoId }),
    });
    const dlData = await dlRes.json();

    return dlData.status === "ok" ? dlData.download : null;
  } catch (error) {
    console.error("Stream Fetch Error:", error);
    return null;
  }
};

// Inside getYoutubeId (Only works reliably on a server)
const getYoutubeId = async (trackName, artistName) => {
  try {
    const query = encodeURIComponent(`${trackName} ${artistName}-song lyrics`);
    console.log("DEBUG: Searching YouTube for:", query);
    const url = `https://www.youtube.com/results?search_query=${query}&sp=EgIQAQ%253D%253D`;
    // Add a User-Agent to look more like a real browser
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const html = await response.text();
    
    // Look for the JSON string more broadly
    const startTag = 'var ytInitialData = ';
    const endTag = ';</script>';
    if (html.includes(startTag)) {
      const startIndex = html.indexOf(startTag) + startTag.length;
      const endIndex = html.indexOf(endTag, startIndex);
      const jsonStr = html.substring(startIndex, endIndex);
      const ytData = JSON.parse(jsonStr);
      
      // Optional Chaining is your friend here
      const videoId = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents
        ?.find(x => x.videoRenderer)?.videoRenderer?.videoId;

      return videoId || null;
    }
    return null;
  } catch (error) {
    console.error("Scraper Error:", error);
    return null;
  }
};