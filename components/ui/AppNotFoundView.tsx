import { Button } from "antd";

interface AppNotFoundViewProps {
  dataLength: number;
  loading: boolean;
  entity: string;
  query: Object;
}

export function AppNotFoundView({ dataLength, loading, entity, query }: AppNotFoundViewProps) {
  const isSearchEmpty = Object.values(query)?.filter(Boolean)?.length != 0;

  if (!loading && dataLength === 0) {
    return (
      <div className="flex flex-col items-center h-[50vh] justify-center text-center">
        <img src={isSearchEmpty ? "/images/not-found-bg.png" : "/images/empty-bg.png"} className="w-[20%]" alt="empty-bg" />

        <h2 className="text-lg mt-3  text-gray-500 font-medium">{isSearchEmpty ? "No Results Found" : "No Data Found"}</h2>

        <p className="text-sm  w-[25%]  text-gray-400 max-w-md mt-1">
          {isSearchEmpty ? "We couldn’t find any results matching your search or filters. Try adjusting them and try again." : `You haven’t created any items yet. Once you do, they’ll show up here.`}
        </p>

        {/* {!isSearchEmpty && (
          <Button type="primary" className="mt-8">
            Create new {entity}
          </Button>
        )} */}
      </div>
    );
  }
}
