
function MaintenanceHeader() {
  return (
    <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <p className="text-sm font-medium text-blue-600">
          Workspace
        </p>

        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-800 sm:text-3xl">
          Maintenance
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage and monitor maintenance requests.
        </p>
      </div>
    </section>
  );
}

export default MaintenanceHeader;
