"use client";
import { useState } from "react";
import { Button, Alert } from "antd";

interface CreateWalletPageProps {
  onCreated?: () => void;
}

const CreateWalletPage: React.FC<CreateWalletPageProps> = ({ onCreated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateWallet = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3000/wallet/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Tạo ví thất bại");
      const data = await res.json();
      // Lưu public key vào localStorage
      const accounts = JSON.parse(
        localStorage.getItem("mycoin_accounts") || "[]"
      );
      accounts.push({ publicKey: data.publicKey, privateKey: data.privateKey });
      localStorage.setItem("mycoin_accounts", JSON.stringify(accounts));
      // Đăng nhập bằng public key vừa tạo
      localStorage.setItem("mycoin_current", data.publicKey);
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="primary"
        loading={loading}
        onClick={handleCreateWallet}
        className="px-6 py-2"
      >
        Tạo ví mới
      </Button>
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          className="mt-2"
          closable
          onClose={() => setError("")}
        />
      )}
    </>
  );
};

export default CreateWalletPage;
