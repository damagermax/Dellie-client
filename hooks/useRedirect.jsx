import { useLocation, useNavigate } from "react-router-dom";

const useRedirect = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get the redirect query parameter from the URL
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get("redirect");

    // Function to handle redirection
    const redirectTo = (path = redirectPath) => {
        redirectPath && navigate(path, { replace: true });
    };

    return { redirectPath, redirectTo };
};

export default useRedirect;
