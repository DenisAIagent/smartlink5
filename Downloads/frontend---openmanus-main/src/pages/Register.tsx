import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  // Redirige vers le backend pour l'OAuth GitHub
  const handleGitHubRegister = () => {
    window.location.href = "http://localhost:8000/auth/github"; // Modifie l'URL si besoin
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    try {
      const success = await register(email, password, confirmPassword);
      if (success) {
        navigate("/login");
      } else {
        setError("Erreur lors de l'inscription. Veuillez réessayer.");
      }
    } catch (err) {
      setError("Erreur réseau.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center items-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-4">Créer un compte</h1>
        <form className="space-y-4" onSubmit={handleRegister}>
          <div>
            <label className="block mb-1 text-sm font-semibold">Adresse e-mail</label>
            <input
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring"
              type="email"
              placeholder="Votre e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">Mot de passe</label>
            <input
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring"
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">Confirmer le mot de passe</label>
            <input
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring"
              type="password"
              placeholder="Confirmez le mot de passe"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="text-red-600 text-sm mt-2">{error}</div>
          )}
          <Button
            type="submit"
            className="w-full mt-2"
            disabled={loading}
          >
            {loading ? "Création du compte..." : "Créer un compte"}
          </Button>
        </form>
        <div className="my-4 flex items-center">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-2 text-gray-400 text-xs">ou</span>
          <hr className="flex-grow border-gray-300" />
        </div>
        <Button
          variant="outline"
          className="w-full flex items-center justify-center"
          onClick={handleGitHubRegister}
        >
          <img
            src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            alt="GitHub"
            className="w-5 h-5 mr-2"
          />
          S'enregistrer avec GitHub
        </Button>
        <div className="mt-6 text-center text-sm">
          Déjà un compte ?
          <a href="/login" className="text-blue-600 ml-1 hover:underline">
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
};

export default Register;
