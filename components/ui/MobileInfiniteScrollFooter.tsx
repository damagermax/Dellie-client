"use client";

import { Button } from "antd";
import { RefObject } from "react";
import MobileListShimmer from "./MobileListShimmer";

interface MobileInfiniteScrollFooterProps {
  entity: string;
  hasNextPage: boolean;
  isFetching: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onLoadMore: () => void;
  dataLength: number;
}

export default function MobileInfiniteScrollFooter({ entity, hasNextPage, isFetching, sentinelRef, onLoadMore, dataLength }: MobileInfiniteScrollFooterProps) {
  if (!dataLength) return <div ref={sentinelRef} className="md:hidden" />;

  return (
    <div ref={sentinelRef} className="md:hidden border-t border-gray-100">
      {isFetching ? (
        <MobileListShimmer rows={3} showAvatar={entity === "products" || entity === "contacts"} />
      ) : hasNextPage ? (
        <div className="px-4 py-5 text-center">
          <Button size="middle" className="!rounded-full !px-5" onClick={onLoadMore}>
            Load more
          </Button>
        </div>
      ) : (
        <p className="px-4 py-5 text-center text-sm text-gray-400">All {entity} loaded</p>
      )}
    </div>
  );
}
