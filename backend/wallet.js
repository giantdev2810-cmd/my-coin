// Wallet logic for MyCoin
const crypto = require("crypto");

class Wallet {
  constructor() {
    this.privateKey = crypto.randomBytes(32).toString("hex");
    this.publicKey = crypto
      .createHash("sha256")
      .update(this.privateKey)
      .digest("hex");
    // Đã bỏ thuộc tính balance, số dư sẽ tính qua UTXO
  }
}

module.exports = Wallet;
