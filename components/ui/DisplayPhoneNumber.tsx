import React from "react";
import { parsePhoneNumberFromString, NumberFormat } from "libphonenumber-js";

interface PhoneDisplayProps {
  phone: string;
}

import ReactCountryFlag from "react-country-flag";

export function PhoneDisplay({ phone }: PhoneDisplayProps) {
  const phoneNumber = parsePhoneNumberFromString(`+${phone}`);

  if (!phoneNumber) return <span>{phone}</span>;

  return (
    <div className="flex items-center gap-2">
      <div
        style={{
          width: "15px",
          height: "15px",
          borderRadius: "50%",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ReactCountryFlag countryCode={phoneNumber.country as string} svg style={{ objectFit: "cover", width: "100%", height: "100%" }} />
      </div>
      <span>{phoneNumber.format("INTERNATIONAL")}</span>
    </div>
  );
}
