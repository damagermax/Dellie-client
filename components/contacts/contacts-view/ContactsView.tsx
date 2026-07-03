import ContactsTable from "./ContactsTable";
import { useGetContactsQuery } from "@/lib/redux/services";
import { ContactQueryParams } from "@/types/contact";

import { AppViewLoader } from "@/components/ui/AppViewLoader";
import { AppNotFoundView } from "@/components/ui/AppNotFoundView";
import AppPaginationFooter from "@/components/ui/AppPaginationFooter";
import ContactsMobileList from "../ContactsMobileList";
import MobileInfiniteScrollFooter from "@/components/ui/MobileInfiniteScrollFooter";
import MobileListShimmer from "@/components/ui/MobileListShimmer";
import { useMobileInfiniteList } from "@/hooks/useMobileInfiniteList";

interface ContactsViewProps {
  query: ContactQueryParams;
  onQueryChange: (query: ContactQueryParams | ((current: ContactQueryParams) => ContactQueryParams)) => void;
}

export default function ContactsView({ query, onQueryChange }: ContactsViewProps) {
  const { data: contactsData, isLoading: loadingContacts, isFetching } = useGetContactsQuery(query, { refetchOnMountOrArgChange: true });
  const meta = contactsData?.meta;
  const mobileList = useMobileInfiniteList({ query, response: contactsData, isFetching, setQuery: onQueryChange });

  return (
    <>
      <div className="hidden md:block">
        <AppViewLoader loading={loadingContacts} />
      </div>
      <AppNotFoundView dataLength={contactsData?.data.length || 0} loading={loadingContacts} entity={"Contact"} query={query} />

      <div className="hidden md:block">
        <ContactsTable contacts={contactsData?.data || []} pagination={false} />
        <AppPaginationFooter entity="contacts" dataLength={contactsData?.data?.length || 0} meta={meta} page={contactsData?.page || query.page} limit={contactsData?.limit || query.limit} total={contactsData?.total} onChange={(page, limit) => onQueryChange((current) => ({ ...current, page, limit }))} />
      </div>
      {loadingContacts ? <MobileListShimmer /> : <ContactsMobileList contacts={mobileList.items} />}
      <MobileInfiniteScrollFooter entity="contacts" dataLength={mobileList.items.length} hasNextPage={mobileList.hasNextPage} isFetching={isFetching && !loadingContacts} sentinelRef={mobileList.sentinelRef} onLoadMore={mobileList.loadNextPage} />
    </>
  );
}
