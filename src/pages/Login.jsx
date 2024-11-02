import {useState} from "react";
import { useAppDispatch } from "../redux/hooks";
import { loginUser } from "../redux/actions/authActions";
import {  useNavigate } from "react-router-dom";



export default function Login() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);


    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); 
    
        try {
         
          const response = await dispatch(loginUser({ email, password }));
          console.log('Response:', response);
          console.log(response);
          if (response.payload) {
            console.log(response.payload);
            localStorage.setItem('token', response.payload.token);
            localStorage.setItem('user', JSON.stringify(response.payload.user)); 
            navigate('/dashboard'); 
          }

        } catch (error) {
          console.error('Login failed:', error.message);
        } finally {
          setLoading(false);
        }
    };
    const handleRegister = (e) => {
        e.preventDefault();
        navigate('/register');
    }
    
    return (
        <div style={styles.container}>
        <div style={styles.formContainer}>
           <h2 style={styles.header1}>Study Wiz</h2>
          <h2 style={styles.header}>Login</h2>
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
            <button 
              type="submit" 
              style={styles.button} 
              disabled={loading} // Step 3: Disable button during loading
            >
              {loading ? 'Logging in...' : 'Login'} {/* Loading text */}
            </button>
          </form>
          <button 
              style={styles.button1}
              onClick={handleRegister} 
            >
            Register
            </button>
        </div>
      </div>
    );
}

const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f7fa',
    },
    formContainer: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '40px 30px',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
      textAlign: 'center',
      width: '300px',
    },
    header1:{
        fontSize: '44px',
        color: '#333333',
        marginBottom: '20px',
        fontWeight: 'bold',
    },
    header: {
      fontSize: '24px',
      color: '#333333',
      marginBottom: '20px',
      fontWeight: 'bold',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
    },
    input: {
      marginBottom: '15px',
      padding: '12px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      outline: 'none',
      fontSize: '16px',
      color: '#333333',
      backgroundColor: '#fafafa',
      transition: 'border-color 0.2s ease-in-out',
    },
    button: {
      padding: '12px',
      backgroundColor: '#3f51b5',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 'bold',
      transition: 'background-color 0.2s ease-in-out',
    },
    button1:{
        padding: '12px',
        marginTop: '10px',
        backgroundColor: '#3f51b5',
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'background-color 0.2s ease-in-out',
      },
  };
  
  // Hover effect for button
  styles.button[':hover'] = {
    backgroundColor: '#5c6bc0',
  };
  
  styles.input[':focus'] = {
    borderColor: '#3f51b5',
  };
  