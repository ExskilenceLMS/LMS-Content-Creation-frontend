import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Login';
import Contentcreation from './Contentcreation';
import Dashboard from './Dashboard';
import CreateSubjectPlan from './CreateSubjectPlan';
import ReorderContent from "./ReorderContent";
import AssignBatch from './AssignBatch'; 
import DayWiseGroup from './DaywiseGroup';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path='/assign-batch' element={<AssignBatch/>}/>    
      <Route path="/content-creation" element={<Contentcreation />} />
      <Route path="/subject-plan" element={<CreateSubjectPlan/>}/>
      <Route path="/reorder-content" element={<ReorderContent/>}/>
      <Route path='/day-wise-group' element={<DayWiseGroup/>}/>
    </Routes>
  );
};

export default AppRoutes;
