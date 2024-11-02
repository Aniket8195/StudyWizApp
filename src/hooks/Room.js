import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/room-service'; 

export const roomService = {
  getMyRooms: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/user/${userId}`);
      console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching my rooms:', error);
      throw error;
    }
  },

  getAllRooms: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
     // console.log(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching public rooms:', error);
      throw error;
    }
  },

  joinRoom: async (roomId) => {
    try {
      await axios.post(`${API_BASE_URL}/rooms/${roomId}/join`, {}, {
        withCredentials: true,
      });
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  },

  createRoom: async (roomData) => {
    try {
      const newRoomData= {
        name: roomData.name,
        description: roomData.description,
        maxMembers: roomData.maxMembers,
        isPrivate: roomData.privacy==='Private' ? true : false,
        ownerId: roomData.ownerId
      }
      const response = await axios.post(`${API_BASE_URL}`, newRoomData);
      return response.data.room;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  },
  getRoom: async (roomId) => {
    try {
      console.log(roomId);
      const response = await axios.get(`${API_BASE_URL}/${roomId}`);
      return response.data.room;
    } catch (error) {
      console.error('Error fetching room:', error);
      throw error;
    }
  },
  deleteRoom: async (roomId) => {
      const user=localStorage.getItem('user');
      const ownerId=JSON.parse(user).id;
      console.log(user);
    try {
      
      console.log(ownerId);
      const response = await axios.delete(`${API_BASE_URL}/${roomId}?ownerId=${ownerId}`);
      console.log(response);
    } catch (error) {
      console.error('Error deleting room:', error);
      throw error;
    }
  },
};

export default roomService;
