"use client";
import React, { useEffect, useState } from "react";
import styles from "./TherapistWallet.module.css";
import {
  Bank,
  ArrowDown,
  Plus,
  Wallet,
  CreditCard,
  Clock,
  Eye,
  EyeClosed,
} from "@phosphor-icons/react/dist/ssr";
import { formatCurrency } from "@/app/utils";

function TherapistWallet({ therapistData }) {
  console.log(therapistData);
  const [activeTab, setActiveTab] = useState("overview");
  const [showBalance, setShowBalance] = useState(true);
  const [showAddBankModal, setShowAddBankModal] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport on load and resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check initially
    checkIfMobile();

    // Add event listener
    window.addEventListener("resize", checkIfMobile);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  const walletData = {
    balance: 5240.75,
    pendingPayouts: 680.5,
    totalEarned: 12475.25,
    recentTransactions: [
      {
        id: 1,
        date: "Apr 24, 2025",
        amount: 320.0,
        status: "completed",
        type: "payout",
      },
      {
        id: 2,
        date: "Apr 15, 2025",
        amount: 450.0,
        status: "completed",
        type: "earning",
      },
      {
        id: 3,
        date: "Apr 08, 2025",
        amount: 680.5,
        status: "pending",
        type: "payout",
      },
      {
        id: 4,
        date: "Mar 28, 2025",
        amount: 320.0,
        status: "completed",
        type: "earning",
      },
      {
        id: 5,
        date: "Mar 14, 2025",
        amount: 450.0,
        status: "completed",
        type: "payout",
      },
    ],
    bankAccounts: [
      { id: 1, name: "Chase Bank", accountNumber: "****6789", isDefault: true },
      {
        id: 2,
        name: "Bank of America",
        accountNumber: "****4321",
        isDefault: false,
      },
    ],
  };

  const toggleShowBalance = () => setShowBalance(!showBalance);

  const handleWithdraw = () => {
    // Implement withdrawal logic
    alert("Withdrawal request submitted!");
  };

  return (
    <div className={styles.walletContainer}>
      <div className={styles.walletWrapper}>
        <div className={styles.walletHeader}>
          <h1 className={styles.walletTitle}>Financial Dashboard</h1>
          <button className={styles.withdrawButton} onClick={handleWithdraw}>
            <ArrowDown weight="bold" />
            Withdraw Funds
          </button>
        </div>

        <div className={styles.balanceCards}>
          <div className={styles.mainBalanceCard}>
            <div className={styles.balanceHeader}>
              <h2>Available Balance</h2>
              <button className={styles.eyeButton} onClick={toggleShowBalance}>
                {showBalance ? <EyeClosed size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className={styles.balanceAmount}>
              {showBalance
                ? formatCurrency(therapistData[0]?.balance)
                : "••••••"}
            </div>
            <div className={styles.balanceActions}>
              <button className={styles.actionButton}>
                <ArrowDown size={18} />
                Withdraw
              </button>
            </div>
          </div>

          <div className={styles.statsCards}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Clock weight="fill" size={isMobile ? 18 : 20} />
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>Pending</div>
                <div className={styles.statValue}>
                  {formatCurrency(therapistData[0]?.pending)}
                </div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Wallet weight="fill" size={isMobile ? 18 : 20} />
              </div>
              <div className={styles.statInfo}>
                <div className={styles.statLabel}>Total Earnings</div>
                <div className={styles.statValue}>
                  {formatCurrency(therapistData[0]?.total_earning)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tabContainer}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tabButton} ${
                activeTab === "overview" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "transactions" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("transactions")}
            >
              Transactions
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "bankAccounts" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("bankAccounts")}
            >
              Payment Methods
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === "overview" && (
              <div className={styles.overviewContent}>
                <h3 className={styles.sectionTitle}>Recent Activity</h3>
                <div className={styles.transactionList}>
                  {walletData.recentTransactions
                    .slice(0, 3)
                    .map((transaction) => (
                      <div
                        key={transaction.id}
                        className={styles.transactionItem}
                      >
                        <div className={styles.transactionIcon}>
                          {transaction.type === "payout" ? (
                            <ArrowDown
                              weight="fill"
                              className={styles.payoutIcon}
                              size={isMobile ? 16 : 18}
                            />
                          ) : (
                            <Plus
                              weight="fill"
                              className={styles.earningIcon}
                              size={isMobile ? 16 : 18}
                            />
                          )}
                        </div>
                        <div className={styles.transactionInfo}>
                          <div className={styles.transactionTitle}>
                            {transaction.type === "payout"
                              ? "Withdrawal"
                              : "Session Payment"}
                          </div>
                          <div className={styles.transactionDate}>
                            {transaction.date}
                          </div>
                        </div>
                        <div className={styles.transactionAmount}>
                          <div
                            className={`${styles.amount} ${
                              transaction.type === "earning"
                                ? styles.earning
                                : ""
                            }`}
                          >
                            {transaction.type === "earning" ? "+" : "-"}
                            {formatCurrency(transaction.amount)}
                          </div>
                          <div
                            className={`${styles.status} ${
                              styles[transaction.status]
                            }`}
                          >
                            {transaction.status}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* <h3 className={styles.sectionTitle}>Payment Methods</h3>
                <div className={styles.bankAccountsList}>
                  {walletData.bankAccounts.map((account) => (
                    <div key={account.id} className={styles.bankAccount}>
                      <div className={styles.bankIcon}>
                        <Bank weight="fill" />
                      </div>
                      <div className={styles.bankInfo}>
                        <div className={styles.bankName}>{account.name}</div>
                        <div className={styles.accountNumber}>
                          {account.accountNumber}
                        </div>
                      </div>
                      {account.isDefault && (
                        <div className={styles.defaultTag}>Default</div>
                      )}
                    </div>
                  ))}
                  <button
                    className={styles.addBankButton}
                    onClick={() => setShowAddBankModal(true)}
                  >
                    <Plus size={20} />
                    Add Payment Method
                  </button>
                </div> */}
              </div>
            )}

            {activeTab === "transactions" && (
              <div className={styles.transactionsContent}>
                <div className={styles.transactionFilters}>
                  <select className={styles.filterSelect}>
                    <option>All Transactions</option>
                    <option>Withdrawals</option>
                    <option>Earnings</option>
                  </select>
                  <select className={styles.filterSelect}>
                    <option>Last 30 days</option>
                    <option>Last 90 days</option>
                    <option>This year</option>
                    <option>All time</option>
                  </select>
                </div>

                <div className={styles.fullTransactionList}>
                  {walletData.recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className={styles.transactionItem}
                    >
                      <div className={styles.transactionIcon}>
                        {transaction.type === "payout" ? (
                          <ArrowDown
                            weight="fill"
                            className={styles.payoutIcon}
                          />
                        ) : (
                          <Plus weight="fill" className={styles.earningIcon} />
                        )}
                      </div>
                      <div className={styles.transactionInfo}>
                        <div className={styles.transactionTitle}>
                          {transaction.type === "payout"
                            ? "Withdrawal"
                            : "Session Payment"}
                        </div>
                        <div className={styles.transactionDate}>
                          {transaction.date}
                        </div>
                      </div>
                      <div className={styles.transactionAmount}>
                        <div
                          className={`${styles.amount} ${
                            transaction.type === "earning" ? styles.earning : ""
                          }`}
                        >
                          {transaction.type === "earning" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <div
                          className={`${styles.status} ${
                            styles[transaction.status]
                          }`}
                        >
                          {transaction.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "bankAccounts" && (
              <div className={styles.bankAccountsContent}>
                <h3 className={styles.sectionTitle}>Your Payment Methods</h3>
                <div className={styles.bankAccountsFullList}>
                  {walletData.bankAccounts.map((account) => (
                    <div key={account.id} className={styles.bankAccountCard}>
                      <div className={styles.bankCardHeader}>
                        <div className={styles.bankIconLarge}>
                          <Bank weight="fill" />
                        </div>
                        <div className={styles.bankDetailsPrimary}>
                          <div className={styles.bankNameLarge}>
                            {account.name}
                          </div>
                          <div className={styles.accountNumberLarge}>
                            {account.accountNumber}
                          </div>
                        </div>
                        {account.isDefault && (
                          <div className={styles.defaultTagLarge}>Default</div>
                        )}
                      </div>
                      <div className={styles.bankCardActions}>
                        <button className={styles.bankCardButton}>
                          {account.isDefault ? "Default" : "Set as Default"}
                        </button>
                        <button className={styles.bankCardButton}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    className={styles.addBankButtonLarge}
                    onClick={() => setShowAddBankModal(true)}
                  >
                    <Plus size={24} />
                    <span>Add New Payment Method</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {showAddBankModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalHeader}>
                <h3>Add Payment Method</h3>
                <button
                  className={styles.closeButton}
                  onClick={() => setShowAddBankModal(false)}
                >
                  ×
                </button>
              </div>
              <div className={styles.modalContent}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bank Name</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter bank name"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Account Number</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter account number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Routing Number</label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter routing number"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Account Type</label>
                  <select className={styles.formSelect}>
                    <option value="">Select account type</option>
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
                <div className={styles.modalActions}>
                  <button
                    className={styles.cancelButton}
                    onClick={() => setShowAddBankModal(false)}
                  >
                    Cancel
                  </button>
                  <button className={styles.addButton}>
                    Add Payment Method
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TherapistWallet;
