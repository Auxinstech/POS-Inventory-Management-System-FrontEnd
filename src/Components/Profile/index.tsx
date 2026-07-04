import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { logoutUser } from "../../Redux/Ducks/userSlice";
import storage from "Utils/storage";
import { setActiveStore } from "Utils/auth";

export default function ProfileCircle() {
  const user = useAppSelector((x) => x.User.user);
  const [show, setShow] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const dispatch = useAppDispatch();
  const selected_store = useAppSelector((x) => x.Home.selected_store);

  const location = useLocation();
  const navigate = useNavigate();

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
    user?.name || "U"
  )}&size=200&background=random`;

  const toggleDropdown = () => setShow((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current?.contains(event.target as Node)
      ) {
        setShow(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate position
  const [coords, setCoords] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  useEffect(() => {
    if (show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.right - 224 }); // 224 = dropdown width (w-56)
    }
  }, [show]);

  const clickHandler = () => {
    navigate("");
    setTimeout(() => {
      setActiveStore({ ActiveStore: null });
      dispatch(logoutUser());
      storage.clear();
    }, 10);
  };

  return (
    <>
      {/* Profile Circle */}
      <button
        ref={buttonRef}
        onClick={toggleDropdown}
        className="cursor-pointer border-0 bg-transparent p-0"
        aria-haspopup="true"
        aria-expanded={show}
      >
        <img
          src={avatarUrl}
          alt="avatar"
          width={40}
          height={40}
          className="rounded-circle shadow-md"
        />
      </button>

      {/* Dropdown in portal */}
      {show &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              top: coords.top,
              left: coords.left,
              position: "absolute",
              zIndex: 9999,
            }}
            className="dropdown-menu show shadow border rounded-1 p-0"
          >
            {/* User info */}
            <div className="px-3 py-2">
              <div className="fw-semibold ">{user?.name}</div>
              <div className="small text-muted">{user?.email}</div>
            </div>

            {/* Divider */}
            <div className="dropdown-divider"></div>

            {/* Sign out */}
            <div className="my-2">
              <button
                type="button"
                onClick={clickHandler}
                className="dropdown-item text-primary custom-hover"
              >
                Sign out
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
