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
  constructor(consensus = "pow", wallets = []) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.consensus = consensus; // 'pow' hoặc 'pos'
    this.wallets = wallets; // Danh sách ví để chọn validator cho PoS
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
    // Chọn validator ngẫu nhiên dựa trên số dư (stake)
    if (!this.wallets || this.wallets.length === 0) {
      throw new Error("No wallets available for PoS");
    }
    // Tính tổng stake
    const totalStake = this.wallets.reduce(
      (sum, w) => sum + (w.balance || 0),
      0
    );
    if (totalStake === 0) {
      // Nếu chưa có ai có coin, chọn ngẫu nhiên
      const validator =
        this.wallets[Math.floor(Math.random() * this.wallets.length)].publicKey;
      return this._createStakeBlock(data, validator);
    }
    // Chọn validator theo tỉ lệ stake
    let r = Math.random() * totalStake;
    let acc = 0;
    let validator = null;
    for (const w of this.wallets) {
      acc += w.balance || 0;
      if (r <= acc) {
        validator = w.publicKey;
        break;
      }
    }
    if (!validator) validator = this.wallets[0].publicKey;
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
}

module.exports = Blockchain;
