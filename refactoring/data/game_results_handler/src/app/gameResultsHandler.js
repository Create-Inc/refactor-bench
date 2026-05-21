import { Alert } from "react-native";
import { router } from "expo-router";
import { isUserOnTeam } from "@/utils/teamUtils";
import { calculateStatisticsForTeam } from "@/utils/scoreboardUtils";

export const saveGameResults = async ({
  gameId,
  team1Total,
  team2Total,
  team1Color,
  team2Color,
  team1Id,
  team2Id,
  team1Scores,
  team2Scores,
  totalEnds,
  startingHammer,
  playerSetup,
  myTeamId,
  team1Name,
  team2Name,
  setError,
}) => {
  try {
    setError(null);

    const gameDetailsResponse = await fetch(`/api/games?id=${gameId}`);
    if (!gameDetailsResponse.ok)
      throw new Error("Failed to fetch game details");
    const gameDetails = await gameDetailsResponse.json();

    const updateResponse = await fetch("/api/games", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: parseInt(gameId),
        team1_score: team1Total,
        team2_score: team2Total,
        team1_color: team1Color,
        team2_color: team2Color,
        win_method: null,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error("Failed to update game scores");
    }

    const teamsToSaveStats = [];

    if (team1Id) {
      const team1Response = await fetch(`/api/teams?id=${team1Id}`);
      if (team1Response.ok) {
        const team1Data = await team1Response.json();
        teamsToSaveStats.push({
          teamId: team1Id,
          teamNumber: 1,
          members: team1Data.members,
          isMyTeam: isUserOnTeam(team1Data),
          rockColor: team1Color,
        });
      }
    }

    if (team2Id) {
      const team2Response = await fetch(`/api/teams?id=${team2Id}`);
      if (team2Response.ok) {
        const team2Data = await team2Response.json();
        teamsToSaveStats.push({
          teamId: team2Id,
          teamNumber: 2,
          members: team2Data.members,
          isMyTeam: isUserOnTeam(team2Data),
          rockColor: team2Color,
        });
      }
    }

    for (const teamInfo of teamsToSaveStats) {
      const stats = calculateStatisticsForTeam(
        teamInfo.teamId,
        teamInfo.teamNumber,
        teamInfo.members,
        team1Scores,
        team2Scores,
        totalEnds,
        startingHammer,
        gameId,
        playerSetup,
        myTeamId,
        team1Id,
        team2Id,
      );
      if (stats) {
        const statsToSave = {
          ...stats,
          basicOnly: false,
          rockColor: teamInfo.rockColor,
        };

        const statsResponse = await fetch("/api/game-stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(statsToSave),
        });

        if (!statsResponse.ok) {
          console.error(
            `Failed to save statistics for team ${teamInfo.teamId}`,
          );
        }
      }
    }

    await updateStoneNotes({
      playerSetup,
      myTeamId,
      gameDetails,
      team1Id,
      team2Id,
      team1Color,
      team2Color,
      team1Name,
      team2Name,
      team1Total,
      team2Total,
    });

    Alert.alert(
      "Game Complete!",
      `${team1Total > team2Total ? team1Name : team2Name} wins ${Math.max(team1Total, team2Total)}-${Math.min(team1Total, team2Total)}`,
      [
        {
          text: "OK",
          onPress: () => {
            router.push("/(tabs)/schedule");
          },
        },
      ],
    );
  } catch (error) {
    console.error(error);
    setError("Failed to save game results. Please try again.");
  }
};

