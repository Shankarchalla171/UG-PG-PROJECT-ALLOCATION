import React from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'

const Student_teams=()=>{
    return(
        <>
          <Navbar/>
          <main className='flex'>
            <Sidebar/>
            <div className='p-4'>
                <button>
                    create team
                </button>
                <button>
                    join team
                </button>
            </div>
          </main>
        </>
    )
}

export default Student_teams