import { useContext } from "react";
import Register from "./Register";
import { UserContext } from "./UserContext";

export default function Routes() {
    const{username, id} = useContext(UserContext);

    if (username){
        return 'You are logged in!'
    }
    
    return(
        <Register />
    );
}