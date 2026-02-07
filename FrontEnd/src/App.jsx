import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import {Routes, Route} from 'react-router-dom';


function App() {
  

  return (
    <>
      
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/home' element={<HomePage/>}/>
      </Routes>
    </>
  )
}

export default App
