export interface NodeType {
  row: number;
  col: number;
  isStart: boolean;
  isEnd: boolean;
  distance: number;
  isVisited: boolean;
  isWall: boolean;
  isPath: boolean;
  previousNode: NodeType | null;
}
