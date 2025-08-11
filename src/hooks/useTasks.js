import { useTask } from '../context/TaskContext';

export const useTasks = () => {
  return useTask();
};