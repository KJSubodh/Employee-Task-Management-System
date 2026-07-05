import React from 'react';
import EmployeeList from '../components/employees/EmployeeList';
import PageTitle from '../components/common/PageTitle';

const Employees = () => {
  return (
    <>
      <PageTitle title="Employees" />
      <EmployeeList />
    </>
  );
};

export default Employees;