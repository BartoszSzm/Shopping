import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../css/Login.module.css";

const Login = () => {
  const API_URL = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  // Get csrf token
  const [csrfToken, setCsrfToken] = useState("");
  useEffect(() => {
    axios
      .get(API_URL + "/csrf-token")
      .then((response) => setCsrfToken(response.data.csrf_token))
      .catch(() => alert("Cannot get csrf token, authentication will fail"));
  }, []);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Form submission handler
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const config = { headers: { "X-CSRF-TOKEN": csrfToken } };

    const payload = new URLSearchParams();
    payload.append("username", username);
    payload.append("password", password);

    await axios
      .post(API_URL + "/token", payload, config)
      .then(() => navigate("/"))
      .catch((err) => toast.error(err));
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="username">
            Username
          </label>
          <input
            className={styles.input}
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="password">
            Password
          </label>
          <input
            className={styles.input}
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className={styles.button} type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
