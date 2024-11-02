import { Route, Navigate } from "react-router-dom";
import PropTypes from "prop-types";

const AuthenticatedRoute = ({ element, ...rest }) => {
    const token = localStorage.getItem("token"); 

    return (
        <Route
            {...rest}
            element={token ? element : <Navigate to="/" replace />}
        />
    );
};

export default AuthenticatedRoute;


AuthenticatedRoute.propTypes = {
    element: PropTypes.element.isRequired, 
};