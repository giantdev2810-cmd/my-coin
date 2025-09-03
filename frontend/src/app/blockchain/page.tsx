"use client";
import { useEffect, useState } from "react";
import { Table } from "antd";

function formatTime(ts: number) {
  const now = Date.now();
  const diff = Math.floor((now - ts) / 1000); // giây
  if (diff < 60) return `${diff} giây trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  return new Date(ts).toLocaleString();
}

export default function BlockchainPage() {
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:3000/blockchain");
        if (!res.ok) throw new Error("Không lấy được thông tin blockchain");
        const data = await res.json();
        setBlocks(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBlocks();
  }, []);

  const columns = [
    { title: "#", dataIndex: "index", key: "index" },
    { title: "Hash", dataIndex: "hash", key: "hash" },
    {
      title: "Previous Hash",
      dataIndex: "previousHash",
      key: "previousHash",
    },
    {
      title: "Data",
      dataIndex: "data",
      key: "data",
      render: (data: any) => JSON.stringify(data),
    },
    {
      title: "Nonce",
      dataIndex: "nonce",
      key: "nonce",
      align: "right" as const,
      width: 100,
    },
    {
      title: "Validator",
      dataIndex: "validator",
      key: "validator",
      render: (v: any) => v || "-",
      align: "right" as const,
      width: 120,
    },
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (ts: number) => formatTime(ts),
      align: "right" as const,
      width: 140,
    },
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-4">Blockchain</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="w-full max-w-4xl">
        <Table
          columns={columns}
          dataSource={blocks}
          rowKey={(block) => block.hash}
          pagination={false}
          locale={{ emptyText: "Chưa có block nào." }}
          style={{ tableLayout: "fixed", wordBreak: "break-word" }}
        />
      </div>
    </main>
  );
}
