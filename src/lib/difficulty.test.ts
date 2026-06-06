import { describe, it, expect } from "vitest";
import { getDifficultyLabel } from "./constants";
import { mapSongsterrDifficulty } from "./songsterr";

describe("getDifficultyLabel", () => {
  it("returns Easy for scores 1-3", () => {
    expect(getDifficultyLabel(1).label).toBe("Easy");
    expect(getDifficultyLabel(2).label).toBe("Easy");
    expect(getDifficultyLabel(3).label).toBe("Easy");
  });

  it("returns Medium for scores 4-6", () => {
    expect(getDifficultyLabel(4).label).toBe("Medium");
    expect(getDifficultyLabel(5).label).toBe("Medium");
    expect(getDifficultyLabel(6).label).toBe("Medium");
  });

  it("returns Hard for scores 7-10", () => {
    expect(getDifficultyLabel(7).label).toBe("Hard");
    expect(getDifficultyLabel(9).label).toBe("Hard");
    expect(getDifficultyLabel(10).label).toBe("Hard");
  });
});

describe("mapSongsterrDifficulty", () => {
  it("maps Songsterr difficulty strings to numeric scale", () => {
    expect(mapSongsterrDifficulty("novice")).toBe(2);
    expect(mapSongsterrDifficulty("beginner")).toBe(3);
    expect(mapSongsterrDifficulty("intermediate")).toBe(5);
    expect(mapSongsterrDifficulty("advanced")).toBe(7);
    expect(mapSongsterrDifficulty("expert")).toBe(9);
  });

  it("returns 5 for null or unknown difficulties", () => {
    expect(mapSongsterrDifficulty(null)).toBe(5);
    expect(mapSongsterrDifficulty("unknown")).toBe(5);
  });

  it("is case-insensitive", () => {
    expect(mapSongsterrDifficulty("NOVICE")).toBe(2);
    expect(mapSongsterrDifficulty("Beginner")).toBe(3);
  });
});
