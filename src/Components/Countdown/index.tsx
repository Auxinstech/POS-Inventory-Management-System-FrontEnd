import { useEffect, useState } from "react";
import { ITimezoneOption } from "react-timezone-select";

interface CountdownProps {
  created_at: string; // server timestamp in UTC
  durationMinutes: number;
  timezone: ITimezoneOption; // passed timezone object
}

const Countdown: React.FC<CountdownProps> = ({
  created_at,
  durationMinutes,
  timezone,
}) => {
  const startTimeUtc = new Date(created_at).getTime();
  const endTimeUtc = startTimeUtc + durationMinutes * 60 * 1000;

  // convert offset hours (can be 5.5, etc) into ms
  const tzOffsetMs = (timezone.offset ?? 0) * 60 * 60 * 1000;

  const getRemaining = () => {
    const nowUtc = Date.now(); // already UTC epoch
    const nowWithOffset = nowUtc + tzOffsetMs;
    const endWithOffset = endTimeUtc + tzOffsetMs;
    return Math.max(endWithOffset - nowWithOffset, 0);
  };

  const [timeLeft, setTimeLeft] = useState(() => getRemaining());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTimeUtc, tzOffsetMs]);

  if (timeLeft <= 0) {
    return <div>00:00</div>;
  }

  const mins = Math.floor(timeLeft / 1000 / 60);
  const secs = Math.floor((timeLeft / 1000) % 60);

  return (
    <div>
      {mins}:{secs.toString().padStart(2, "0")}
    </div>
  );
};

export default Countdown;
