// Check if task is overdue
export const isOverdue = (deadline, status) => {
  if (status === 'completed') return false;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const taskDate = new Date(deadline);
  taskDate.setHours(0, 0, 0, 0);
  
  return taskDate < today;
};

// Format date for display
export const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN');
};

// Format date for input (YYYY-MM-DD)
export const formatDateForInput = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};
