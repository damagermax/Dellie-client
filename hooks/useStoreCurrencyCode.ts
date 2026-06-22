import { useGetCurrencyQuery } from "@/lib/redux/services";
import { RootState } from "@/lib/redux/store";
import { useSelector } from "react-redux";

export function useStoreCurrencyCode() {
  const store = useSelector((state: RootState) => state.currentUser.store);
  const currencyId = useSelector((state: RootState) => state.currentUser.storeSettings.businessProfile.currencyId || state.currentUser.store?.currencyId || "");
  const { data: currency } = useGetCurrencyQuery(currencyId, { skip: !currencyId });

  return currency?.code || store?.settings.currency || "";
}
