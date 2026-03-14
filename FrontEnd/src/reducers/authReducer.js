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
                teamRole:action.payload.teamRole,
            }
        }
        case "setRole":{
            console.log(action.payload);
            return{
                ...state,
                role:action.payload,
            }
        }

        case "setTeam":{
            console.log(action.payload);
            return{
                ...state,
                teamRole:action.payload,
            }
        }
        case "logout":{
            return{
                ...state,
                isloggedIn:false,
                email:null,
                teamRole:null,
                token:null,
                role:null,
            }
        }


        default:{
            return state;
        }
    }
}