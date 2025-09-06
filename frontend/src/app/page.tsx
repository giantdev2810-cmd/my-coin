"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import WalletsPage from "./wallets/page";
import SendCoinPage from "./transaction/send/page";
import TransactionsPage from "./transactions/page";
import BlockchainPage from "./blockchain/page";
import ConsensusPage from "./consensus/page";
import CreateWalletPage from "./wallet/create/page";
import { Button, Table } from "antd";

const TABS = [
  { key: "dashboard", label: "Tổng quan" },
  { key: "wallets", label: "Thống kê tài khoản" },
  { key: "sendCoin", label: "Gửi coin" },
  { key: "transactions", label: "Lịch sử giao dịch" },
  { key: "blockchain", label: "Blockchain" },
  { key: "consensus", label: "Chọn PoW/PoS" },
];

export default function Home() {
  const [selectedTab, setSelectedTab] = useState("dashboard");
  const [walletCount, setWalletCount] = useState(0);
  const [txCount, setTxCount] = useState(0);
  const [blockCount, setBlockCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [userTxCount, setUserTxCount] = useState<number | null>(null);
  const [recentTxs, setRecentTxs] = useState<any[]>([]);
  const [showLogin, setShowLogin] = useState(false);
  const [accounts, setAccounts] = useState<
    { publicKey: string; privateKey: string }[]
  >([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const walletsRes = await fetch("http://localhost:3000/wallets");
        const wallets = await walletsRes.json();
        setWalletCount(wallets.length);
        const txRes = await fetch("http://localhost:3000/transactions");
        const txs = await txRes.json();
        setTxCount(txs.length);
        setRecentTxs(txs.slice(-5).reverse()); // 5 giao dịch gần nhất
        const blockRes = await fetch("http://localhost:3000/blockchain");
        const blocks = await blockRes.json();
        setBlockCount(blocks.length);
        // Nếu đã đăng nhập, lấy số dư và số giao dịch của tài khoản
        const current = localStorage.getItem("mycoin_current");
        if (current) {
          // Lấy số dư động từ API wallets (tính qua UTXO)
          const wallet = wallets.find((w: any) => w.publicKey === current);
          setBalance(wallet ? wallet.balance : 0);
          const userTxs = txs.filter(
            (tx: any) => tx.fromAddress === current || tx.toAddress === current
          );
          setUserTxCount(userTxs.length);
        } else {
          setBalance(null);
          setUserTxCount(null);
        }
      } catch {
        // ignore errors for demo
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
    // Kiểm tra trạng thái đăng nhập
    setLoggedIn(localStorage.getItem("mycoin_current"));
    window.addEventListener("storage", () => {
      setLoggedIn(localStorage.getItem("mycoin_current"));
    });
    // Lấy danh sách tài khoản đã tạo
    const acc = JSON.parse(localStorage.getItem("mycoin_accounts") || "[]");
    setAccounts(acc);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("mycoin_current");
    setLoggedIn(null);
  };

  const handleLogin = () => {
    if (selectedAccount) {
      localStorage.setItem("mycoin_current", selectedAccount);
      setLoggedIn(selectedAccount);
      setShowLogin(false);
    }
  };

  const reloadDashboard = () => {
    // Gọi lại fetchStats để cập nhật dữ liệu
    window.location.reload();
  };

  return (
    <div className="font-sans min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col py-8 px-4 gap-2 min-h-screen">
        <h1 className="text-2xl font-bold text-blue-700 mb-8 text-center">
          MyCoin
        </h1>
        {/* Thông tin đăng nhập phía trên các tab */}
        {loggedIn && (
          <div className="bg-green-50 p-2 rounded mb-4 text-xs break-all">
            <div className="mb-1">Đã đăng nhập:</div>
            <div className="font-mono">{loggedIn}</div>
          </div>
        )}
        {/* Các tab chức năng */}
        <div className="flex-1 flex flex-col gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition mb-1 ${
                selectedTab === tab.key
                  ? "bg-blue-600 text-white"
                  : "hover:bg-blue-100 text-gray-700"
              }`}
              onClick={() => setSelectedTab(tab.key)}
              disabled={tab.key === "createWallet" && !!loggedIn}
            >
              {tab.label}
              {tab.key === "createWallet" && loggedIn && (
                <span className="ml-2 text-xs text-gray-400">
                  (Chỉ khi đăng xuất)
                </span>
              )}
            </button>
          ))}
        </div>
        {/* Nút đăng xuất phía dưới các tab */}
        {loggedIn && (
          <button
            className="mt-6 px-4 py-2 bg-red-500 text-white rounded text-xs"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        )}
      </aside>
      {/* Main content */}
      <main className="flex-1 p-8">
        {selectedTab === "dashboard" && (
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-8 items-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-2">
              Tổng quan tài khoản
            </h2>
            {!loggedIn && (
              <div className="mb-6 w-full flex flex-col items-center gap-2">
                <Button
                  type="primary"
                  onClick={() => setShowLogin(true)}
                  className="mb-2"
                >
                  Đăng nhập bằng tài khoản đã tạo
                </Button>
                {showLogin && (
                  <div className="bg-white p-4 rounded shadow w-full max-w-md flex flex-col gap-2">
                    <label className="font-semibold mb-1">Chọn tài khoản</label>
                    <select
                      className="w-full border p-2 rounded mb-2"
                      value={selectedAccount}
                      onChange={(e) => setSelectedAccount(e.target.value)}
                    >
                      <option value="">-- Chọn tài khoản --</option>
                      {accounts.map((acc) => (
                        <option key={acc.publicKey} value={acc.publicKey}>
                          {acc.publicKey}
                        </option>
                      ))}
                    </select>
                    <button
                      className="px-4 py-2 bg-green-600 text-white rounded font-semibold"
                      onClick={() => {
                        handleLogin();
                        reloadDashboard();
                      }}
                      disabled={!selectedAccount}
                    >
                      Đăng nhập
                    </button>
                    <button
                      className="mt-2 px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs"
                      onClick={() => setShowLogin(false)}
                    >
                      Đóng
                    </button>
                  </div>
                )}
                {/* Nút tạo ví mới nằm sát nút đăng nhập */}
                <CreateWalletPage onCreated={reloadDashboard} />
              </div>
            )}
            {loggedIn ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-8">
                <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                  <div className="text-lg font-semibold text-gray-700">
                    Số dư
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {loading
                      ? "..."
                      : typeof balance === "number"
                      ? balance.toLocaleString(undefined, {
                          maximumFractionDigits: 8,
                        })
                      : "0"}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                  <div className="text-lg font-semibold text-gray-700">
                    Số giao dịch
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {loading ? "..." : userTxCount ?? "0"}
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                  <div className="text-lg font-semibold text-gray-700">
                    Số block hệ thống
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mt-2">
                    {loading ? "..." : blockCount}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-8">
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                    <div className="text-lg font-semibold text-gray-700">
                      Số block hệ thống
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mt-2">
                      {loading ? "..." : blockCount}
                    </div>
                  </div>
                </div>
                <div className="w-full">
                  <h3 className="text-lg font-bold mb-2">Giao dịch gần đây</h3>
                  {/* Ant Design Table cho giao dịch gần đây */}
                  <div className="w-full max-w-2xl">
                    <Table
                      columns={[
                        {
                          title: "Từ (From)",
                          dataIndex: "fromAddress",
                          key: "fromAddress",
                        },
                        {
                          title: "Đến (To)",
                          dataIndex: "toAddress",
                          key: "toAddress",
                        },
                        {
                          title: "Số lượng",
                          dataIndex: "amount",
                          key: "amount",
                          align: "right" as const,
                          width: 100,
                        },
                        {
                          title: "Thời gian",
                          dataIndex: "timestamp",
                          key: "timestamp",
                          align: "right" as const,
                          width: 140,
                          render: (ts: number) => new Date(ts).toLocaleString(),
                        },
                      ]}
                      dataSource={recentTxs}
                      rowKey={(tx: any) =>
                        tx.timestamp + tx.fromAddress + tx.toAddress
                      }
                      pagination={false}
                      locale={{ emptyText: "Chưa có giao dịch nào." }}
                      style={{ tableLayout: "fixed", wordBreak: "break-word" }}
                    />
                  </div>
                </div>
              </>
            )}
            <div className="text-gray-500 text-sm">
              Chọn tab bên trái để thao tác các chức năng của hệ thống MyCoin.
            </div>
          </div>
        )}
        {selectedTab === "wallets" && <WalletsPage />}
        {selectedTab === "sendCoin" && <SendCoinPage />}
        {selectedTab === "transactions" && <TransactionsPage />}
        {selectedTab === "blockchain" && <BlockchainPage />}
        {selectedTab === "consensus" && <ConsensusPage />}
      </main>
    </div>
  );
}
