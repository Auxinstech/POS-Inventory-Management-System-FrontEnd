import classNames from 'classnames';
import React from 'react';

const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const fullDayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DaysInputProps {
    value: string[]; // Array of full day names like ['Monday', 'Tuesday']
    onChange: (days: string[]) => void;
}

const DaysInput: React.FC<DaysInputProps> = ({ value, onChange }) => {
    const isSelected = (day: string) => value.includes(day);

    const toggleDay = (day: string) => {
        const updated = isSelected(day)
            ? value.filter(d => d !== day)
            : [...value, day];
        onChange(updated);
    };

    const selectAll = () => onChange([...fullDayNames]);

    return (
        <div className="days-input">
            <div className="days-input-header">
                <h6>Days Available</h6>

                <span onClick={selectAll}>
                    Select All
                </span>
            </div>

            <div className="days-input-days">
                {daysOfWeek.map((day, index) => {
                    const fullName = fullDayNames[index];
                    const selected = isSelected(fullName);

                    return (
                        <div
                            key={day}
                            title={fullName}
                            className={classNames(['days-input-day', { selected: selected }])}
                            onClick={() => toggleDay(fullName)}
                        >
                            {day}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DaysInput;
