// Blockchain logic for MyCoin

class Block {
  constructor(index, previousHash, timestamp, data, hash, nonce, validator) {
    this.index = index;
    this.previousHash = previousHash;
    this.timestamp = timestamp;
    this.data = data;
    this.hash = hash;
    this.nonce = nonce;
    this.validator = validator || null; // Chỉ dùng cho PoS
  }
}

class Blockchain {
  constructor(consensus = "pow", wallets = [], utxos = []) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.consensus = consensus; // 'pow' hoặc 'pos'
    this.wallets = wallets; // Danh sách ví để chọn validator cho PoS
    this.utxos = utxos; // Danh sách UTXO để PoS dùng tính stake
  }

  createGenesisBlock() {
    return new Block(0, "0", Date.now(), "Genesis Block", "0", 0);
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(data, consensus = null) {
    // Cho phép chọn cơ chế xác thực khi thêm block
    const method = consensus || this.consensus;
    if (method === "pow") {
      return this.mineBlock(data);
    } else if (method === "pos") {
      return this.stakeBlock(data);
    } else {
      throw new Error("Consensus method not supported");
    }
  }

  calculateHash(block) {
    return require("crypto")
      .createHash("sha256")
      .update(
        block.index +
          block.previousHash +
          block.timestamp +
          JSON.stringify(block.data) +
          block.nonce +
          (block.validator || "")
      )
      .digest("hex");
  }

  mineBlock(data) {
    const previousBlock = this.getLatestBlock();
    let nonce = 0;
    let hash = "";
    let timestamp = Date.now();
    do {
      hash = require("crypto")
        .createHash("sha256")
        .update(
          previousBlock.index +
            previousBlock.hash +
            timestamp +
            JSON.stringify(data) +
            nonce
        )
        .digest("hex");
      nonce++;
    } while (
      hash.substring(0, this.difficulty) !==
      Array(this.difficulty + 1).join("0")
    );
    const newBlock = new Block(
      previousBlock.index + 1,
      previousBlock.hash,
      timestamp,
      data,
      hash,
      nonce
    );
    this.chain.push(newBlock);
    return newBlock;
  }

  stakeBlock(data) {
    // Chọn validator ngẫu nhiên dựa trên số dư (stake) tính qua UTXO
    if (!this.wallets || this.wallets.length === 0) {
      throw new Error("No wallets available for PoS");
    }
    // Tính tổng stake qua UTXO
    const stakes = this.wallets.map((w) => ({
      publicKey: w.publicKey,
      stake: this._getWalletStake(w.publicKey),
    }));
    const totalStake = stakes.reduce((sum, s) => sum + s.stake, 0);

    let validator;
    if (totalStake === 0) {
      // Nếu chưa có ai có coin, chọn ngẫu nhiên
      validator =
        this.wallets[Math.floor(Math.random() * this.wallets.length)].publicKey;
    } else {
      // Chọn validator theo tỉ lệ stake
      let r = Math.random() * totalStake;
      let acc = 0;
      for (const s of stakes) {
        acc += s.stake;
        if (r <= acc) {
          validator = s.publicKey;
          break;
        }
      }
      if (!validator) validator = this.wallets[0].publicKey;
    }
    return this._createStakeBlock(data, validator);
  }

  _createStakeBlock(data, validator) {
    const previousBlock = this.getLatestBlock();
    let nonce = 0;
    let timestamp = Date.now();
    const hash = require("crypto")
      .createHash("sha256")
      .update(
        previousBlock.index +
          previousBlock.hash +
          timestamp +
          JSON.stringify(data) +
          nonce +
          validator
      )
      .digest("hex");
    const newBlock = new Block(
      previousBlock.index + 1,
      previousBlock.hash,
      timestamp,
      data,
      hash,
      nonce,
      validator
    );
    this.chain.push(newBlock);
    return newBlock;
  }

  // Tính stake của ví dựa vào UTXO chưa dùng
  _getWalletStake(publicKey) {
    if (!this.utxos) return 0;
    return this.utxos
      .filter((u) => u.toAddress === publicKey && !u.spent)
      .reduce((sum, u) => sum + u.amount, 0);
  }
}

module.exports = Blockchain;
