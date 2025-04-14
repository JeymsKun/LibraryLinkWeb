import React from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../../css/Dashboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const DashboardHome = () => {
  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr"],
    datasets: [
      {
        label: "Books Borrowed",
        data: [5, 20, 15, 10],
        backgroundColor: ["#ff6384", "#ffcd56", "#4bc0c0", "#36a2eb"],
      },
    ],
  };

  const pieData = {
    labels: ["Available Books 60%", "Borrowed Books 40%"],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: ["#4bc0c0", "#36a2eb"],
      },
    ],
  };

  return (
    <div>
      <div className="cards-container">
        <div className="bigbutton">
          <button className="big-card">
            <div className="text-content">
              <p>Total Books</p>
              <h2>55.6%</h2>
            </div>
            <span className="card-icon">📚</span>
          </button>
        </div>
        {[
          { label: "Borrowed", value: "22.2%", icon: "📦" },
          { label: "Unreturned", value: "5.6%", icon: "⏰" },
          { label: "Returned", value: "16.7%", icon: "✅" },
          { label: "Users", value: "50", icon: "👥" },
        ].map((card, index) => (
          <div className="smallbutton" key={index}>
            <button className="small-card">
              <div className="small-text">
                <p>{card.label}</p>
                <h2>{card.value}</h2>
              </div>
              <span className="card-icon">{card.icon}</span>
            </button>
          </div>
        ))}
      </div>

      <div className="main-content">
        <div className="charts">
          <div className="chart-container">
            <h4>Borrowing trends</h4>
            <Bar data={barData} />
          </div>

          <div className="chart-container">
            <Pie data={pieData} />
          </div>

          <div className="activity-feed">
            <h3>Recent Activity Feed</h3>
            <p>
              John Doe borrowed "Flutter Guide Book"
              <br />
              <small>2 hours ago</small>
            </p>
            <p>
              System synced water meter data
              <br />
              <small>3 hours ago</small>
            </p>
            <p>
              New user "Anna" registered
              <br />
              <small>4 hours ago</small>
            </p>
            <p>
              Book "Data Science 101" returned
              <br />
              <small>5 hours ago</small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
