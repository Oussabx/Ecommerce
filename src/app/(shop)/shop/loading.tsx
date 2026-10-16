import { ListingSkeleton } from "@/components/listing/ListingHeader";

export default function Loading() {
  return (
    <div className="container-x pb-16 pt-5 md:pb-24 md:pt-6">
      <div className="skeleton h-3 w-40 rounded-full" />
      <div className="skeleton mt-6 h-12 w-2/3 max-w-xl rounded-2xl md:mt-10" />
      <div className="skeleton mt-4 h-4 w-1/2 max-w-md rounded-full" />
      <div className="mt-10">
        <ListingSkeleton />
      </div>
    </div>
  );
}
