# MyCoin

Hệ thống tiền điện tử cá nhân mô phỏng Blockchain với giao diện web hiện đại, gồm các chức năng:

- Tạo ví (Wallet)
- Xem thống kê tài khoản
- Gửi coin cho địa chỉ khác
- Xem lịch sử giao dịch
- Chọn thuật toán Proof of Work/Proof of Stake cho blockchain
- Giao diện web thân thiện, hiện đại
- Ghi nhận quá trình làm việc lên Github
- Video hướng dẫn sử dụng

## Thành phần dự án

- `backend/`: Node.js, Express, xử lý blockchain, ví, giao dịch, thuật toán PoW/PoS
- `frontend/`: Next.js (TypeScript), Ant Design, Toastify, giao diện web tương tự MyEtherWallet và Etherscan
- `docs/`: Tài liệu tham khảo

## Công nghệ sử dụng

- Backend: Node.js, Express
- Frontend: Next.js, React, TypeScript, TailwindCSS, Ant Design, React Toastify

## Hướng dẫn sử dụng

### 1. Cài đặt

```bash
cd backend
npm install
cd ../frontend
npm install
```

### 2. Chạy hệ thống

- Chạy backend:
```bash
cd backend
npm run dev
```
- Chạy frontend:
```bash
cd frontend
npm run dev
```

Truy cập giao diện web tại: http://localhost:3001

### 3. Demo chức năng

- Tạo ví mới, lưu public key
- Đăng nhập, đăng xuất
- Gửi coin, kiểm tra số dư
- Xem lịch sử giao dịch, định dạng thời gian
- Xem blockchain, chọn PoW/PoS
- Thông báo popup khi lỗi/giao dịch thành công
- Giao diện bảng, form, nút sử dụng Ant Design

### 4. Video hướng dẫn

Video demo: https://youtu.be/05agi-CAH7o
