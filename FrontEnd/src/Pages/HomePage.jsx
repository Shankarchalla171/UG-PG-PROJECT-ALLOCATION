import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";   
import Navbar from "../Components/Navbar";
import Sidebar from "../Components/Sidebar";
const HomePage = () =>{
    const{isloggedIn,email,password,role,token,authDispatch} = useContext(AuthContext);
    console.log(isloggedIn,email,role,token,password);
    return(

        <>
          <main className="h-screen">
             <Navbar/>
             <div className="flex h-full">
                <Sidebar/>
                <div>
                    <h1>this is the content....</h1>
                </div>
             </div>
          </main>
           
        </>
    )
}

export default HomePage;