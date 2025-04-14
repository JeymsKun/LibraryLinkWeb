import React, { useState, useEffect } from "react";
import "../../css/Transaction.css";

const Dashboard = () => {
  const [status, setStatus] = useState("All");
  const [dateTime, setDateTime] = useState({
    dayName: "",
    fullDate: "",
    currentTime: "",
  });

  useEffect(() => {
    function updateDateTime() {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const now = new Date();
      const day = now.getDay();
      const date = now.getDate();
      const month = now.getMonth();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");

      setDateTime({
        dayName: dayNames[day],
        fullDate: `${monthNames[month]} ${date} Today`,
        currentTime: `${displayHour}:${displayMinutes}${ampm}`,
      });
    }

    updateDateTime();
    const intervalId = setInterval(updateDateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const handleStatusSelect = (selectedStatus) => {
    setStatus(selectedStatus);
  };

  return (
    <div className="container">
      <div className="content-wrapper">
        <div className="left-panel">
          {/* DateTime */}
          <div className="date-box">
            <h3 id="dayName">{dateTime.dayName}</h3>
            <div className="date-time-row">
              <div className="date-time">
                <span id="fullDate">{dateTime.fullDate}</span>
                <span id="currentTime">{dateTime.currentTime}</span>
              </div>
              <div className="icon">📅</div>
            </div>
          </div>

          {/* Dropdown */}
          <div className="custom-select-wrapper">
            <div className="custom-select" id="dropdown">
              <div
                className="select-trigger"
                onClick={() =>
                  setStatus((prev) => (prev === "open" ? "closed" : "open"))
                }
              >
                Status Filter ▼
              </div>
              {["All", "Borrowed", "Returned", "Overdue"].includes(status) && (
                <div className="options">
                  {["All", "Borrowed", "Returned", "Overdue"].map((s) => (
                    <div
                      key={s}
                      className="option"
                      onClick={() => handleStatusSelect(s)}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transaction Section */}
        <div className="right-panel">
          <h2>RECENT TRANSACTIONS</h2>
          {[
            {
              title: "Atomic Habits",
              borrower: "John Doe",
              borrowDate: "Apr 1, 2025",
              dueDate: "Apr 7, 2025",
              status: "Borrowed",
              actionText: "Mark as Returned",
            },
            {
              title: "Deep Work",
              borrower: "Jane Smith",
              borrowDate: "Mar 28, 2025",
              dueDate: "Apr 3, 2025",
              status: "Overdue",
              actionText: "Send Reminder",
            },
          ].map((tx, index) => (
            <div className="transaction-card" key={index}>
              <p>📖 Book Title: "{tx.title}"</p>
              <p>👤 Borrower: {tx.borrower}</p>
              <p>
                📅 Borrowed: {tx.borrowDate} | Due: {tx.dueDate}
              </p>
              <p>⏱️ Status: [ {tx.status} ]</p>
              <p className="action-link">[ {tx.actionText} ]</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
