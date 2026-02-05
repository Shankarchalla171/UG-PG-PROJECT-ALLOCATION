export const authReducer = (state, action) =>{
    switch(action.type){
        case "setEmail":{
            return{
                ...state,
                email:action.payload
            }
        }

        case "setPassword":{
            return{
                ...state,
                password:action.payload
            }
        }

        case "loginSuccess":{
            return{
                ...state,
                isloggedIn:true,
                token:action.payload.token,
                role:action.payload.role,
            }
        }

        case "logout":{
            return{
                ...state,
                isloggedIn:false,
                email:null,
                token:null,
                role:null,
                password:null,
            }
        }

        default:{
            return state;
        }
    }
}