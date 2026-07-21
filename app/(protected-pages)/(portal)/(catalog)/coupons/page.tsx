"use client";

import CouponsTable from "@/components/coupons/CouponsTable";
import { AddButton, FloatingAddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";
import useToggle from "@/hooks/UseToggle";

import CouponFormModal from "@/components/coupons/CouponFormModal";

export default function CouponsPage() {
    const [openDiscountForm, toggleDiscountForm] = useToggle();
    return (
        <div>
            <div className="py-8 px-8 flex justify-between w-full">
                <div className=" flex items-center gap-2">
                    <AppSearch />
                </div>
                <div className=" flex gap-x-5 ">
                    <div className="hidden md:block">
                        <AddButton onClick={toggleDiscountForm} label="New Coupon" />
                    </div>
                </div>
            </div>

            <CouponFormModal open={openDiscountForm} toggle={toggleDiscountForm} />
            <FloatingAddButton onClick={toggleDiscountForm} label="New Coupon" />

            <CouponsTable />
        </div>
    );
}
