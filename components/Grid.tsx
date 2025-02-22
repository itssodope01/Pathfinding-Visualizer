"use client";

import React from "react";
import { NodeType } from "@/types/NodeType";
import NodeComponent from "./NodeComponent";

interface GridProps {
  grid: NodeType[][];
  cellSize: number;
  isMobile: boolean;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
  onMouseUp: () => void;
}

const Grid: React.FC<GridProps> = ({
  grid,
  cellSize,
  isMobile,
  onMouseDown,
  onMouseEnter,
  onMouseUp,
}) => {
  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${grid[0]?.length || 1}, ${cellSize}px)`,
    width: !isMobile
      ? `${(grid[0]?.length || 1) * cellSize + 58}px`
      : undefined,
  };

  return (
    <div
      className="grid gap-0 bg-white p-2 sm:p-6 rounded-lg shadow-xl overflow-hidden"
      style={gridStyle}
      onMouseUp={onMouseUp}
      onTouchEnd={onMouseUp}
    >
      {grid.map((row) =>
        row.map((node) => (
          <NodeComponent
            key={`node-${node.row}-${node.col}`}
            node={node}
            cellSize={cellSize}
            isMobile={isMobile}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
          />
        ))
      )}
    </div>
  );
};

export default Grid;
