import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock external dependencies
vi.mock('react-native', () => ({
  Alert: {
    alert: vi.fn(),
  },
}));

vi.mock('expo-router', () => ({
  router: {
    push: vi.fn(),
  },
}));

vi.mock('@/utils/teamUtils', () => ({
  isUserOnTeam: vi.fn(),
}));

vi.mock('@/utils/scoreboardUtils', () => ({
  calculateStatisticsForTeam: vi.fn(),
}));

// Mock global fetch
global.fetch = vi.fn();

import { saveGameResults, saveTieBreakerResults } from './src/app/gameResultsHandler.js';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { isUserOnTeam } from '@/utils/teamUtils';
import { calculateStatisticsForTeam } from '@/utils/scoreboardUtils';

// Helper: build standard params for saveGameResults
function makeBaseParams(overrides = {}) {
  return {
    gameId: 'game-1',
    team1Total: 7,
    team2Total: 5,
    team1Color: 'red',
    team2Color: 'yellow',
    team1Id: 'team-1',
    team2Id: 'team-2',
    team1Scores: [2, 1, 0, 3, 1],
    team2Scores: [0, 1, 2, 0, 2],
    totalEnds: 5,
    startingHammer: 1,
    playerSetup: [],
    myTeamId: 'team-1',
    team1Name: 'Eagles',
    team2Name: 'Hawks',
    setError: vi.fn(),
    ...overrides,
  };
}

// Set up default successful fetch mock
function setupSuccessfulFetch() {
  fetch.mockImplementation((url, opts) => {
    if (url.includes('/api/games') && (!opts || opts.method !== 'PUT')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ club_id: 'club-1', sheet_number: 1, scheduled_time: '2024-01-15T10:00:00Z' }),
      });
    }
    if (url.includes('/api/games') && opts?.method === 'PUT') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    if (url.includes('/api/teams')) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ members: [{ id: 'p1' }] }),
      });
    }
    if (url.includes('/api/game-stats')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    if (url.includes('/api/stone-notes')) {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

describe('saveGameResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulFetch();
    isUserOnTeam.mockReturnValue(true);
    calculateStatisticsForTeam.mockReturnValue(null);
  });

  test('should clear error state at the beginning', async () => {
    const params = makeBaseParams();
    await saveGameResults(params);
    expect(params.setError).toHaveBeenCalledWith(null);
  });

  test('should fetch game details and update game scores', async () => {
    await saveGameResults(makeBaseParams());

    // Should have called fetch for game details
    const gameDetailsCalls = fetch.mock.calls.filter(
      ([url]) => url.includes('/api/games?id=game-1'),
    );
    expect(gameDetailsCalls.length).toBeGreaterThanOrEqual(1);

    // Should have PUT to update scores
    const putCalls = fetch.mock.calls.filter(
      ([, opts]) => opts?.method === 'PUT',
    );
    expect(putCalls.length).toBe(1);
    const putBody = JSON.parse(putCalls[0][1].body);
    expect(putBody.team1_score).toBe(7);
    expect(putBody.team2_score).toBe(5);
    expect(putBody.win_method).toBeNull();
  });

  test('should fetch team data for both teams and calculate stats', async () => {
    calculateStatisticsForTeam.mockReturnValue({ totalScore: 7, won: true });

    await saveGameResults(makeBaseParams());

    const teamCalls = fetch.mock.calls.filter(([url]) => url.includes('/api/teams'));
    expect(teamCalls.length).toBe(2);
    expect(calculateStatisticsForTeam).toHaveBeenCalledTimes(2);
  });

  test('should post stats to /api/game-stats when stats are computed', async () => {
    calculateStatisticsForTeam.mockReturnValue({ totalScore: 7, won: true });

    await saveGameResults(makeBaseParams());

    const statsCalls = fetch.mock.calls.filter(([url]) => url.includes('/api/game-stats'));
    expect(statsCalls.length).toBe(2);

    const statsBody = JSON.parse(statsCalls[0][1].body);
    expect(statsBody.basicOnly).toBe(false);
    expect(statsBody.rockColor).toBeDefined();
  });

  test('should show alert with winner name and scores on success', async () => {
    await saveGameResults(makeBaseParams({ team1Total: 7, team2Total: 5, team1Name: 'Eagles', team2Name: 'Hawks' }));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Game Complete!',
      expect.stringContaining('Eagles wins 7-5'),
      expect.any(Array),
    );
  });

  test('should show team2 as winner when team2 score is higher', async () => {
    await saveGameResults(makeBaseParams({ team1Total: 3, team2Total: 8 }));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Game Complete!',
      expect.stringContaining('Hawks wins 8-3'),
      expect.any(Array),
    );
  });

  test('should set error message when fetch for game details fails', async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false }),
    );

    const params = makeBaseParams();
    await saveGameResults(params);

    expect(params.setError).toHaveBeenCalledWith('Failed to save game results. Please try again.');
  });

  test('should set error message when PUT update fails', async () => {
    fetch
      .mockImplementationOnce(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) // GET game details
      .mockImplementationOnce(() => Promise.resolve({ ok: false })); // PUT fails

    const params = makeBaseParams();
    await saveGameResults(params);
    expect(params.setError).toHaveBeenCalledWith('Failed to save game results. Please try again.');
  });

  test('should skip stats save when calculateStatisticsForTeam returns null', async () => {
    calculateStatisticsForTeam.mockReturnValue(null);

    await saveGameResults(makeBaseParams());

    const statsCalls = fetch.mock.calls.filter(([url]) => url.includes('/api/game-stats'));
    expect(statsCalls.length).toBe(0);
  });

  test('should handle missing team IDs gracefully', async () => {
    await saveGameResults(makeBaseParams({ team1Id: null, team2Id: null }));

    const teamCalls = fetch.mock.calls.filter(([url]) => url.includes('/api/teams'));
    expect(teamCalls.length).toBe(0);
  });

  test('should update stone notes for non-absent players with selected rocks', async () => {
    const playerSetup = [
      { name: 'Alice', isAbsent: false, selectedRocks: [1, 2] },
      { name: 'Bob', isAbsent: true, selectedRocks: [3] },
      { name: 'Carol', isAbsent: false, selectedRocks: [] },
    ];

    await saveGameResults(makeBaseParams({ playerSetup }));

    const stoneNoteCalls = fetch.mock.calls.filter(([url]) => url.includes('/api/stone-notes'));
    // Only Alice with 2 rocks should produce note calls
    expect(stoneNoteCalls.length).toBe(2);
  });
});

