import { useState } from "react";

const API_URL: string = "http://localhost:8000";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handeLogin = async (): Promise<void> => {
    setError("");
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Correo o contraseña incorrectos");
        return;
      }

      localStorage.setItem("token", data.access_token);
      localStorage.setItem("idusuario", data.idusuario.toString());
      localStorage.setItem("nombre", data.nombre);
      localStorage.setItem("apellidopaterno", data.apellidopaterno);
      localStorage.setItem("apellidomaterno", data.apellidomaterno);
      localStorage.setItem("correo", data.correo);
      localStorage.setItem("activo", data.activo.toString());
      localStorage.setItem("iddepartamento", data.iddepartamento.toString());
      localStorage.setItem("idrol", data.idrol.toString());

      // Reemplaza esto con tu navegación, ej: navigate("/dashboard")
      alert("Login exitoso!");
      window.location.href = "/dashboard";
    } catch {
      setError("No se pudo conectar al servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "white",
        fontFamily: "sans-serif",
      }}
    >
        <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "1rem 2.5rem",
        }}
      >
        <img
          src="/images/banortelogo.png"
          alt="Banorte"
          style={{ height: 70, objectFit: "contain" }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "0rem 5rem",
        }}
      >
        

      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "2rem 5rem",
          gap: "4rem",
        }}
      >
        <div style={{ flex: 1, maxWidth: 420 }}>
          <h1
            style={{
              color: "#EB0029",
              fontSize: 48,
              fontWeight: 700,
              margin: "0 0 2.5rem",
            }}
          >
            Bienvenido!
          </h1>

          <div style={{ marginBottom: "1rem" }}>
            <input
              type="email"
              placeholder="Correo Electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                borderRadius: 8,
                border: "none",
                borderBottom: "2px solid #ccc",
                background: "#f5f5f5",
                fontSize: 15,
                outline: "none",
                color: "#111",
              }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 16px",
                borderRadius: 8,
                border: "none",
                borderBottom: "2px solid #ccc",
                background: "#f5f5f5",
                fontSize: 15,
                outline: "none",
                color: "#111",
              }}
            />
          </div>

          {error !== "" && (
            <p style={{ color: "#EB0029", fontSize: 13, marginBottom: "1rem" }}>
              {error}
            </p>
          )}

          <button
            onClick={handeLogin}
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              background: loading ? "#c0392b" : "#EB0029",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Cargando..." : "Ingresar"}
          </button>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {<img src="/images/DiagramaLogIn.png" />}
        </div>
      </div>
    </div>
    </div>
  );
}