export const saveTieBreakerResults = async ({
  tieWinMethod,
  tieWinnerTeam,
  gameId,
  team1Total,
  team2Total,
  team1Color,
  team2Color,
  team1Id,
  team2Id,
  team1Scores,
  team2Scores,
  totalEnds,
  startingHammer,
  playerSetup,
  myTeamId,
  team1Name,
  team2Name,
  setError,
}) => {
  if (!tieWinMethod || !tieWinnerTeam) {
    Alert.alert("Error", "Please select a winning team and method");
    return;
  }

  const newTeam1Score = tieWinnerTeam === 1 ? team1Total + 1 : team1Total;
  const newTeam2Score = tieWinnerTeam === 2 ? team2Total + 1 : team2Total;

  try {
    setError(null);

    const gameDetailsResponse = await fetch(`/api/games?id=${gameId}`);
    if (!gameDetailsResponse.ok)
      throw new Error("Failed to fetch game details");
    const gameDetails = await gameDetailsResponse.json();

    const updateResponse = await fetch("/api/games", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: parseInt(gameId),
        team1_score: newTeam1Score,
        team2_score: newTeam2Score,
        team1_color: team1Color,
        team2_color: team2Color,
        win_method: tieWinMethod,
      }),
    });

    if (!updateResponse.ok) {
      throw new Error("Failed to update game scores");
    }

    const teamsToSaveStats = [];

    if (team1Id) {
      const team1Response = await fetch(`/api/teams?id=${team1Id}`);
      if (team1Response.ok) {
        const team1Data = await team1Response.json();
        teamsToSaveStats.push({
          teamId: team1Id,
          teamNumber: 1,
          members: team1Data.members,
          isMyTeam: isUserOnTeam(team1Data),
          rockColor: team1Color,
        });
      }
    }

    if (team2Id) {
      const team2Response = await fetch(`/api/teams?id=${team2Id}`);
      if (team2Response.ok) {
        const team2Data = await team2Response.json();
        teamsToSaveStats.push({
          teamId: team2Id,
          teamNumber: 2,
          members: team2Data.members,
          isMyTeam: isUserOnTeam(team2Data),
          rockColor: team2Color,
        });
      }
    }

    for (const teamInfo of teamsToSaveStats) {
      const stats = calculateStatisticsForTeam(
        teamInfo.teamId,
        teamInfo.teamNumber,
        teamInfo.members,
        team1Scores,
        team2Scores,
        totalEnds,
        startingHammer,
        gameId,
        playerSetup,
        myTeamId,
        team1Id,
        team2Id,
      );
      if (stats) {
        const statsToSave = {
          ...stats,
          totalScore: teamInfo.teamNumber === 1 ? newTeam1Score : newTeam2Score,
          won:
            (teamInfo.teamNumber === 1 && tieWinnerTeam === 1) ||
            (teamInfo.teamNumber === 2 && tieWinnerTeam === 2),
          basicOnly: false,
          rockColor: teamInfo.rockColor,
        };

        const statsResponse = await fetch("/api/game-stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(statsToSave),
        });

        if (!statsResponse.ok) {
          console.error(
            `Failed to save statistics for team ${teamInfo.teamId}`,
          );
        }
      }
    }

    await updateStoneNotes({
      playerSetup,
      myTeamId,
      gameDetails,
      team1Id,
      team2Id,
      team1Color,
      team2Color,
      team1Name,
      team2Name,
      team1Total: newTeam1Score,
      team2Total: newTeam2Score,
    });

    const winnerName = tieWinnerTeam === 1 ? team1Name : team2Name;
    const methodText =
      tieWinMethod === "extra_end" ? "Extra End" : "Draw the Button";

    Alert.alert(
      "Game Complete!",
      `${winnerName} wins by ${methodText} ${newTeam1Score}-${newTeam2Score}`,
      [
        {
          text: "OK",
          onPress: () => {
            router.push("/(tabs)/schedule");
          },
        },
      ],
    );
  } catch (error) {
    console.error(error);
    setError("Failed to save game results. Please try again.");
  }
};

const updateStoneNotes = async ({
  playerSetup,
  myTeamId,
  gameDetails,
  team1Id,
  team2Id,
  team1Color,
  team2Color,
  team1Name,
  team2Name,
  team1Total,
  team2Total,
}) => {
  if (playerSetup && myTeamId && gameDetails && gameDetails.club_id) {
    const myTeamNumber = team1Id === myTeamId ? 1 : 2;
    const myTeamColor = myTeamNumber === 1 ? team1Color : team2Color;
    const opponentTeamName = myTeamNumber === 1 ? team2Name : team1Name;
    const myScore = myTeamNumber === 1 ? team1Total : team2Total;
    const opponentScore = myTeamNumber === 1 ? team2Total : team1Total;
    const result =
      myScore > opponentScore
        ? "WIN"
        : myScore < opponentScore
          ? "LOSS"
          : "TIE";

    const gameDate = new Date(gameDetails.scheduled_time).toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      },
    );

    for (const player of playerSetup) {
      if (
        !player.isAbsent &&
        player.selectedRocks &&
        player.selectedRocks.length > 0
      ) {
        for (const rockNumber of player.selectedRocks) {
          const noteText = `Last thrown by ${player.name} on ${gameDate} vs ${opponentTeamName} (${result})`;

          try {
            const noteResponse = await fetch("/api/stone-notes", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                club_id: gameDetails.club_id,
                sheet_number: gameDetails.sheet_number,
                stone_number: rockNumber,
                color: myTeamColor,
                notes: noteText,
              }),
            });

            if (!noteResponse.ok) {
              console.error(`Failed to update note for rock ${rockNumber}`);
            }
          } catch (error) {
            console.error(
              `Failed to update note for rock ${rockNumber}:`,
              error,
            );
          }
        }
      }
    }
  }
};
