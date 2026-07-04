type DayOfWeek =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

type ShopSchedule = Record<
  DayOfWeek,
  {
    openingTime: string; // e.g. "09:00"
    closingTime: string; // e.g. "17:00"
    isClosed: any; // e.g. "0"
  }
>;

export const isWorkingHours = (
  schedule: ShopSchedule,
  now: Date = new Date()
): boolean => {
  const day = now
    .toLocaleDateString("en-US", { weekday: "long" })
    .toLowerCase() as DayOfWeek;
  const todaySchedule = schedule[day];

  // If today is marked closed, return false immediately
  if (
    todaySchedule?.isClosed === "1" ||
    todaySchedule?.isClosed === 1 ||
    todaySchedule?.isClosed === true ||
    todaySchedule?.isClosed === "true"
  ) {
    return false;
  }

  // If no hours set for today, assume closed
  if (!todaySchedule?.openingTime || !todaySchedule?.closingTime) {
    return false;
  }

  const [openHour, openMinute] = todaySchedule.openingTime
    .split(":")
    .map(Number);
  const [closeHour, closeMinute] = todaySchedule.closingTime
    .split(":")
    .map(Number);

  const openTime = new Date(now);
  openTime.setHours(openHour, openMinute, 0, 0);

  const closeTime = new Date(now);
  closeTime.setHours(closeHour, closeMinute, 0, 0);

  // Handle overnight hours (e.g., 22:00 to 06:00)
  if (closeTime <= openTime) {
    const extendedCloseTime = new Date(closeTime);
    extendedCloseTime.setDate(extendedCloseTime.getDate() + 1);

    if (now >= openTime) return true;

    // If now is early morning (next day), check if within the overnight range
    const adjustedNow = new Date(now);
    adjustedNow.setDate(adjustedNow.getDate() - 1);
    const previousDay = adjustedNow
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as DayOfWeek;
    const prevSchedule = schedule[previousDay];

    if (!prevSchedule?.openingTime || !prevSchedule?.closingTime) {
      return false;
    }

    const [prevOpenHour, prevOpenMinute] = prevSchedule.openingTime
      .split(":")
      .map(Number);
    const [prevCloseHour, prevCloseMinute] = prevSchedule.closingTime
      .split(":")
      .map(Number);

    const prevOpenTime = new Date(adjustedNow);
    prevOpenTime.setHours(prevOpenHour, prevOpenMinute, 0, 0);

    const prevCloseTime = new Date(adjustedNow);
    prevCloseTime.setHours(prevCloseHour, prevCloseMinute, 0, 0);
    prevCloseTime.setDate(prevCloseTime.getDate() + 1); // shift to next day

    return now <= prevCloseTime && prevCloseTime > prevOpenTime;
  }

  return now >= openTime && now <= closeTime;
};
