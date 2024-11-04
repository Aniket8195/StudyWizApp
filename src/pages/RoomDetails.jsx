import Navbar from "../components/Navbar";
// import { useLocation } from "react-router-dom";
import { 
    Users,
    Lock,
    Unlock,
    Share2,
    Loader
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../pages/Dashboard/Dashboard.css';
import { useState, useEffect } from "react";
import { roomService } from './../hooks/Room';

const RoomDetails = () => {
    const roomId=window.location.pathname.split("/")[2];
    const [room, setRoom] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        setLoading(true);
        const fetchRoom = async () => {
            try {
                const room = await roomService.getRoom(roomId);
                setRoom(room);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch room:', err);
            }
        }
        fetchRoom();
    }
    , [roomId]);

    const handleJoinRoom = async (roomId) => {
        try {
            await roomService.joinRoom(roomId);
            window.location.href = `/room/${roomId}`;
        } catch (err) {
            console.error('Failed to join room:', err);
        }
    };
    
    const handleShareRoom = async () => {
        await navigator.clipboard.writeText(`${window.location.origin}/room-details/${room.id}`);
        toast.success("Link has been copied to clipboard!");
    };

    if (loading) {
      return (
          <div className="room-details-container">
              <Navbar />
              <div className="loading-container">
                  <Loader className="loading-spinner" />
                  <p>Loading room details...</p>
              </div>
          </div>
      );
  }

    return (
         
        <div className="room-details-container">
            <Navbar />
            <div className="room-card">
                <div className="room-card-header">
                    <h3 className="room-name">{room.name}</h3>
                    {room.privacy === 'private' ? 
                        <Lock className="privacy-icon" /> :
                        <Unlock className="privacy-icon" />
                    }
                </div>
                <p className="room-description">{room.description}</p>
                <div className="member-count">
                    <Users className="member-icon" />
                    <span>{room.memberCount}/{room.maxMembers} members</span>
                </div>
                <div className='button-container'>
                    <button
                        onClick={() => handleJoinRoom(room.id)}
                        className="join-button"
                    >
                        Join Room
                    </button>
                    <button
                        onClick={handleShareRoom}
                        className="share-button"
                    >
                        <Share2 />
                    </button>
                </div>
            </div>
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                style={{ marginTop: '60px' }} 
            />
        </div>
    );
}

export default RoomDetails;