"use client";
import { useEffect, useState } from "react";
import { Table } from "antd";

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWallets = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("http://localhost:3000/wallets");
        if (!res.ok) throw new Error("Không lấy được danh sách ví");
        const data = await res.json();
        setWallets(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWallets();
  }, []);

  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    { title: "Public Key", dataIndex: "publicKey", key: "publicKey" },
    {
      title: "Số dư",
      dataIndex: "balance",
      key: "balance",
      align: "right" as const,
    },
  ];

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-4">Thống kê tài khoản</h2>
      {loading && <div>Đang tải...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="w-full max-w-3xl">
        <Table
          columns={columns}
          dataSource={wallets}
          rowKey="publicKey"
          pagination={false}
          locale={{ emptyText: "Chưa có ví nào." }}
          style={{ tableLayout: "fixed", wordBreak: "break-word" }}
        />
      </div>
    </main>
  );
}
