import React from "react";
import AppTable from "../ui/AppTable";
import { Divider } from "antd";

const PurchaseOrderExpenses = () => {
  const extraCosts = [
    {
      id: "1",
      expenseName: "Freight Shipping",
      paidTo: "DHL Logistics",
      allocationMethod: "By Quantity",
      amount: 120,
    },
    {
      id: "2",
      expenseName: "Import Duty",
      paidTo: "Ghana Customs",
      allocationMethod: "By Value",
      amount: 85,
    },
    {
      id: "3",
      expenseName: "Port Handling",
      paidTo: "Tema Port Authority",
      allocationMethod: "Equally",
      amount: 40,
    },
    {
      id: "4",
      expenseName: "Insurance",
      paidTo: "Enterprise Insurance",
      allocationMethod: "By Value",
      amount: 25,
    },
  ];

  const columns = [
    {
      title: "Expense",
      dataIndex: "expenseName",

      className: "!pl-8",
    },
    { title: "Paid To", dataIndex: "paidTo" },
    { title: "Allocation", dataIndex: "allocationMethod" },
    {
      title: "Amount",
      dataIndex: "amount",

      className: "!pr-8",
    },
  ];
  return (
    <div>
      <div className="px-8 py-3">
        <p className=" text-base  hidden">Extra Cost / Landed Cost</p>
        <p className=" text-xs ">Costs required to receive the goods (shipping, customs, handling). Not part of the supplier’s product price.</p>
      </div>

      <Divider className=" m-0! p-0!" />
      <AppTable columns={columns} dataSource={extraCosts} />
    </div>
  );
};

export default PurchaseOrderExpenses;
