# 🌟 Stellar Soroban Token Staking Platform

## 📖 Project Description
<img width="1917" height="937" alt="Screenshot 2026-03-25 113111" src="https://github.com/user-attachments/assets/061f3e87-1cc2-4e4c-a44b-e0b3a7ee54a4" />
<img width="1919" height="902" alt="Screenshot 2026-03-25 134826" src="https://github.com/user-attachments/assets/7d9c4902-a8e2-4d73-839b-f917e0103325" />


This project is a basic decentralized token staking smart contract built using Soroban on the Stellar network. It allows users to stake tokens, track their staking data, and withdraw their funds securely.

The goal of this project is to provide a foundational staking mechanism that can be extended with rewards, penalties, and advanced DeFi features.

---

## ⚙️ What It Does
- Users can stake tokens into the contract.
- The contract records the staked amount along with the timestamp.
- Users can withdraw their staked tokens at any time.
- Anyone can query staking data for a given user.

---

## 🚀 Features
- 🔐 Secure user authentication using Soroban's `require_auth`
- 📦 Persistent on-chain storage of staking data
- ⏱️ Timestamp tracking for future reward logic
- 🔍 Read-only stake querying
- ♻️ Simple and extendable architecture for:
  - Reward distribution
  - Lock-up periods
  - Slashing mechanisms
  - Multi-token support

---

## 🔗 Deployed Smart Contract Link
https://stellar.expert/explorer/testnet/contract/CBICVIMBIC3ANDBLCADGBQOLIQIFIUD34FXCGPUA3SSN2EPO3GJQ6ER4

---

## 🛠️ Tech Stack
- Rust (Soroban SDK)
- Stellar Soroban Smart Contracts

---

## 📌 Future Improvements
- Add staking rewards (APY logic)
- Introduce lock-in periods
- Support multiple tokens
- Frontend integration (React / Next.js)
- Events for better indexing

---

## 🧑‍💻 Author
Your Name

---

## 📜 License
MIT
