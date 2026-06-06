import { searchSongsterr, mapSongsterrDifficulty } from "./songsterr";
import { prisma } from "./prisma";

export interface SongDifficultyResult {
  spotifyTrackId: string;
  trackName: string;
  artistName: string;
  instrumentId: string;
  instrumentName: string;
  difficulty: number;
  tabUrl: string | null;
  tabProvider: string | null;
  source: string;
}

/**
 * Get or compute difficulty for a track + instrument pair.
 * Checks cache first, falls back to Songsterr API, then heuristic.
 */
export async function getOrComputeDifficulty(
  spotifyTrackId: string,
  trackName: string,
  artistName: string,
  instrumentId: string,
  instrumentName: string
): Promise<SongDifficultyResult> {
  // Check cache
  const cached = await prisma.songDifficulty.findUnique({
    where: {
      spotifyTrackId_instrumentId: { spotifyTrackId, instrumentId },
    },
  });

  if (cached) {
    return {
      spotifyTrackId,
      trackName: cached.trackName,
      artistName: cached.artistName,
      instrumentId,
      instrumentName,
      difficulty: cached.difficulty,
      tabUrl: cached.tabUrl,
      tabProvider: cached.tabProvider,
      source: cached.source,
    };
  }

  // Try Songsterr
  try {
    const match = await searchSongsterr(artistName, trackName, instrumentName);

    if (match) {
      const difficulty = mapSongsterrDifficulty(match.instrumentDifficulty);

      await prisma.songDifficulty.create({
        data: {
          spotifyTrackId,
          trackName,
          artistName,
          instrumentId,
          difficulty,
          tabUrl: match.tabUrl,
          tabProvider: "songsterr",
          source: "songsterr_api",
        },
      });

      return {
        spotifyTrackId,
        trackName,
        artistName,
        instrumentId,
        instrumentName,
        difficulty,
        tabUrl: match.tabUrl,
        tabProvider: "songsterr",
        source: "songsterr_api",
      };
    }
  } catch {
    // Songsterr API failed, fall through to heuristic
  }

  // Heuristic fallback
  const difficulty = heuristicDifficulty(instrumentName);

  await prisma.songDifficulty.create({
    data: {
      spotifyTrackId,
      trackName,
      artistName,
      instrumentId,
      difficulty,
      tabUrl: null,
      tabProvider: null,
      source: "heuristic",
    },
  });

  return {
    spotifyTrackId,
    trackName,
    artistName,
    instrumentId,
    instrumentName,
    difficulty,
    tabUrl: null,
    tabProvider: null,
    source: "heuristic",
  };
}

/**
 * Simple heuristic when no external data is available.
 * Returns a middle-ground difficulty since we can't determine much
 * without audio features or tab data.
 */
function heuristicDifficulty(instrumentName: string): number {
  // Default to medium difficulty - without tab data we can't know
  switch (instrumentName) {
    case "drums":
      return 5;
    case "bass":
      return 4;
    case "ukulele":
      return 3;
    case "guitar":
      return 5;
    case "piano":
      return 5;
    default:
      return 5;
  }
}
