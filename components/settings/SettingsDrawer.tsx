"use client";

import Link from "next/link";
import { Button } from "antd";
import { LuSettings } from "react-icons/lu";

export default function SettingsDrawer() {
  return (
    <Link href="/settings">
      <Button shape="circle" title="settings">
        <LuSettings className="!text-gray-600" />
      </Button>
    </Link>
  );
}
