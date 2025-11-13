import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";

const DraggableTask = ({ task, expandedTaskId, setExpandedTaskId, children }) => {
  const [dragging, setDragging] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    onDragStart: () => setDragging(true),
    onDragEnd: () => setDragging(false),
    onDragCancel: () => setDragging(false),
  });

  const style = {
    cursor: "grab",
    opacity: isDragging ? 0.5 : 1,
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    userSelect: "none",
  };

  const handleClick = () => {
    if (!dragging) {
      setExpandedTaskId(expandedTaskId === task._id ? null : task._id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
    >
      <div
        className={
          "task-title-accordion" +
          (expandedTaskId === task._id ? " task-active" : "")
        }
      >
        {task.taskname}
      </div>
      {expandedTaskId === task._id && children}
    </div>
  );
};

export default DraggableTask;
