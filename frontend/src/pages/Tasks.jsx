import React from 'react';
import TaskList from '../components/tasks/TaskList';
import PageTitle from '../components/common/PageTitle';

const Tasks = () => {
  return (
    <>
      <PageTitle title="Tasks" />
      <TaskList />
    </>
  );
};

export default Tasks;