describe('saveTieBreakerResults', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupSuccessfulFetch();
    isUserOnTeam.mockReturnValue(true);
    calculateStatisticsForTeam.mockReturnValue(null);
  });

  test('should alert error when no tieWinMethod or tieWinnerTeam', async () => {
    await saveTieBreakerResults(makeBaseParams({ tieWinMethod: null, tieWinnerTeam: null }));

    expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please select a winning team and method');
  });

  test('should add 1 to winning team score', async () => {
    await saveTieBreakerResults(makeBaseParams({
      tieWinMethod: 'extra_end',
      tieWinnerTeam: 1,
      team1Total: 5,
      team2Total: 5,
    }));

    const putCalls = fetch.mock.calls.filter(([, opts]) => opts?.method === 'PUT');
    expect(putCalls.length).toBe(1);
    const body = JSON.parse(putCalls[0][1].body);
    expect(body.team1_score).toBe(6);
    expect(body.team2_score).toBe(5);
    expect(body.win_method).toBe('extra_end');
  });

  test('should add 1 to team2 score when team2 wins tiebreaker', async () => {
    await saveTieBreakerResults(makeBaseParams({
      tieWinMethod: 'draw_button',
      tieWinnerTeam: 2,
      team1Total: 4,
      team2Total: 4,
    }));

    const putCalls = fetch.mock.calls.filter(([, opts]) => opts?.method === 'PUT');
    const body = JSON.parse(putCalls[0][1].body);
    expect(body.team1_score).toBe(4);
    expect(body.team2_score).toBe(5);
  });

  test('should display correct winner and method text in alert for extra_end', async () => {
    await saveTieBreakerResults(makeBaseParams({
      tieWinMethod: 'extra_end',
      tieWinnerTeam: 1,
      team1Total: 5,
      team2Total: 5,
      team1Name: 'Eagles',
    }));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Game Complete!',
      expect.stringContaining('Eagles wins by Extra End'),
      expect.any(Array),
    );
  });

  test('should display Draw the Button method text', async () => {
    await saveTieBreakerResults(makeBaseParams({
      tieWinMethod: 'draw_button',
      tieWinnerTeam: 2,
      team1Total: 4,
      team2Total: 4,
      team2Name: 'Hawks',
    }));

    expect(Alert.alert).toHaveBeenCalledWith(
      'Game Complete!',
      expect.stringContaining('Hawks wins by Draw the Button'),
      expect.any(Array),
    );
  });

  test('should set error on failure', async () => {
    fetch.mockImplementationOnce(() => Promise.resolve({ ok: false }));

    const params = makeBaseParams({ tieWinMethod: 'extra_end', tieWinnerTeam: 1 });
    await saveTieBreakerResults(params);

    expect(params.setError).toHaveBeenCalledWith('Failed to save game results. Please try again.');
  });

  test('should override stats won/totalScore for tiebreaker stats', async () => {
    calculateStatisticsForTeam.mockReturnValue({ totalScore: 5, won: false });

    await saveTieBreakerResults(makeBaseParams({
      tieWinMethod: 'extra_end',
      tieWinnerTeam: 1,
      team1Total: 5,
      team2Total: 5,
    }));

    const statsCalls = fetch.mock.calls.filter(([url]) => url.includes('/api/game-stats'));
    expect(statsCalls.length).toBe(2);

    // Team 1 should be marked as winner with updated score
    const team1StatsBody = JSON.parse(statsCalls[0][1].body);
    expect(team1StatsBody.totalScore).toBe(6); // 5 + 1
    expect(team1StatsBody.won).toBe(true);

    // Team 2 should be marked as loser with original score
    const team2StatsBody = JSON.parse(statsCalls[1][1].body);
    expect(team2StatsBody.totalScore).toBe(5);
    expect(team2StatsBody.won).toBe(false);
  });
});
