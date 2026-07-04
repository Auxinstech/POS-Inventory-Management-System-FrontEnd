import FeatherIcon from 'feather-icons-react';
import React, { useRef, useState } from 'react';
import { Form, Button } from 'react-bootstrap';

interface ImagePickerProps {
    value: string;
    onImageSelect: (base64: string) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ value, onImageSelect }) => {
    const [agree, setAgree] = useState<boolean>(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                onImageSelect(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClearImage = () => {
        onImageSelect(''); // Clear image
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear input value too
        }
    };

    return (
        <div className="image-picker">
            <h6>Upload Image</h6>
            {value ? (
                <img src={value} alt="Preview" className="preview mb-2" />
            ) : (
                <div className='image-picker-container'>
                    <span className="image-picker-muted-text">Items with pictures get 50% more orders!</span>

                    <FeatherIcon icon="camera" size="32" />

                    <Form.Check
                        type="checkbox"
                        label={
                            <span>
                                I agree to the <a href="#terms">Terms & Conditions</a>
                            </span>
                        }
                        checked={agree}
                        onChange={(e) => setAgree(e.target.checked)}
                    />

                    <span className="image-picker-muted-text">
                        * Dimension: 1280×720 | JPG, PNG | Max size: 5MB
                    </span>
                </div>
            )}

            <input
                type="file"
                accept=".jpg,.jpeg,.png"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={!agree}
            />

            <div className='d-flex'>
                <Button
                    type="button"
                    variant="light"
                    className="ms-auto"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!agree}
                >
                    {value ? "Change Image" : "Upload Image"}
                </Button>

                {value && (
                    <Button
                        type="button"
                        variant="danger"
                        className="ms-2"
                        onClick={handleClearImage}
                    >
                        <FeatherIcon icon='trash' size="16" />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default ImagePicker;
