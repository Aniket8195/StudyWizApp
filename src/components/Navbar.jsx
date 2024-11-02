import { 
    Search,
    User,
    Laptop
  } from 'lucide-react';
import { useSearchQuery } from '../hooks/SearchQuery';
import { useNavigate } from 'react-router-dom';

import '../pages/Dashboard/Dashboard.css';

export default function Navbar(){
  const navigate=useNavigate();

    const { setSearchQuery,searchQuery } = useSearchQuery();
    const handleOnClick = () => {
      navigate('/dashboard');
    }
    return <nav className="navbar">
    <div className="navbar-container">
      <div className="navbar-brand"
      onClick={handleOnClick}
      >
        <Laptop />
        <span className="brand-name">Study Wiz</span>
      </div>
      <div className="navbar-actions">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search rooms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <Search className="search-icon" />
        </div>
        <div className="user-avatar">
          <User />
        </div>
      </div>
    </div>
  </nav>
}