export function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end h-8 gap-1">
      {data.map((value, index) => (
        <div
          key={index}
          className="bg-primary/60 w-2 "
          style={{
            height: `${((value - min) / range) * 100}%`,
            minHeight: "2px",
          }}
        />
      ))}
    </div>
  );
}
