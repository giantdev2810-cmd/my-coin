"use client";
import { useState } from "react";

export default function ConsensusPage() {
  const [consensus, setConsensus] = useState<"pow" | "pos">("pow");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const handleSetConsensus = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://localhost:3000/blockchain/consensus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consensus }),
      });
      if (!res.ok) throw new Error("Cập nhật thuật toán thất bại");
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-4">Chọn thuật toán PoW/PoS</h2>
      <form
        className="bg-white p-6 rounded shadow w-full max-w-md flex flex-col gap-4"
        onSubmit={handleSetConsensus}
      >
        <div>
          <label className="block font-semibold mb-1">
            Thuật toán xác thực
          </label>
          <select
            className="w-full border p-2 rounded"
            value={consensus}
            onChange={(e) => setConsensus(e.target.value as "pow" | "pos")}
          >
            <option value="pow">Proof of Work (PoW)</option>
            <option value="pos">Proof of Stake (PoS)</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Đang cập nhật..." : "Cập nhật"}
        </button>
      </form>
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {result && (
        <div className="bg-green-50 p-4 rounded shadow mt-4 w-full max-w-md">
          <h3 className="font-bold mb-2">Đã cập nhật thuật toán!</h3>
          <div>
            <b>Thuật toán hiện tại:</b> {result.consensus}
          </div>
        </div>
      )}
    </main>
  );
}
