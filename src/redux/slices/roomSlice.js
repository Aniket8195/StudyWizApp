import { createSlice } from '@reduxjs/toolkit';

const roomSlice = createSlice({
  name: 'room',
  initialState: {
    myRooms: [],
    allRooms: [],
    currentRoom: null,
  },
  reducers: {
    setMyRoomsF: (state, action) => {
      state.myRooms = action.payload;
    },
    setAllRooms: (state, action) => {
      state.allRooms = action.payload;
    },
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
  },
});

export const { setMyRoomsF, setCurrentRoom, setAllRooms } = roomSlice.actions;
export default roomSlice.reducer;
