import { useState } from 'react';
import LoginPage from './Pages/LoginPage';
import HomePage from './Pages/HomePage';
import {Routes, Route} from 'react-router-dom';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <h1>UG/PG PROJECT ALLOCATION LOADING......</h1> */}
      <Routes>
        <Route path='/' element={<LoginPage/>}/>
        <Route path='/home' element={<HomePage/>}/>
      </Routes>
    </>
  )
}

export default App
