import { ListingSkeleton } from "@/components/listing/ListingHeader";

export default function Loading() {
  return (
    <div className="container-x pb-20 pt-6">
      <div className="skeleton h-3 w-40" />
      <div className="skeleton mt-12 h-24 w-2/3" />
      <div className="mt-10">
        <ListingSkeleton />
      </div>
    </div>
  );
}
