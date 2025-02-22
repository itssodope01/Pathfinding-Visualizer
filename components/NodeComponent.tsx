"use client";

import React from "react";
import { motion } from "framer-motion";
import { NodeType } from "@/types/NodeType";
import { getNodeClassName } from "@/utils/gridUtils";

interface NodeComponentProps {
  node: NodeType;
  cellSize: number;
  isMobile: boolean;
  onMouseDown: (row: number, col: number) => void;
  onMouseEnter: (row: number, col: number) => void;
}

const NodeComponent: React.FC<NodeComponentProps> = ({
  node,
  cellSize,
  isMobile,
  onMouseDown,
  onMouseEnter,
}) => {
  return (
    <motion.div
      key={`node-${node.row}-${node.col}`}
      id={`node-${node.row}-${node.col}`}
      onMouseDown={() => onMouseDown(node.row, node.col)}
      onMouseEnter={() => onMouseEnter(node.row, node.col)}
      onTouchStart={() => onMouseDown(node.row, node.col)}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element) {
          const [, row, col] = element.id.split("-");
          onMouseEnter(Number.parseInt(row), Number.parseInt(col));
        }
      }}
      className={`${getNodeClassName(node)} ${
        isMobile ? "w-4 h-4" : "w-6 h-6"
      }`}
      whileHover={{ scale: 1.2 }}
      transition={{ type: "spring", stiffness: 500, damping: 20 }}
    ></motion.div>
  );
};

export default NodeComponent;
