import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import {Routes, Route} from 'react-router-dom';
import ProfessorCreateProject from './pages/Professor_create_project';
import Professor_dashboard from './pages/Professor_dashboard';
import ProfessorViewProjects from './pages/Professors_projects';
import ProjectListing from './pages/ProjectListing';
import SubmitApplication from './pages/SubmitAppliation';
import YourApplications from './pages/YourApplications';
import ProfessorFinalAllocation from './pages/Professor_final_allocation';
import Professor_student_request from './pages/Professor_student_request';
import Dept_view_allocatoins from './pages/Dept_view_allocatoins';
function App() {
    return (
    <>
      
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/home' element={<HomePage/>}/>
        <Route path='/professor_dashboard' element={<Professor_dashboard/>}/>
        <Route path='/professor_create_project' element={<ProfessorCreateProject/>}/>
        <Route path='/professor_projects' element={<ProfessorViewProjects/>}/>
        <Route path='/applicationform/:id' element={<SubmitApplication/>}/>
        <Route path='/projects' element={<ProjectListing/>}/>
        <Route path='/student_applications' element={<YourApplications/>}/>
        <Route path='/professor_final_allocation' element={<ProfessorFinalAllocation/>}/>  
        <Route path='/professor_student_request' element={<Professor_student_request/>}/> 
        <Route path='/dept_view_allocations' element={<Dept_view_allocatoins/>}/> 
      
      </Routes>
    </>
  )
}

export default App
