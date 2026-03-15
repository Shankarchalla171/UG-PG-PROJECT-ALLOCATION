import { createContext, useEffect } from "react";
import { useReducer } from "react";
import { authReducer } from "../reducers/authReducer";
import student from "../../public/dummyData/student";

const initialState = {
    isloggedIn: false,
    email:"",
    role: null,
    teamRole:null,
    token: null,
};

function getInitialState(){
    const storedState=localStorage.getItem("Auth");
    return storedState?JSON.parse(storedState):initialState;
}
export const AuthContext= createContext();

export const AuthProvider =({children}) =>{
    const [state, authDispatch] = useReducer(authReducer, getInitialState());

    useEffect(()=>{
       localStorage.setItem("Auth",JSON.stringify(state));
    },[state])

    return (
        <AuthContext.Provider value={{...state, authDispatch}}>
            {children}
        </AuthContext.Provider>
    );
}