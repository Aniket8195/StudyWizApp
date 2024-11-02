import PropTypes from 'prop-types';

const CreateRoomDialog = (props) => {
    const { isOpen, roomData, onClose, onChange, onCreate, isLoading } = props;
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '10px',
        width: '400px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
      }}>
        <h2 style={{ marginBottom: '15px' }}>Create Room</h2>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Name:</label>
          <input 
            type="text" 
            name="name" 
            value={roomData.name}
            onChange={onChange} 
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginTop: '5px'
            }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Description:</label>
          <input 
            type="text" 
            name="description" 
            value={roomData.description}
            onChange={onChange} 
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginTop: '5px'
            }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Privacy:</label>
          <select 
            name="privacy"
            value={roomData.privacy}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginTop: '5px'
            }}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Max Members:</label>
          <input 
            type="number" 
            name="maxMembers" 
            value={roomData.maxMembers}
            onChange={onChange}
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              marginTop: '5px'
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button 
            onClick={onClose} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#ccc',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button 
            onClick={onCreate} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isLoading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </div>
    </div>
  );
}
CreateRoomDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  roomData: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    privacy: PropTypes.string,
    maxMembers: PropTypes.number
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired
};

export default CreateRoomDialog;


