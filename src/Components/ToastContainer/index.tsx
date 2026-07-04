// src/components/ToastContainer.tsx

import React, { useEffect } from 'react';
import { ToastContainer as ToastifyContainer, toast } from 'react-toastify';
import { clearToast } from '../../Redux/Ducks/toastSlice';
import { useAppDispatch, useAppSelector } from 'Hook/hooks';

const ToastContainer = () => {
    const dispatch = useAppDispatch();
    const { message, type } = useAppSelector((state) => state.Toast);

    useEffect(() => {
        if (message && type) {
            toast[type](message, {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });

            // Clear the toast after showing it
            dispatch(clearToast());
        }
    }, [message, type]);

    return <ToastifyContainer />;
};

export default ToastContainer;
