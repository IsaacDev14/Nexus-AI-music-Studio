const AUDD_API_KEY = import.meta.env.VITE_AUDD_API_KEY;
const AUDD_API_URL = "https://api.audd.io/";

export interface AuddSong {
  title: string;
  artist: string;
  album?: string;
  release_date?: string;
  label?: string;
  spotify?: { id: string };
  apple_music?: { id: string };
}

export interface AuddResponse {
  status: string;
  result: AuddSong | null;
}

export const recognizeSong = async (audioBlob: Blob): Promise<AuddSong | null> => {
  const formData = new FormData();
  formData.append("file", audioBlob, "recording.webm");
  formData.append("return", "apple_music,spotify");
  formData.append("api_token", AUDD_API_KEY);

  try {
    const response = await fetch(AUDD_API_URL, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`AudD API error: ${response.status}`);
    }

    const data: AuddResponse = await response.json();

    return data.status === "success" ? data.result : null;
  } catch (error) {
    console.error("Song recognition failed:", error);
    return null;
  }
};
