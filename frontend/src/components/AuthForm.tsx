import { Component, createSignal, Show } from "solid-js";
import {
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logout
} from "../lib/firebase";

const AuthForm: Component = () => {
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [mode, setMode] = createSignal<"login" | "signup">("login");
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    try {
      if (mode() === "login") {
        await loginWithEmail(email(), password());
      } else {
        await registerWithEmail(email(), password());
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div class="max-w-md w-full space-y-4 p-6 bg-white rounded shadow">
      <h2 class="text-xl font-semibold text-center">
        {mode() === "login" ? "Sign in" : "Create account"}
      </h2>

      <form onSubmit={handleSubmit} class="space-y-3">
        <input
          type="email"
          placeholder="Email"
          class="w-full border px-3 py-2 rounded"
          value={email()}
          onInput={(e) => setEmail(e.currentTarget.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          class="w-full border px-3 py-2 rounded"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
          required
        />
        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {mode() === "login" ? "Login" : "Sign up"}
        </button>
      </form>

      <button
        onClick={handleGoogle}
        class="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
      >
        Continue with Google
      </button>

      <div class="text-center text-sm">
        {mode() === "login"
          ? "No account? "
          : "Already have an account? "}
        <a
          href="#"
          class="text-blue-500 underline"
          onClick={() => setMode(mode() === "login" ? "signup" : "login")}
        >
          {mode() === "login" ? "Sign up" : "Log in"}
        </a>
      </div>

      {error() && (
        <p class="text-red-600 text-center">{error()}</p>
      )}

      {/* Show logout button if logged in */}
      <Show when={localStorage.getItem("fb_id_token")}>
        <button
          onClick={handleLogout}
          class="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
        >
          Logout
        </button>
      </Show>
    </div>
  );
};

export default AuthForm;