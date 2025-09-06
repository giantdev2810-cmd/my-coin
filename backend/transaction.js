// Transaction logic for MyCoin
class Transaction {
  constructor(fromAddress, toAddress, amount, inputs = [], outputs = []) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
    this.inputs = inputs; // Danh sách UTXO id đã dùng
    this.outputs = outputs; // Danh sách UTXO mới tạo ra
    this.timestamp = Date.now();
  }
}

module.exports = Transaction;
