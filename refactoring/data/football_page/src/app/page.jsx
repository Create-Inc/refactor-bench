import React, { useState, useRef, useCallback } from "react";
import { PageHeader } from "@/components/Football/PageHeader";
import { Card } from "@/components/Football/Card";
import { Scoreboard } from "@/components/Football/Scoreboard";
import { GameCanvas } from "@/components/Football/GameCanvas";
import { ControlsGuide } from "@/components/Football/ControlsGuide";
import { StatsPanel } from "@/components/Football/StatsPanel";
import { EventsPanel } from "@/components/Football/EventsPanel";
import { TipsPanel } from "@/components/Football/TipsPanel";
import { useGameLoop } from "@/components/Football/useGameLoop";
import {
  FIELD_WIDTH,
  FIELD_HEIGHT,
  INITIAL_PLAYERS,
  INITIAL_STATS,
} from "@/components/Football/constants";

export default function FootballGamePage() {
  const [gameState, setGameState] = useState("idle");
  const [score, setScore] = useState({ home: 0, away: 0 });
  const [time, setTime] = useState(0);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [selectedPlayer, setSelectedPlayer] = useState(0);
  const [difficulty, setDifficulty] = useState("medium"); // easy, medium, hard
  const [teamNames, setTeamNames] = useState({ home: "الهلال", away: "النصر" });

  const canvasRef = useRef(null);
  const keysPressed = useRef({});

  const ballRef = useRef({
    x: FIELD_WIDTH / 2,
    y: FIELD_HEIGHT / 2,
    vx: 0,
    vy: 0,
    owner: null,
  });

  const playersRef = useRef(INITIAL_PLAYERS);

  const addEvent = useCallback(
    (text, icon = "⚽") => {
      setEvents((prev) =>
        [
          { id: Date.now(), text, time: Math.floor(time / 60), icon },
          ...prev,
        ].slice(0, 10),
      );
    },
    [time],
  );

  const resetBall = () => {
    ballRef.current = {
      x: FIELD_WIDTH / 2,
      y: FIELD_HEIGHT / 2,
      vx: 0,
      vy: 0,
      owner: null,
    };
  };

  const handleReset = () => {
    setScore({ home: 0, away: 0 });
    setTime(0);
    setEvents([]);
    setStats(INITIAL_STATS);
    setGameState("idle");
    resetBall();
  };

  // Keyboard controls
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key.toLowerCase()] = true;

      if (e.key === "Tab") {
        e.preventDefault();
        setSelectedPlayer(
          (prev) => (prev + 1) % playersRef.current.home.length,
        );
        addEvent(
          `تبديل إلى ${playersRef.current.home[(selectedPlayer + 1) % playersRef.current.home.length].name}`,
          "🔄",
        );
      }

      if (e.key === " " && gameState === "playing") {
        e.preventDefault();
        const player = playersRef.current.home[selectedPlayer];
        const ball = ballRef.current;
        const dx = ball.x - player.x;
        const dy = ball.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 30) {
          const goalX = FIELD_WIDTH - 10;
          const goalY = FIELD_HEIGHT / 2;
          const shootDx = goalX - ball.x;
          const shootDy = goalY - ball.y;
          const shootDist = Math.sqrt(shootDx * shootDx + shootDy * shootDy);

          ball.vx = (shootDx / shootDist) * 15;
          ball.vy = (shootDy / shootDist) * 15;
          ball.owner = null;

          setStats((prev) => ({
            ...prev,
            shots: { ...prev.shots, home: prev.shots.home + 1 },
          }));
          addEvent(`${player.name} يسدد نحو المرمى!`, "⚡");
        }
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [gameState, selectedPlayer, addEvent]);

  useGameLoop(
    gameState,
    selectedPlayer,
    setScore,
    setTime,
    addEvent,
    resetBall,
    setStats,
    playersRef,
    ballRef,
    keysPressed,
    difficulty,
  );

  // Check for halftime
  const isHalftime = time >= 2700 && time < 2760 && gameState === "playing"; // 45 seconds = halftime

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 p-4 md:p-8 font-inter">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          gameState={gameState}
          setGameState={setGameState}
          onReset={handleReset}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
        />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="!p-6 md:!p-8 bg-gradient-to-br from-white to-gray-50 shadow-xl">
              <Scoreboard
                score={score}
                time={time}
                gameState={gameState}
                teamNames={teamNames}
              />
              <GameCanvas
                canvasRef={canvasRef}
                playersRef={playersRef}
                ballRef={ballRef}
                selectedPlayer={selectedPlayer}
                gameState={gameState}
                isHalftime={isHalftime}
              />
              <ControlsGuide
                playersRef={playersRef}
                selectedPlayer={selectedPlayer}
              />
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <StatsPanel stats={stats} teamNames={teamNames} />
            <EventsPanel events={events} />
            <TipsPanel difficulty={difficulty} />
          </div>
        </div>
      </div>
    </div>
  );
}
