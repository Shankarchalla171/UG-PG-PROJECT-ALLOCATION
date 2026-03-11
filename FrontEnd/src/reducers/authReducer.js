export const authReducer = (state, action) =>{
    switch(action.type){
        case "setEmail":{
            return{
                ...state,
                email:action.payload
            }
        }


        case "loginSuccess":{
            console.log(action.payload.role);
            return{
                ...state,
                isloggedIn:true,
                email:action.payload.email,
                role:action.payload.role,
                token:action.payload.token,
            }
        }
        case "setRole":{
            console.log(action.payload);
            return{
                ...state,
                role:action.payload
            }
        }
        case "logout":{
            return{
                ...state,
                isloggedIn:false,
                email:null,
                token:null,
                role:null,
            }
        }

        default:{
            return state;
        }
    }
}