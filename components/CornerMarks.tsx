export function CornerMarks({ dark = false }: { dark?: boolean }) {
  const c = dark ? "text-[#3E3E56]" : "text-[#D8D5C9]";
  return (
    <>
      <span className={`absolute -top-2 -left-2 text-xs select-none pointer-events-none ${c}`}>+</span>
      <span className={`absolute -top-2 -right-2 text-xs select-none pointer-events-none ${c}`}>+</span>
      <span className={`absolute -bottom-2 -left-2 text-xs select-none pointer-events-none ${c}`}>+</span>
      <span className={`absolute -bottom-2 -right-2 text-xs select-none pointer-events-none ${c}`}>+</span>
    </>
  );
}
