import { createContext } from "react";
import { useReducer } from "react";
import { authReducer } from "../reducers/authReducer";
import student from "../../public/dummyData/student";

const initialState = {
    isloggedIn: false,
    email:"",
    password: "",
    role: null,
    token: null,
};

export const AuthContext= createContext();

export const AuthProvider =({children}) =>{
    const [state, authDispatch] = useReducer(authReducer, initialState);

    return (
        <AuthContext.Provider value={{...state, authDispatch}}>
            {children}
        </AuthContext.Provider>
    );
}