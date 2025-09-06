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

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:3000/transactions");
        if (!res.ok) throw new Error("Không lấy được lịch sử giao dịch");
        const data = await res.json();
        setTransactions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    { title: "Người gửi", dataIndex: "fromAddress", key: "fromAddress" },
    { title: "Người nhận", dataIndex: "toAddress", key: "toAddress" },
    {
      title: "Số lượng",
      dataIndex: "amount",
      key: "amount",
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
      <h2 className="text-2xl font-bold mb-4">Lịch sử giao dịch</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="w-full max-w-4xl">
        <Table
          columns={columns}
          dataSource={transactions}
          rowKey={(tx) => tx.timestamp + tx.fromAddress + tx.toAddress}
          pagination={false}
          locale={{ emptyText: "Chưa có giao dịch nào." }}
          style={{ tableLayout: "fixed", wordBreak: "break-word" }}
        />
      </div>
    </main>
  );
}
