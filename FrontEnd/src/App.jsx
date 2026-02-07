import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import {Routes, Route} from 'react-router-dom';
import ProfessorCreateProject from './pages/Professor_create_project';
import Professor_dashboard from './pages/Professor_dashboard';
import ProfessorViewProjects from './pages/Professors_projects';
import ProjectListing from './Pages/ProjectListing';
import SubmitApplication from './pages/SubmitAppliation';
import YourApplications from './pages/YourApplications';


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
      </Routes>
    </>
  )
}

export default App
