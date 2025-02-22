import { NodeType } from "../types/NodeType";

const sortNodesByDistance = (unvisitedNodes: NodeType[]) => {
  unvisitedNodes.sort((nodeA, nodeB) => nodeA.distance - nodeB.distance);
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
  return neighbors.filter(
    (neighbor) => !neighbor.isVisited && !neighbor.isWall
  );
};

const updateUnvisitedNeighbors = (node: NodeType, grid: NodeType[][]) => {
  const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
  for (const neighbor of unvisitedNeighbors) {
    neighbor.distance = node.distance + 1;
    neighbor.previousNode = node;
  }
};

export const visualizeDijkstra = async (
  grid: NodeType[][],
  startNode: NodeType,
  endNode: NodeType,
  updateGrid: (grid: NodeType[][]) => void,
  speed: number
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
        updateGrid(grid);
        resolve(null);
      }, 100 - speed)
    );

    if (closestNode === endNode) return;

    updateUnvisitedNeighbors(closestNode, grid);
  }
};
