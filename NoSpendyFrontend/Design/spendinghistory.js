import React from "react";
import "./spendinghistory.css";


const Spendinghistory = () => {
  return (
    <div className="spendinghistory">
      <h1>Spending History</h1>

      <div className="component">
        <div className="chart-box">
          <img src= "monthoverview.png" alt="Monthly Overview" className="overview-image" />
        </div>
      </div>


      <div className="component transactions-container">
        <div className="transactions-box">
          <h4>Transactions</h4>
          <div className="transactions-table">
            <div className="transactions-header">
              <div className="col checkbox"></div>
              <div className="col name">Name</div>
              <div className="col category">Category</div>
              <div className="col date">Date</div>
              <div className="col amount">Amount</div>
            </div>

            <div className="transactions-row">
              <div className="col checkbox"><input type="checkbox" /></div>
              <div className="col name">Payment 1</div>
              <div className="col category">Food</div>
              <div className="col date">Jan 2, 2022</div>
              <div className="col amount">$83.22</div>
            </div>

            <div className="transactions-row">
              <div className="col checkbox"><input type="checkbox" /></div>
              <div className="col name">Payment 2</div>
              <div className="col category">Entertainment</div>
              <div className="col date">Jan 2, 2022</div>
              <div className="col amount">$183.22</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Spendinghistory;
