import { Component, createEffect, createSignal, Show } from "solid-js";
import AuthForm from "../components/AuthForm";
import { api } from "../lib/api";

interface Profile {
  id: string;
  email: string;
  created_at: string;
}

const Home: Component = () => {
  const [profile, setProfile] = createSignal<Profile | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  createEffect(() => {
    const token = localStorage.getItem("fb_id_token");
    if (!token) return;

    setLoading(true);
    api<Profile>("/me")
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  });

  return (
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Show when={!profile()} fallback={<div>{JSON.stringify(profile())}</div>}>
        <AuthForm />
      </Show>

      <Show when={loading()}>
        <p class="text-center">Loading profile…</p>
      </Show>

      <Show when={error()}>
        <p class="text-red-600">{error()}</p>
      </Show>
    </div>
  );
};

export default Home;