export const formatSave = (d: Date) => {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());
  return `${day}-${month}-${year}`;
};

export const getTime = (dateStr: string) => {
  if (!dateStr) return "";
  const timePart = dateStr.includes("T")
    ? dateStr.split("T")[1]
    : dateStr.split(" ")[1];
  return timePart?.split(".")[0] ?? "";
};
