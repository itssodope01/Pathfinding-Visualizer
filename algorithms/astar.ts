import { NodeType } from "../types/NodeType";

const manhattanDistance = (node: NodeType, endNode: NodeType): number => {
  return Math.abs(node.row - endNode.row) + Math.abs(node.col - endNode.col);
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

export const visualizeAStar = async (
  grid: NodeType[][],
  startNode: NodeType,
  endNode: NodeType,
  updateGrid: (grid: NodeType[][]) => void,
  speed: number
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
        updateGrid(grid);
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
