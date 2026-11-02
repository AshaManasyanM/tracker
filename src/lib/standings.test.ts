import { describe, expect, it } from "vitest";
import type { Match, Team } from "../types/tournament";
import { compareStandings, computeStandings, type TeamStanding } from "./standings";

function team(id: string, name = id): Team {
  return { id, name };
}

function match(order: number, results: Match["results"], id = `m${order}`): Match {
  return { id, label: `Match ${order + 1}`, order, results };
}

function row(partial: Partial<TeamStanding> & Pick<TeamStanding, "team">): TeamStanding {
  return {
    rank: 0,
    totalPoints: 0,
    totalKills: 0,
    totalKillPoints: 0,
    totalPlacementPoints: 0,
    matchesPlayed: 1,
    bestPlacement: 1,
    chickenDinners: 0,
    lastMatchPlacement: 1,
    ...partial,
  };
}

function names(teams: Team[], matches: Match[]): string[] {
  return computeStandings(teams, matches).map((standing) => standing.team.name);
}

describe("computeStandings tie-breakers", () => {
  it("ranks the higher total points first, even with fewer chicken dinners", () => {
    const armed = team("armed", "Armed Family");
    const outlaw = team("outlaw", "OUTLAW");
    const ranked = names(
      [outlaw, armed],
      [
        match(0, {
          armed: { placement: 2, kills: 0 },
          outlaw: { placement: 1, kills: 20 },
        }),
      ],
    );
    expect(ranked).toEqual(["OUTLAW", "Armed Family"]);
  });

  it("breaks an equal points tie with WWCD before kills", () => {
    const armed = team("armed", "Armed Family");
    const outlaw = team("outlaw", "OUTLAW");
    // Armed: 1st (10) + 27 kills, then 4th (4) + 0 kills, then 4th (4) + 0 kills → 45 pts, 1 WWCD, 27 kills, 18 placement.
    // OUTLAW: 2nd (6) + 3rd (5) + 4th (4) + 7th (1) = 16 placement, 29 kills, 0 WWCD → 45 pts.
    const ranked = computeStandings(
      [outlaw, armed],
      [
        match(0, {
          armed: { placement: 1, kills: 27 },
          outlaw: { placement: 2, kills: 10 },
        }),
        match(1, {
          armed: { placement: 4, kills: 0 },
          outlaw: { placement: 3, kills: 10 },
        }),
        match(2, {
          armed: { placement: 4, kills: 0 },
          outlaw: { placement: 4, kills: 8 },
        }),
        match(3, {
          outlaw: { placement: 7, kills: 1 },
        }),
      ],
    );
    expect(ranked.map((standing) => standing.team.name)).toEqual(["Armed Family", "OUTLAW"]);
    expect(ranked[0]).toMatchObject({
      totalPoints: 45,
      chickenDinners: 1,
      totalKills: 27,
      totalKillPoints: 27,
      totalPlacementPoints: 18,
    });
    expect(ranked[1]).toMatchObject({
      totalPoints: 45,
      chickenDinners: 0,
      totalKills: 29,
      totalKillPoints: 29,
      totalPlacementPoints: 16,
    });
  });

  it("uses kill points when points and WWCD are equal", () => {
    const moreKills = team("kills", "More Kills");
    const morePlace = team("place", "More Place");
    const ranked = names(
      [morePlace, moreKills],
      [
        match(0, {
          place: { placement: 2, kills: 10 },
          kills: { placement: 3, kills: 11 },
        }),
      ],
    );
    expect(ranked).toEqual(["More Kills", "More Place"]);
  });

  it("uses placement points only after points, WWCD, and kill points are equal", () => {
    const morePlace = row({
      team: team("place", "More Place"),
      totalPoints: 30,
      chickenDinners: 1,
      totalKillPoints: 12,
      totalPlacementPoints: 18,
      lastMatchPlacement: 4,
    });
    const fewerPlace = row({
      team: team("kills", "Fewer Place"),
      totalPoints: 30,
      chickenDinners: 1,
      totalKillPoints: 12,
      totalPlacementPoints: 10,
      lastMatchPlacement: 2,
    });
    expect(compareStandings(morePlace, fewerPlace)).toBeLessThan(0);
    expect(compareStandings(fewerPlace, morePlace)).toBeGreaterThan(0);
  });

  it("uses the better last-match placement when every point total is equal", () => {
    const better = team("better", "Better Finish");
    const worse = team("worse", "Worse Finish");
    const ranked = names(
      [worse, better],
      [
        match(0, {
          better: { placement: 9, kills: 5 },
          worse: { placement: 9, kills: 5 },
        }),
        match(1, {
          better: { placement: 10, kills: 0 },
          worse: { placement: 12, kills: 0 },
        }),
      ],
    );
    expect(ranked).toEqual(["Better Finish", "Worse Finish"]);
  });

  it("reads the last scored match by order, not by list position", () => {
    const better = team("better", "Better Finish");
    const worse = team("worse", "Worse Finish");
    const ranked = names(
      [worse, better],
      [
        match(2, {
          better: { placement: 10, kills: 0 },
          worse: { placement: 14, kills: 0 },
        }),
        match(0, {
          better: { placement: 9, kills: 5 },
          worse: { placement: 9, kills: 5 },
        }),
      ],
    );
    expect(ranked).toEqual(["Better Finish", "Worse Finish"]);
  });

  it("gives the same rank when every tie-breaker matches", () => {
    const alpha = team("a", "Alpha");
    const beta = team("b", "Beta");
    const ranked = computeStandings(
      [alpha, beta],
      [match(0, { a: { placement: 3, kills: 4 }, b: { placement: 3, kills: 4 } })],
    );
    expect(ranked.map((standing) => standing.rank)).toEqual([1, 1]);
  });

  it("keeps unscored teams below teams that have results", () => {
    const played = team("played", "Played");
    const waiting = team("waiting", "Waiting");
    const ranked = names([waiting, played], [match(0, { played: { placement: 16, kills: 0 } })]);
    expect(ranked).toEqual(["Played", "Waiting"]);
  });
});
