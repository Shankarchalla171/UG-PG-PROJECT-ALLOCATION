import React from 'react'
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import projects from '../../public/dummyData/projects';

const SubmitApplication = ()=>{
    const {id} = useParams();
    const [project, setProject] = useState([]);

    useEffect(()=>{
        //fetch the project details using the id and set it to project state
        const selectedProject = projects.find(proj => proj.id === parseInt(id));
        setProject(selectedProject);
    },[id])
    console.log(id);

    return(
        <>
           this is the application page..
        </>
    )
}

export default SubmitApplication;