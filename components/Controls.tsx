"use client";

import React from "react";
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

interface ControlsProps {
  currentMode: "start" | "end" | "wall";
  algorithm: "dijkstra" | "astar" | "bfs" | "dfs";
  speed: number;
  isRunning: boolean;
  onModeChange: (mode: "start" | "end" | "wall") => void;
  onAlgorithmChange: (alg: "dijkstra" | "astar" | "bfs" | "dfs") => void;
  onSpeedChange: (speed: number) => void;
  onVisualize: () => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  currentMode,
  algorithm,
  speed,
  isRunning,
  onModeChange,
  onAlgorithmChange,
  onSpeedChange,
  onVisualize,
  onReset,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
      <Select
        value={currentMode}
        onValueChange={(value) =>
          onModeChange(value as "start" | "end" | "wall")
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
          onAlgorithmChange(value as "dijkstra" | "astar" | "bfs" | "dfs")
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
          onValueChange={(value) => onSpeedChange(value[0])}
          max={100}
          step={1}
          className="w-full sm:w-[200px]"
        />
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <Button
          onClick={onVisualize}
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
          onClick={onReset}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default Controls;
