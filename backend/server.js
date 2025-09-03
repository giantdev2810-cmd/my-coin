// Express server for MyCoin API
const express = require("express");
const Blockchain = require("./blockchain");
const Wallet = require("./wallet");
const Transaction = require("./transaction");

const app = express();
app.use(express.json());
const cors = require("cors");
app.use(cors());

const wallets = [];
const transactions = [];
// Cho phép chọn consensus khi khởi tạo blockchain, mặc định là PoW
let blockchain = new Blockchain("pow", wallets);

// API: Chọn cơ chế xác thực cho blockchain
app.post("/blockchain/consensus", (req, res) => {
  const { consensus } = req.body; // 'pow' hoặc 'pos'
  if (consensus !== "pow" && consensus !== "pos") {
    return res.status(400).json({ error: 'Consensus must be "pow" or "pos"' });
  }
  blockchain = new Blockchain(consensus, wallets);
  res.json({ status: "success", consensus });
});

// Create wallet
app.post("/wallet/create", (req, res) => {
  const wallet = new Wallet();
  // Nếu là ví đầu tiên, cấp 1000 coin
  if (wallets.length === 0) {
    wallet.balance = 1000;
  }
  wallets.push(wallet);
  res.json(wallet);
});

// Get all wallets
app.get("/wallets", (req, res) => {
  res.json(wallets);
});

// Send coin (cho phép chọn consensus cho block này)
app.post("/transaction/send", (req, res) => {
  const { fromAddress, toAddress, amount, consensus } = req.body;
  // Kiểm tra số dư ví gửi
  const sender = wallets.find((w) => w.publicKey === fromAddress);
  if (!sender) {
    return res.status(400).json({ error: "Không tìm thấy ví gửi." });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Số lượng coin không hợp lệ." });
  }
  if ((sender.balance ?? 0) < amount) {
    return res.status(400).json({ error: "Số dư không đủ để gửi coin." });
  }
  // Trừ số dư ví gửi, cộng số dư ví nhận
  sender.balance -= amount;
  const receiver = wallets.find((w) => w.publicKey === toAddress);
  if (receiver) {
    receiver.balance += amount;
  }
  const tx = new Transaction(fromAddress, toAddress, amount);
  transactions.push(tx);
  try {
    blockchain.addBlock(tx, consensus);
    res.json({ status: "success", tx });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all transactions
app.get("/transactions", (req, res) => {
  res.json(transactions);
});

// Get blockchain
app.get("/blockchain", (req, res) => {
  res.json(blockchain.chain);
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`MyCoin backend running on port ${PORT}`);
});
