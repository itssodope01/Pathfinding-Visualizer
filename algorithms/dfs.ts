import { NodeType } from "../types/NodeType";

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
  return neighbors.filter(
    (neighbor) => !neighbor.isVisited && !neighbor.isWall
  );
};

export const visualizeDFS = async (
  grid: NodeType[][],
  startNode: NodeType,
  endNode: NodeType,
  updateGrid: (grid: NodeType[][]) => void,
  speed: number
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
          updateGrid(grid);
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
