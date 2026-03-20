const BASE_URL = 'https://api.spotify.com/v1';

export const fetchUserLibrary = async (token, userId) => {
  if (!token) return [];

  try {
    const headers = { Authorization: `Bearer ${token}` };

    // 1. Fetch Playlists
    const plRes = await fetch(`${BASE_URL}/me/playlists?limit=15`, { headers });
    const plData = await plRes.json();
    
    // FILTER: Only keep playlists owned by the current user
    const userPlaylists = (plData.items || []).filter(p => p.owner?.id === userId);

    const playlists = userPlaylists.map(p => ({
      id: p.id,
      type: 'playlist',
      label: p.name,
      sub: `Playlist • ${p.owner?.display_name || 'You'}`, 
      imageUrl: p.images?.[0]?.url || null,
      circular: false,
      rawItem: p,
    }));

    // 2. Fetch Saved Albums
    const alRes = await fetch(`${BASE_URL}/me/albums?limit=15`, { headers });
    const alData = await alRes.json();
    const albums = (alData.items || []).map(a => ({
      id: a.album.id,
      type: 'album',
      label: a.album.name,
      sub: `Album • ${a.album.artists?.[0]?.name || 'Unknown'}`,
      imageUrl: a.album.images?.[0]?.url || null,
      circular: false,
      rawItem: a.album,
    }));

    // 3. Fetch Followed Artists
    const arRes = await fetch(`${BASE_URL}/me/following?type=artist&limit=15`, { headers });
    const arData = await arRes.json();
    const artists = (arData.artists?.items || []).map(ar => ({
      id: ar.id,
      type: 'artist',
      label: ar.name,
      sub: 'Artist',
      imageUrl: ar.images?.[0]?.url || null,
      circular: true, 
      rawItem: ar,
    }));

    // Combine them all into one unified library array
    return [...playlists, ...albums, ...artists];
  } catch (error) {
    console.error("Library Fetch Error:", error);
    return [];
  }
};

export const fetchAlbumTracks = async (token, albumId) => {
  try {
    const response = await fetch(`${BASE_URL}/albums/${albumId}/tracks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error("Error fetching album tracks:", error);
    return [];
  }
};

export const fetchArtistTopTracks = async (token, artistId) => {
  try {
    // Spotify requires a 'market' parameter for top-tracks. We'll default to 'US'.
    const response = await fetch(`${BASE_URL}/artists/${artistId}/top-tracks?market=US`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    
    // Notice it returns `data.tracks` instead of `data.items`
    return data.tracks || []; 
  } catch (error) {
    console.error("Error fetching artist top tracks:", error);
    return [];
  }
};