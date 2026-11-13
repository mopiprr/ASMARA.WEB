interface TableSkeletonRowsProps {
  cells: string[];
  rows?: number;
}

function TableSkeletonRows({ cells, rows = 5 }: TableSkeletonRowsProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="animate-pulse">
          {cells.map((size, cellIdx) => (
            <td key={cellIdx} className="px-6 py-4">
              <div className={`${size} rounded bg-slate-200`} />
            </td>
          ))}
          <td className="px-6 py-4 text-right">
            <div className="ml-auto h-7 w-16 rounded bg-slate-200" />
          </td>
        </tr>
      ))}
    </>
  );
}

export default TableSkeletonRows;