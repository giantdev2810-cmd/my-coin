"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Form, Input, Select, Button, Card } from "antd";

export default function SendCoinPage() {
  const [accounts, setAccounts] = useState<
    { publicKey: string; privateKey: string }[]
  >([]);
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [amount, setAmount] = useState(0);
  const [consensus, setConsensus] = useState<"pow" | "pos">("pow");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Lấy danh sách tài khoản đã lưu
    const acc = JSON.parse(localStorage.getItem("mycoin_accounts") || "[]");
    setAccounts(acc);
    if (acc.length > 0) setFromAddress(acc[0].publicKey);
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3000/transaction/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fromAddress, toAddress, amount, consensus }),
      });
      if (!res.ok) {
        const errData = await res.json();
        toast.error(errData.error || "Gửi coin thất bại");
        setLoading(false);
        return;
      }
      await res.json();
      toast.success("Giao dịch thành công!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-4">Gửi coin</h2>
      <Card className="w-full max-w-md" title="Gửi coin" bordered>
        <Form layout="vertical" onSubmitCapture={handleSend}>
          <Form.Item label="Chọn tài khoản gửi (Public Key)" required>
            <Select
              value={fromAddress}
              onChange={setFromAddress}
              placeholder="Chọn tài khoản gửi"
              showSearch
              optionFilterProp="children"
            >
              {accounts.map((acc) => (
                <Select.Option key={acc.publicKey} value={acc.publicKey}>
                  {acc.publicKey}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="Địa chỉ nhận (Public Key)" required>
            <Input
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="Nhập địa chỉ nhận"
            />
          </Form.Item>
          <Form.Item label="Số lượng coin" required>
            <Input
              type="number"
              value={amount}
              min={1}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Nhập số lượng coin"
            />
          </Form.Item>
          <Form.Item label="Thuật toán xác thực" required>
            <Select
              value={consensus}
              onChange={(v) => setConsensus(v as "pow" | "pos")}
            >
              <Select.Option value="pow">Proof of Work (PoW)</Select.Option>
              <Select.Option value="pos">Proof of Stake (PoS)</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Gửi coin
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
}
