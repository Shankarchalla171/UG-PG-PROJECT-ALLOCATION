import { createContext } from "react";
import { useReducer } from "react";
import { authReducer } from "../Reducers/authReducer";

const initialState = {
    isloggedIn: false,
    email: null,
    password: null,
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