export default function Loading() {
  return (
    <div className="container-x pb-16 pt-6" aria-busy="true" aria-label="Loading product">
      <div className="skeleton h-3 w-48" />
      <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="skeleton aspect-square lg:col-span-7" />
        <div className="space-y-4 lg:col-span-5">
          <div className="skeleton h-3 w-32" />
          <div className="skeleton h-16 w-4/5" />
          <div className="skeleton h-5 w-full" />
          <div className="skeleton h-12 w-40" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
