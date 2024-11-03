import { useState, useEffect } from 'react';
import { 
  Users,
  Plus,
  //Search,
  Lock,
  Unlock,
 // User,
  Share2,
  Loader,
 // Laptop ,
 Trash2 
} from 'lucide-react';
import roomService from '../hooks/room';
import CreateRoomDialog from './Dashboard/createRoom';
import { useSearchQuery } from '../hooks/SearchQuery';
import './Dashboard/Dashboard.css';
import Navbar from '../components/Navbar';
import { useDispatch } from 'react-redux';
import { setMyRoomsF, setAllRooms } from '../redux/slices/roomSlice';
import { useNavigate } from 'react-router-dom';

const loadUserIdFromLocalStorage = () => {
    try {
        const serializedUser = localStorage.getItem('user');
        if (serializedUser) {
            const user = JSON.parse(serializedUser);
            return user.id;
        }
        return null;
    } catch (e) {
      console.error("Could not load user ID from local storage", e);
      return null;
    }
};

const Dashboard = () => {
  const userId = loadUserIdFromLocalStorage();
  const [myRooms, setMyRooms] = useState([]);
  const [publicRooms, setPublicRooms] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState({
    myRooms: true,
    publicRooms: true
  });
  const [error, setError] = useState({
    myRooms: null,
    publicRooms: null
  });
  //const [searchQuery, setSearchQuery] = useState('');
  const [createRoomDialogOpen, setCreateRoomDialogOpen] = useState(false);
  const [roomData, setRoomData] = useState({
    name: '',
    description: '',
    privacy: 'public',
    maxMembers: 10,
    ownerId: userId
  });
  const { searchQuery } = useSearchQuery();
  const [isRoomCreationLoading, setIsRoomCreationLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();  

   const showRoomDetails=({room})=>{
    navigate(`/room-details/${room.id}`, { state: { room } });
   }

  useEffect(() => {
    const fetchMyRooms = async () => {
      try {
        const data = await roomService.getMyRooms(userId);
        setMyRooms(data.rooms);
        dispatch(setMyRoomsF(data.rooms));
        setLoading(prev => ({ ...prev, myRooms: false }));
      } catch (err) {
        console.error('Failed to load my rooms:', err);
        setError(prev => ({ 
          ...prev, 
          myRooms: 'Failed to load your rooms. Please try again.' 
        }));
        setLoading(prev => ({ ...prev, myRooms: false }));
      }
    };

    fetchMyRooms();
  }, [userId, dispatch],);

  useEffect(() => {
    const fetchPublicRooms = async () => {
      try {
        const data = await roomService.getAllRooms();
        setPublicRooms(data.rooms);
        dispatch(setAllRooms(data.rooms));
        setLoading(prev => ({ ...prev, publicRooms: false }));
      } catch (err) {
        console.error('Failed to load public rooms:', err);
        setError(prev => ({ 
          ...prev, 
          publicRooms: 'Failed to load rooms. Please try again.' 
        }));
        setLoading(prev => ({ ...prev, publicRooms: false }));
      }
    };

    fetchPublicRooms();
  }, [dispatch]);

  const handleJoinRoom = async (roomId) => {
    try {
     // await roomService.joinRoom(roomId);
      window.location.href = `/room/${roomId}`;
    } catch (err) {
      console.error('Failed to join room:', err);
    }
  };
  const handleDeleteRoom = async (roomId) => {
    try {
      await roomService.deleteRoom(roomId);
      setMyRooms(prev => prev.filter(room => room.id !== roomId));
      setPublicRooms(prev => prev.filter(room => room.id !== roomId));
    } catch (err) {
      console.error('Failed to delete room:', err);
    }
  };
  const handleCreateRoom = async () => {
    try {
      setIsRoomCreationLoading(true);
      const createdRoom = await roomService.createRoom(roomData);
      setMyRooms(prev => [...prev, createdRoom]);
      if(!createdRoom.isPrivate){
        setPublicRooms(prev => [...prev, createdRoom]);
      }
      setIsRoomCreationLoading(false);
      setCreateRoomDialogOpen(false); // Close dialog after creating room
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  const handleRoomDataChange = (e) => {
    const { name, value } = e.target;
    setRoomData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredPublicRooms = Array.isArray(publicRooms) ? publicRooms.filter((room) => {
    const matchesSearch = room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          room.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || filter === room.privacy;
    return matchesSearch && matchesFilter;
  }) : [];

  return (
    <div className="dashboard">
      <Navbar />

      <main className="main-content">
        <section className="rooms-section">
          <div className="section-header">
            <h2 className="section-title">My Rooms</h2>
          </div>
          
          {loading.myRooms ? (
            <div className="loading-container">
              <Loader className="loading-spinner" />
            </div>
          ) : error.myRooms ? (
            <div className="error-message">
              {error.myRooms}
            </div>
          ) : (
            <div className="rooms-grid">
              {myRooms.map(room => (
                <div key={room.id} className="room-card"
                  onClick={() => showRoomDetails({room})}
                >
                  <div className="room-card-header">
                    <h3 className="room-name">{room.name}</h3>
                    <div className="header-icons">
                {room.privacy === 'private' ? 
                    <Lock className="privacy-icon" /> :
                    <Unlock className="privacy-icon" />
                }
                
                <Trash2 
                    className="delete-icon"
                    onClick={(e) => {
                        e.stopPropagation(); 
                        handleDeleteRoom(room.id);
                    }}
                    style={
                        { cursor: 'pointer', 
                          color: 'red',
                        } 
                    }
                />
            </div>
                  </div>
                  <p className="room-description">{room.description}</p>
                  <div className="member-count">
                    <Users className="member-icon" />
                    <span>{room.memberCount}/{room.maxMembers} members</span>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinRoom(room.id)}}
                      className="join-button"
                    >
                      Join Room
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}`);
                      }}
                      className="share-button"
                    >
                      <Share2 />
                    </button>
                  </div>
                </div>
              ))}
              <div 
                onClick={() => setCreateRoomDialogOpen(true)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '200px',
                  height: '150px',
                  border: '2px dashed #888',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, backgroundColor 0.2s',
                  backgroundColor: '#f9f9f9',
                  color: '#555',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  margin: '10px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div 
                  style={{
                    fontSize: '40px',
                    color: '#007bff',
                    marginBottom: '10px',
                  }}
                >
                  <Plus />
                </div>
                <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Create New Room</span>
              </div>
            </div>
          )}
        </section>

        <section className="rooms-section">
          <div className="section-header">
            <h2 className="section-title">Public Rooms</h2>
            <div className="filter-buttons">
              <button
                onClick={() => setFilter('all')}
                className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('public')}
                className={`filter-button ${filter === 'public' ? 'active' : ''}`}
              >
                Public
              </button>
              <button
                onClick={() => setFilter('private')}
                className={`filter-button ${filter === 'private' ? 'active' : ''}`}
              >
                Private
              </button>
            </div>
          </div>
          
          {loading.publicRooms ? (
            <div className="loading-container"
            >
              <Loader className="loading-spinner" />
            </div>
          ) : error.publicRooms ? (
            <div className="error-message">
              {error.publicRooms}
            </div>
          ) : (
            <div className="rooms-grid"
            >
              {filteredPublicRooms.map(room => (
                <div key={room.id} className="room-card"
                onClick={() => showRoomDetails({room})}
                >
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
                     onClick={(e) => {
                      e.stopPropagation();
                      handleJoinRoom(room.id)}}
                    className="join-button"
                  >
                    Join Room
                  </button>
                  <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        navigator.clipboard.writeText(`${window.location.origin}/room/${room.id}`);
                      }}
                      className="share-button"
                    >
                      <Share2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Create Room Dialog */}
      <CreateRoomDialog
        isOpen={createRoomDialogOpen}
        onClose={() => setCreateRoomDialogOpen(false)}
        roomData={roomData}
        onChange={handleRoomDataChange}
        onCreate={handleCreateRoom}
        isLoading={isRoomCreationLoading}
      />
    </div>
  );
};

export default Dashboard;
