import InfoBar from "@/components/infobar";
import BillingSettings from "@/components/settings/billing-setting";
import ChangePassword from "@/components/settings/change-password";
import DarkModetoggle from "@/components/settings/dark-mode";
import React from "react";
export const dynamic = "force-dynamic";

type Props = {};

const Page = async (props: Props) => {
  return (
    <>
      <InfoBar />
      <div className="overflow-y-auto w-full chat-window flex-1 h-0 flex flex-col gap-10">
        <BillingSettings />
        <DarkModetoggle />
        <ChangePassword />
      </div>
    </>
  );
};

export default Page;
