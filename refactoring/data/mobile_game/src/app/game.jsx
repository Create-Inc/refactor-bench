import React, { useEffect, useCallback } from "react";
import { View } from "react-native";
import { GLView } from "expo-gl";
import * as THREE from "three";
import { Renderer } from "expo-three";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Haptics } from "expo-haptics";
import { useFonts, Inter_600SemiBold } from "@expo-google-fonts/inter";
import { LEVEL_CONFIGS } from "../constants/levelConfigs";
import { PLAYER_HEIGHT } from "../constants/gameConstants";
import { useGameState } from "../hooks/useGameState";
import { useGameAudio } from "../hooks/useGameAudio";
import { useGameLoop } from "../hooks/useGameLoop";
import { buildLevel } from "../utils/levelBuilder";
import { GameHUD } from "../components/GameHUD/GameHUD";
import { GameControls } from "../components/GameControls/GameControls";
import { GameOverlay } from "../components/GameOverlay/GameOverlay";
import { SanityVignette } from "../components/SanityVignette/SanityVignette";

export default function GameScreen() {
  const [fontsLoaded] = useFonts({
    Inter_600SemiBold,
  });

  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    gameOver,
    setGameOver,
    isJumpscare,
    setIsJumpscare,
    currentLevel,
    setCurrentLevel,
    isSprinting,
    setIsSprinting,
    flashlightOn,
    setFlashlightOn,
    battery,
    setBattery,
    sanity,
    setSanity,
    visitedCells,
    setVisitedCells,
    collectedMilk,
    setCollectedMilk,
    totalMilkCollected,
    setTotalMilkCollected,
    movementRef,
    cameraRef,
    sceneRef,
    mazeRef,
    stalkerRef,
    lastTimeRef,
    requestRef,
    flashlightRef,
    milkPositionsRef,
    milkMeshesRef,
    exitPortalRef,
    monsterLastTeleportRef,
  } = useGameState();

  const isMoving = movementRef.current.x !== 0 || movementRef.current.y !== 0;
  const { staticPlayer } = useGameAudio(
    sanity,
    gameOver,
    isMoving,
    isSprinting,
  );

  const triggerJumpscare = useCallback(async () => {
    setGameOver(true);
    setIsJumpscare(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    if (staticPlayer) staticPlayer.play();

    setTimeout(() => {
      setIsJumpscare(false);
    }, 2000);
  }, [staticPlayer, setGameOver, setIsJumpscare]);

  const advanceLevel = useCallback(() => {
    if (currentLevel < LEVEL_CONFIGS.length - 1) {
      const nextLevel = currentLevel + 1;
      setCurrentLevel(nextLevel);
      setSanity(100);
      setBattery(100);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (sceneRef.current) {
        const mazeData = buildLevel(
          sceneRef.current,
          LEVEL_CONFIGS[nextLevel],
          cameraRef,
          milkPositionsRef,
          milkMeshesRef,
          exitPortalRef,
          stalkerRef,
        );
        mazeRef.current = mazeData;
        setVisitedCells(new Set());
        setCollectedMilk(new Set());
      }
    } else {
      setGameOver(true);
    }
  }, [
    currentLevel,
    setCurrentLevel,
    setSanity,
    setBattery,
    sceneRef,
    cameraRef,
    milkPositionsRef,
    milkMeshesRef,
    exitPortalRef,
    stalkerRef,
    mazeRef,
    setVisitedCells,
    setCollectedMilk,
    setGameOver,
  ]);

  const levelConfig = LEVEL_CONFIGS[currentLevel];

  const gameLoopUpdate = useGameLoop({
    gameOver,
    currentLevel,
    isSprinting,
    flashlightOn,
    cameraRef,
    mazeRef,
    movementRef,
    setVisitedCells,
    milkMeshesRef,
    collectedMilk,
    setCollectedMilk,
    setTotalMilkCollected,
    setSanity,
    exitPortalRef,
    advanceLevel,
    setBattery,
    stalkerRef,
    levelConfig,
    sanity,
    monsterLastTeleportRef,
    staticPlayer,
    triggerJumpscare,
  });

  const onContextCreate = async (gl) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    const renderer = new Renderer({ gl });
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(1.5, PLAYER_HEIGHT, 1.5);
    cameraRef.current = camera;

    const pointLight = new THREE.PointLight(0xfff0a0, 1, 10);
    pointLight.position.set(0, PLAYER_HEIGHT, 0);
    flashlightRef.current = pointLight;
    camera.add(pointLight);
    scene.add(camera);

    const mazeData = buildLevel(
      scene,
      LEVEL_CONFIGS[0],
      cameraRef,
      milkPositionsRef,
      milkMeshesRef,
      exitPortalRef,
      stalkerRef,
    );
    mazeRef.current = mazeData;

    const animate = () => {
      const now = Date.now();
      const dt = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      gameLoopUpdate(dt, now);

      renderer.render(scene, camera);
      gl.endFrameEXP();
      requestRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  useEffect(() => {
    if (flashlightRef.current) {
      if (flashlightOn && battery > 0) {
        flashlightRef.current.intensity = 1;
        flashlightRef.current.distance = 10;
      } else {
        flashlightRef.current.intensity = 0.1;
        flashlightRef.current.distance = 2;
      }
    }
  }, [flashlightOn, battery]);

  const toggleFlashlight = useCallback(() => {
    if (battery > 0) {
      setFlashlightOn((prev) => !prev);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [battery, setFlashlightOn]);

  const resetGame = () => {
    setGameOver(false);
    setIsJumpscare(false);
    setCurrentLevel(0);
    setBattery(100);
    setSanity(100);
    setFlashlightOn(true);
    setVisitedCells(new Set());
    setCollectedMilk(new Set());
    setTotalMilkCollected(0);
    setIsSprinting(false);

    if (sceneRef.current) {
      const mazeData = buildLevel(
        sceneRef.current,
        LEVEL_CONFIGS[0],
        cameraRef,
        milkPositionsRef,
        milkMeshesRef,
        exitPortalRef,
        stalkerRef,
      );
      mazeRef.current = mazeData;
    }
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <GLView style={{ flex: 1 }} onContextCreate={onContextCreate} />

      <SanityVignette sanity={sanity} />

      {!gameOver && (
        <>
          <GameHUD
            levelConfig={levelConfig}
            sanity={sanity}
            battery={battery}
            visitedCells={visitedCells}
            collectedMilk={collectedMilk}
            cameraRef={cameraRef}
            milkPositionsRef={milkPositionsRef}
            insets={insets}
          />
          <GameControls
            movementRef={movementRef}
            isSprinting={isSprinting}
            setIsSprinting={setIsSprinting}
            flashlightOn={flashlightOn}
            battery={battery}
            toggleFlashlight={toggleFlashlight}
            insets={insets}
          />
        </>
      )}

      <GameOverlay
        gameOver={gameOver}
        isJumpscare={isJumpscare}
        currentLevel={currentLevel}
        totalMilkCollected={totalMilkCollected}
        sanity={sanity}
        resetGame={resetGame}
        router={router}
        insets={insets}
      />
    </View>
  );
}
