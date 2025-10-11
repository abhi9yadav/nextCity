import LoginSignupForms from "../components/signUpLoginForm/LoginSignupForm";

const LoginSignupPage = () => {
    return (
        <div className="login-signup-page" style={{background: "linear-gradient(98deg, #fdfdfd, #f3f7ff)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <LoginSignupForms />
        </div>
    );
};

export default LoginSignupPage;
