import { BrowserRouter as Router , Route, Routes, Navigate} from "react-router-dom"
import  Dashboard  from "./pages/Dashboard"
import  Room  from "./pages/Room"
import Login  from "./pages/Login"
import  Profile  from "./pages/Profile"
import Register from "./pages/Register"
import RoomDetails from "./pages/RoomDetails"


const AppRoutes=()=>{
    const token = localStorage.getItem("token");
    //console.log(token)
    return <Router>
        <Routes>
            <Route path="/" element={<Login/>}/>
            <Route path="/room" element={<Room/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/profile" element={<Profile/>}/>
            <Route path="/register" element={<Register/>}/>
            {/* <Route path="/room-details/:id" element={<RoomDetails />} /> */}
            <Route 
                    path="/room-details/:id" 
                    element={token ? <RoomDetails /> : <Navigate to="/" replace />} 
                />

        </Routes>
    </Router>
}

export default AppRoutes;