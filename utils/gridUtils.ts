"use client";

import { NodeType } from "../types/NodeType";

export const createNode = (row: number, col: number): NodeType => {
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

export const getInitialGrid = (rows: number, cols: number): NodeType[][] => {
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

export const getNodeClassName = (node: NodeType): string => {
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

// Heuristic: Manhattan Distance
export const manhattanDistance = (
  node: NodeType,
  endNode: NodeType
): number => {
  return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
};
