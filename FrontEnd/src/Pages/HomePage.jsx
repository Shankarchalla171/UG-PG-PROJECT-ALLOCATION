import { useContext } from "react";
import { AuthContext } from "../Context/AuthContext";   
const HomePage = () =>{
    const{isloggedIn,email,password,role,token,authDispatch} = useContext(AuthContext);
    console.log(isloggedIn,email,role,token,password);
    return(

        <>
           <h1>this is the home page....</h1>
        </>
    )
}

export default HomePage;