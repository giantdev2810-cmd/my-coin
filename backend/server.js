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
let utxos = []; // Danh sách UTXO toàn hệ thống
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
  wallets.push(wallet);
  // Nếu là ví đầu tiên, cấp 1000 coin bằng UTXO
  if (wallets.length === 1) {
    const utxo = {
      id: Date.now().toString(),
      toAddress: wallet.publicKey,
      amount: 1000,
      spent: false,
    };
    utxos.push(utxo);
  }
  res.json(wallet);
});

// Get all wallets + balance theo UTXO
app.get("/wallets", (req, res) => {
  const result = wallets.map((w) => {
    const balance = utxos
      .filter((u) => u.toAddress === w.publicKey && !u.spent)
      .reduce((sum, u) => sum + u.amount, 0);
    return { ...w, balance };
  });
  res.json(result);
});

// Send coin (UTXO)
app.post("/transaction/send", (req, res) => {
  const { fromAddress, toAddress, amount, consensus } = req.body;
  const sender = wallets.find((w) => w.publicKey === fromAddress);
  if (!sender) {
    return res.status(400).json({ error: "Không tìm thấy ví gửi." });
  }
  if (typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({ error: "Số lượng coin không hợp lệ." });
  }
  // Tìm UTXO chưa dùng của ví gửi
  const senderUtxos = utxos.filter(
    (u) => u.toAddress === fromAddress && !u.spent
  );
  const total = senderUtxos.reduce((sum, u) => sum + u.amount, 0);
  if (total < amount) {
    return res.status(400).json({ error: "Số dư không đủ để gửi coin." });
  }
  // Chọn UTXO đủ số dư
  let usedUtxos = [];
  let accumulated = 0;
  for (const u of senderUtxos) {
    usedUtxos.push(u);
    accumulated += u.amount;
    if (accumulated >= amount) break;
  }
  // Đánh dấu UTXO đã dùng
  usedUtxos.forEach((u) => (u.spent = true));

  // Tạo output mới cho người nhận
  const receiverUtxo = {
    id: Date.now().toString() + Math.random(),
    toAddress,
    amount,
    spent: false,
  };
  utxos.push(receiverUtxo);

  // Nếu dư, trả lại cho người gửi
  if (accumulated > amount) {
    const changeUtxo = {
      id: Date.now().toString() + Math.random(),
      toAddress: fromAddress,
      amount: accumulated - amount,
      spent: false,
    };
    utxos.push(changeUtxo);
  }

  // Tạo transaction với input là các UTXO đã dùng, output là các UTXO mới
  const tx = new Transaction(
    fromAddress,
    toAddress,
    amount,
    usedUtxos.map((u) => u.id), // input
    [receiverUtxo] // output
  );
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
