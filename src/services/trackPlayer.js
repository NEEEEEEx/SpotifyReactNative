// services/trackPlayer.js

export const getYoutubeId = async (trackName, artistName) => {
  try {
    const query = encodeURIComponent(`${trackName} ${artistName} official audio`);
    const url = `https://www.youtube.com/results?search_query=${query}`;
    
    // Fetch the raw HTML of the YouTube search page
    const response = await fetch(url);
    const html = await response.text();

    // YouTube hides the search results inside a massive JSON object called ytInitialData.
    // We use a regex to extract that JSON block from the HTML.
    const regex = /var ytInitialData = (.*?);<\/script>/;
    const match = html.match(regex);

    if (match && match[1]) {
      const ytData = JSON.parse(match[1]);
      
      // Navigate YouTube's messy JSON tree to find the first video ID
      const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;
      const videoContents = contents?.[0]?.itemSectionRenderer?.contents;

      if (videoContents) {
        for (let item of videoContents) {
          // Find the first actual video (ignoring playlists or ads)
          if (item.videoRenderer && item.videoRenderer.videoId) {
            return item.videoRenderer.videoId;
          }
        }
      }
    }
    
    console.log("Could not find a valid video ID in the HTML.");
    return null;

  } catch (error) {
    console.error("Native Scraper Error:", error);
    return null;
  }
};