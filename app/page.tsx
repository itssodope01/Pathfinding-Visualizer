"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Grid from "../components/Grid";
import Controls from "../components/Controls";
import { getInitialGrid, manhattanDistance } from "../utils/gridUtils";
import { NodeType } from "../types/NodeType";

const PathFindingVisualizer: React.FC = () => {
  const [grid, setGrid] = useState<NodeType[][]>([]);
  const [mouseIsPressed, setMouseIsPressed] = useState(false);
  const [currentMode, setCurrentMode] = useState<"start" | "end" | "wall">(
    "wall"
  );
  const [algorithm, setAlgorithm] = useState<
    "dijkstra" | "astar" | "bfs" | "dfs"
  >("dijkstra");
  const [startPos, setStartPos] = useState<{ row: number; col: number }>({
    row: 0,
    col: 0,
  });
  const [endPos, setEndPos] = useState<{ row: number; col: number }>({
    row: 0,
    col: 0,
  });
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(50);
  const [cellSize, setCellSize] = useState(24);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const initializeGrid = useCallback(() => {
    const windowWidth = window.innerWidth || 1024;
    const windowHeight = window.innerHeight || 768;
    let newCellSize: number, cols: number, rows: number;

    if (windowWidth < 640) {
      newCellSize = 16;
      cols = Math.floor((windowWidth - 32) / newCellSize);
      rows = Math.floor((windowHeight - 300) / newCellSize);
    } else {
      newCellSize = 24;
      rows = 20;
      cols = 50;
    }

    setCellSize(newCellSize);
    const newGrid = getInitialGrid(rows, cols);
    const newStartPos = {
      row: Math.floor(rows / 2),
      col: Math.floor(cols / 4),
    };
    const newEndPos = {
      row: Math.floor(rows / 2),
      col: Math.floor((cols * 3) / 4),
    };

    newGrid[newStartPos.row][newStartPos.col].isStart = true;
    newGrid[newEndPos.row][newEndPos.col].isEnd = true;

    setGrid(newGrid);
    setStartPos(newStartPos);
    setEndPos(newEndPos);
  }, []);

  useEffect(() => {
    initializeGrid();
    window.addEventListener("resize", initializeGrid);
    return () => window.removeEventListener("resize", initializeGrid);
  }, [initializeGrid]);

  const getNewGridWithWall = (
    grid: NodeType[][],
    row: number,
    col: number
  ): NodeType[][] => {
    const newGrid = grid.slice();
    const node = newGrid[row][col];
    let newNode;

    if (currentMode === "wall") {
      newNode = { ...node, isWall: !node.isWall };
    } else if (currentMode === "start") {
      const oldStartNode = newGrid.flat().find((node) => node.isStart);
      if (oldStartNode) {
        oldStartNode.isStart = false;
      }
      newNode = { ...node, isStart: true, isWall: false };
      setStartPos({ row, col });
    } else if (currentMode === "end") {
      const oldEndNode = newGrid.flat().find((node) => node.isEnd);
      if (oldEndNode) {
        oldEndNode.isEnd = false;
      }
      newNode = { ...node, isEnd: true, isWall: false };
      setEndPos({ row, col });
    } else {
      newNode = { ...node };
    }

    newGrid[row][col] = newNode;
    return newGrid;
  };

  const handleMouseDown = (row: number, col: number) => {
    if (isRunning) return;
    const newGrid = getNewGridWithWall(grid, row, col);
    setGrid(newGrid);
    setMouseIsPressed(true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!mouseIsPressed || isRunning) return;
    const newGrid = getNewGridWithWall(grid, row, col);
    setGrid(newGrid);
  };

  const handleMouseUp = () => setMouseIsPressed(false);

  const animateFinalPath = async (endNode: NodeType) => {
    let currentNode: NodeType | null = endNode;
    const path: NodeType[] = [];
    while (currentNode !== null) {
      path.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    for (const node of path) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      setGrid((prevGrid) =>
        prevGrid.map((row) =>
          row.map((n) =>
            n.row === node.row && n.col === node.col
              ? { ...n, isPath: true }
              : n
          )
        )
      );
    }
  };

  const sortNodesByDistance = (unvisitedNodes: NodeType[]) => {
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
  };

  const updateUnvisitedNeighbors = (node: NodeType, grid: NodeType[][]) => {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.distance = node.distance + 1;
      neighbor.previousNode = node;
    }
  };

  const getUnvisitedNeighbors = (
    node: NodeType,
    grid: NodeType[][]
  ): NodeType[] => {
    const neighbors: NodeType[] = [];
    const { row, col } = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter((n) => !n.isVisited && !n.isWall);
  };

  const visualizeDijkstra = async (
    grid: NodeType[][],
    startNode: NodeType,
    endNode: NodeType
  ) => {
    startNode.distance = 0;
    const unvisitedNodes = grid.flat();

    while (unvisitedNodes.length) {
      sortNodesByDistance(unvisitedNodes);
      const closestNode = unvisitedNodes.shift();
      if (!closestNode) break;
      if (closestNode.isWall) continue;
      if (closestNode.distance === Number.POSITIVE_INFINITY) return;

      closestNode.isVisited = true;
      await new Promise((resolve) =>
        setTimeout(() => {
          setGrid((prevGrid) =>
            prevGrid.map((row) =>
              row.map((node) =>
                node.row === closestNode.row && node.col === closestNode.col
                  ? { ...node, isVisited: true }
                  : node
              )
            )
          );
          resolve(null);
        }, 100 - speed)
      );

      if (closestNode === endNode) return;
      updateUnvisitedNeighbors(closestNode, grid);
    }
  };

  const visualizeAStar = async (
    grid: NodeType[][],
    startNode: NodeType,
    endNode: NodeType
  ) => {
    startNode.distance = 0;
    const openSet: NodeType[] = [startNode];

    while (openSet.length) {
      openSet.sort(
        (a, b) =>
          a.distance +
          manhattanDistance(a, endNode) -
          (b.distance + manhattanDistance(b, endNode))
      );
      const currentNode = openSet.shift();
      if (!currentNode) break;
      if (currentNode.isWall) continue;

      currentNode.isVisited = true;
      await new Promise((resolve) =>
        setTimeout(() => {
          setGrid((prevGrid) =>
            prevGrid.map((row) =>
              row.map((node) =>
                node.row === currentNode.row && node.col === currentNode.col
                  ? { ...node, isVisited: true }
                  : node
              )
            )
          );
          resolve(null);
        }, 100 - speed)
      );

      if (currentNode === endNode) return;

      const neighbors = getUnvisitedNeighbors(currentNode, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
          const tentativeG = currentNode.distance + 1;
          if (tentativeG < neighbor.distance) {
            neighbor.distance = tentativeG;
            neighbor.previousNode = currentNode;
            if (!openSet.includes(neighbor)) {
              openSet.push(neighbor);
            }
          }
        }
      }
    }
  };

  const visualizeBFS = async (
    grid: NodeType[][],
    startNode: NodeType,
    endNode: NodeType
  ) => {
    const queue: NodeType[] = [];
    startNode.distance = 0;
    startNode.isVisited = true;
    queue.push(startNode);

    while (queue.length) {
      const currentNode = queue.shift();
      if (!currentNode) break;
      if (currentNode.isWall) continue;
      await new Promise((resolve) =>
        setTimeout(() => {
          setGrid((prevGrid) =>
            prevGrid.map((row) =>
              row.map((node) =>
                node.row === currentNode.row && node.col === currentNode.col
                  ? { ...node, isVisited: true }
                  : node
              )
            )
          );
          resolve(null);
        }, 100 - speed)
      );
      if (currentNode === endNode) return;
      const neighbors = getUnvisitedNeighbors(currentNode, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
          neighbor.distance = currentNode.distance + 1;
          neighbor.previousNode = currentNode;
          neighbor.isVisited = true;
          queue.push(neighbor);
        }
      }
    }
  };

  const visualizeDFS = async (
    grid: NodeType[][],
    startNode: NodeType,
    endNode: NodeType
  ) => {
    const stack: NodeType[] = [];
    startNode.distance = 0;
    stack.push(startNode);

    while (stack.length) {
      const currentNode = stack.pop();
      if (!currentNode) break;
      if (currentNode.isWall) continue;
      if (!currentNode.isVisited) {
        currentNode.isVisited = true;
        await new Promise((resolve) =>
          setTimeout(() => {
            setGrid((prevGrid) =>
              prevGrid.map((row) =>
                row.map((node) =>
                  node.row === currentNode.row && node.col === currentNode.col
                    ? { ...node, isVisited: true }
                    : node
                )
              )
            );
            resolve(null);
          }, 100 - speed)
        );
        if (currentNode === endNode) return;
      }
      const neighbors = getUnvisitedNeighbors(currentNode, grid);
      for (const neighbor of neighbors) {
        if (!neighbor.isVisited && !neighbor.isWall) {
          neighbor.distance = currentNode.distance + 1;
          neighbor.previousNode = currentNode;
          stack.push(neighbor);
        }
      }
    }
  };

  const visualize = async () => {
    if (isRunning) return;
    setIsRunning(true);
    const newGrid = grid.map((row) =>
      row.map((node) => ({
        ...node,
        distance: Number.POSITIVE_INFINITY,
        isVisited: false,
        isPath: false,
        previousNode: null,
      }))
    );
    setGrid(newGrid);

    const startNode = newGrid[startPos.row][startPos.col];
    const endNode = newGrid[endPos.row][endPos.col];

    if (algorithm === "dijkstra") {
      await visualizeDijkstra(newGrid, startNode, endNode);
    } else if (algorithm === "astar") {
      await visualizeAStar(newGrid, startNode, endNode);
    } else if (algorithm === "bfs") {
      await visualizeBFS(newGrid, startNode, endNode);
    } else if (algorithm === "dfs") {
      await visualizeDFS(newGrid, startNode, endNode);
    }

    if (endNode.previousNode) {
      await animateFinalPath(endNode);
    }
    setIsRunning(false);
  };

  const resetGrid = () => {
    setIsRunning(false);
    initializeGrid();
  };

  return (
    <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-100 to-indigo-200 min-h-screen">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-3xl sm:text-5xl font-bold mb-4 sm:mb-8 text-indigo-800 text-center"
      >
        Path Finding Visualizer
      </motion.h1>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Controls
          currentMode={currentMode}
          algorithm={algorithm}
          speed={speed}
          isRunning={isRunning}
          onModeChange={setCurrentMode}
          onAlgorithmChange={setAlgorithm}
          onSpeedChange={setSpeed}
          onVisualize={visualize}
          onReset={resetGrid}
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex justify-center overflow-auto"
      >
        <Grid
          grid={grid}
          cellSize={cellSize}
          isMobile={isMobile}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseUp={handleMouseUp}
        />
      </motion.div>
    </div>
  );
};

export default PathFindingVisualizer;
