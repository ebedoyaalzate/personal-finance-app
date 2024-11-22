/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = await res.json();
      console.log(data);
      setResponse(data.response);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="p-6 bg-black rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">AI Chat</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            className="w-full p-3 border rounded bg-black focus:outline-none focus:ring focus:ring-blue-300"
            placeholder="Enter your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={5}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            disabled={loading}
          >
            {loading ? "Loading..." : "Submit"}
          </button>
        </form>

        {error && <p className="text-red-500 mt-4">{error}</p>}
        {response && (
          <div className="mt-4 p-3 border rounded bg-black-50">
            <h2 className="text-lg font-bold">Response:</h2>
            <p>{response}</p>
          </div>
        )}
      </div>
    </main>
  );
}
