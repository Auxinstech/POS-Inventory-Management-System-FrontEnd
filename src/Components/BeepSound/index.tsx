import { useAppDispatch, useAppSelector } from "../../Hook/hooks";
import { useEffect } from "react";
import { decrementBeepCount } from "../../Redux/Ducks/beepSlice";

const AutoBeepPlayer = () => {
  const dispatch = useAppDispatch();
  const beepCount = useAppSelector((x) => x.Beep.value);

  useEffect(() => {
    if (beepCount > 0) {
      const audio = new Audio("/beep.wav");
      audio.onended = () => {
        dispatch(decrementBeepCount());
      };
      audio.play().catch((err) => {
        console.error("Beep playback failed:", err);
        dispatch(decrementBeepCount()); // Still decrement if error
      });
    }
  }, [beepCount, dispatch]);

  return null;
};

export default AutoBeepPlayer;
