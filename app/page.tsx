"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  RefreshCw,
  MapPin,
  Flag,
  BrickWallIcon as Brick,
} from "lucide-react";

import { visualizeDijkstra } from "@/algorithms/dijkstra";
import { visualizeAStar } from "@/algorithms/astar";
import { visualizeBFS } from "@/algorithms/bfs";
import { visualizeDFS } from "@/algorithms/dfs";
import { NodeType } from "@/types/NodeType";

const createNode = (row: number, col: number): NodeType => {
  return {
    row,
    col,
    isStart: false,
    isEnd: false,
    distance: Number.POSITIVE_INFINITY,
    isVisited: false,
    isWall: false,
    isPath: false,
    previousNode: null,
  };
};

const getInitialGrid = (rows: number, cols: number): NodeType[][] => {
  const grid: NodeType[][] = [];
  for (let row = 0; row < rows; row++) {
    const currentRow: NodeType[] = [];
    for (let col = 0; col < cols; col++) {
      currentRow.push(createNode(row, col));
    }
    grid.push(currentRow);
  }
  return grid;
};

const getNodeClassName = (node: NodeType): string => {
  let classes =
    "border border-gray-300 inline-block transition-all duration-300 ease-in-out";
  if (node.isStart) {
    classes += " bg-green-500";
  } else if (node.isEnd) {
    classes += " bg-red-500";
  } else if (node.isPath) {
    classes += " bg-yellow-400";
  } else if (node.isWall) {
    classes += " bg-gray-800";
  } else if (node.isVisited) {
    classes += " bg-blue-400";
  } else {
    classes += " bg-white";
  }
  return classes;
};

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
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
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
      newNode = {
        ...node,
        isWall: !node.isWall,
      };
    } else if (currentMode === "start") {
      const oldStartNode = newGrid.flat().find((node) => node.isStart);
      if (oldStartNode) {
        oldStartNode.isStart = false;
      }
      newNode = {
        ...node,
        isStart: true,
        isWall: false,
      };
      setStartPos({ row, col });
    } else if (currentMode === "end") {
      const oldEndNode = newGrid.flat().find((node) => node.isEnd);
      if (oldEndNode) {
        oldEndNode.isEnd = false;
      }
      newNode = {
        ...node,
        isEnd: true,
        isWall: false,
      };
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

  const handleMouseUp = () => {
    setMouseIsPressed(false);
  };

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

    const updateGrid = (gridToUpdate: NodeType[][]) => {
      setGrid([...gridToUpdate]);
    };

    if (algorithm === "dijkstra") {
      await visualizeDijkstra(newGrid, startNode, endNode, updateGrid, speed);
    } else if (algorithm === "astar") {
      await visualizeAStar(newGrid, startNode, endNode, updateGrid, speed);
    } else if (algorithm === "bfs") {
      await visualizeBFS(newGrid, startNode, endNode, updateGrid, speed);
    } else if (algorithm === "dfs") {
      await visualizeDFS(newGrid, startNode, endNode, updateGrid, speed);
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

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${grid[0]?.length || 1}, ${cellSize}px)`,
    ...(isMobile
      ? {}
      : { width: `${(grid[0]?.length || 1) * cellSize + 58}px` }),
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
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Select
            value={currentMode}
            onValueChange={(value) =>
              setCurrentMode(value as "start" | "end" | "wall")
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wall">
                <div className="flex items-center">
                  <Brick className="mr-2 h-4 w-4" />
                  Wall
                </div>
              </SelectItem>
              <SelectItem value="start">
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Start Point
                </div>
              </SelectItem>
              <SelectItem value="end">
                <div className="flex items-center">
                  <Flag className="mr-2 h-4 w-4" />
                  End Point
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={algorithm}
            onValueChange={(value) =>
              setAlgorithm(value as "dijkstra" | "astar" | "bfs" | "dfs")
            }
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dijkstra">Dijkstra's</SelectItem>
              <SelectItem value="astar">A*</SelectItem>
              <SelectItem value="bfs">Breadth-First Search (BFS)</SelectItem>
              <SelectItem value="dfs">Depth-First Search (DFS)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-sm font-medium">Speed:</span>
            <Slider
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
              max={100}
              step={1}
              className="w-full sm:w-[200px]"
            />
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={visualize}
            disabled={isRunning}
            size="lg"
            className="flex-1 sm:flex-auto"
          >
            {isRunning ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isRunning ? "Running..." : "Visualize"}
          </Button>
          <Button
            onClick={resetGrid}
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-auto"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="flex justify-center overflow-auto"
      >
        <div
          className="grid gap-0 bg-white p-2 sm:p-6 rounded-lg shadow-xl overflow-hidden"
          style={gridStyle}
          onMouseUp={handleMouseUp}
          onTouchEnd={handleMouseUp}
        >
          {grid.map((row) =>
            row.map((node) => (
              <motion.div
                key={`node-${node.row}-${node.col}`}
                id={`node-${node.row}-${node.col}`}
                onMouseDown={() => handleMouseDown(node.row, node.col)}
                onMouseEnter={() => handleMouseEnter(node.row, node.col)}
                onTouchStart={() => handleMouseDown(node.row, node.col)}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  const element = document.elementFromPoint(
                    touch.clientX,
                    touch.clientY
                  );
                  if (element) {
                    const [, row, col] = element.id.split("-");
                    handleMouseEnter(
                      Number.parseInt(row),
                      Number.parseInt(col)
                    );
                  }
                }}
                className={`${getNodeClassName(node)} ${
                  isMobile ? "w-4 h-4" : "w-6 h-6"
                }`}
                whileHover={{ scale: 1.2 }}
                transition={{ type: "spring", stiffness: 500, damping: 20 }}
              ></motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PathFindingVisualizer;
