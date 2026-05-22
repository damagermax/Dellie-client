"use client";

import { AddButton } from "@/components/ui/AppButtons";
import WalletFormModal from "@/components/wallet/WalletFormModel";
import useToggle from "@/hooks/UseToggle";
import React from "react";

export default function WalletPage() {
  const [openWalletModal, toggleOpenWalletModal] = useToggle();

  return (
    <div>
      <div>
        <div className="">
          <h3 className=" px-8 pageTittle ">Cash Book</h3>

          <hr className=" border-gray-200/80" />
        </div>
      </div>

      <div className=" flex items-center px-8 py-5   justify-between">
        <p className="   text-lg">Wallets</p>

        <AddButton onClick={toggleOpenWalletModal} label="New Wallet " />
      </div>

      <section className="px-8  grid grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="  p-3 bg-gray-50 rounded-md border items-center border-gray-100 border-solid">
          <p>Cash Balance</p>
          <p className=" text-3xl">GHS 100,000.00</p>
        </div>
        <div className="  p-3 bg-gray-50 rounded-md border items-center border-gray-100 border-solid">
          <p>Bank Balance</p>
          <p className=" text-3xl">GHS 100,000.00</p>
        </div>

        <div className="  p-3 bg-gray-50 rounded-md border items-center border-gray-100 border-solid">
          <p>MTN MOMO Balance</p>
          <p className=" text-3xl">GHS 100,000.00</p>
        </div>
      </section>

      <section className=" grid grid-cols-2 ">
        <div></div>
        <div>
          <p className=" text-center py-20 text-gray-500">Wallets</p>
        </div>
      </section>

      {openWalletModal && <WalletFormModal toggle={toggleOpenWalletModal} open={openWalletModal} />}
    </div>
  );
}
