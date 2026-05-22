"use client";

import StoreTeamFormModal from "@/components/team/StoreTeamFormModal";
import { AddButton } from "@/components/ui/AppButtons";
import { AppSearch } from "@/components/ui/AppSearchInput";

import StoreTeamTable from "@/components/team/StoreTeamTable";
import useToggle from "@/hooks/UseToggle";

const page = () => {
    const [openTeamMemberForm, toggleTeamMemberForm] = useToggle();
    return (
        <div>
            <div className="py-8   px-8 flex justify-between w-full">
                <div className=" w-[30%] ">
                    <AppSearch />
                </div>
                <div className=" flex gap-x-5 ">
                    <AddButton onClick={toggleTeamMemberForm} label="Add Member" />
                </div>
            </div>

            <StoreTeamTable />
            <StoreTeamFormModal toggle={toggleTeamMemberForm} open={openTeamMemberForm} />
        </div>
    );
};

export default page;
