// ScheduleForm.tsx
import {
  CreateModifierGroupRequest,
  Day,
  ScheduleConfigDaily,
  ScheduleConfigWeekly,
  ScheduleType,
  UpdateModifierGroupRequest,
} from "Models/modifierGroup";
import { Form, Row, Col, FloatingLabel } from "react-bootstrap";

const DAYS: Day[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

type ModGroupModel = UpdateModifierGroupRequest | CreateModifierGroupRequest;

interface ScheduleFormProps<T extends ModGroupModel> {
  model: T;
  setModel: React.Dispatch<React.SetStateAction<T>>;
}

export default function ScheduleFormModifierGroup<T extends ModGroupModel>({
  model,
  setModel,
}: ScheduleFormProps<T>) {
  const schedule = model.schedule;
  const config = model.schedule_config;

  const handleScheduleChange = (value: ScheduleType) => {
    if (value === "NONE") {
      setModel((prev) => ({
        ...prev,
        schedule: "NONE",
        schedule_config: null,
      }));
      return;
    }

    if (value === "DAILY") {
      const dailyConfig: ScheduleConfigDaily = {
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
      };

      setModel((prev) => ({
        ...prev,
        schedule: "DAILY",
        schedule_config: dailyConfig,
      }));
      return;
    }

    if (value === "WEEKLY") {
      const weeklyConfig: ScheduleConfigWeekly = {
        startDate: "",
        endDate: "",
        startTime: "",
        endTime: "",
        days: [],
      };

      setModel((prev) => ({
        ...prev,
        schedule: "WEEKLY",
        schedule_config: weeklyConfig,
      }));
    }
  };

  const handleChange = (field: keyof ScheduleConfigDaily, value: string) => {
    if (!config) return;

    setModel((prev) => {
      return {
        ...prev,
        schedule_config: {
          ...prev.schedule_config!,
          [field]: value,
        },
      };
    });
  };

  const handleDayToggle = (day: Day) => {
    if (schedule !== "WEEKLY" || !config) return;

    const weeklyConfig = config as ScheduleConfigWeekly;
    const exists = weeklyConfig.days.includes(day);

    setModel((prev) => ({
      ...prev,
      schedule_config: {
        ...weeklyConfig,
        days: exists
          ? weeklyConfig.days.filter((d) => d !== day)
          : [...weeklyConfig.days, day],
      },
    }));
  };

  return (
    <Form>
      <Row className="g-3">
        <Col md="3">
          <FloatingLabel label="Schedule">
            <Form.Select
              value={schedule ?? "NONE"}
              onChange={(e) =>
                handleScheduleChange(e.target.value as ScheduleType)
              }
            >
              <option value="NONE">No Schedule</option>
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
            </Form.Select>
          </FloatingLabel>
        </Col>

        {schedule !== "NONE" && config && (
          <>
            <Col md="2">
              <FloatingLabel label="Start Date">
                <Form.Control
                  type="date"
                  value={config.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                />
              </FloatingLabel>
            </Col>

            <Col md="2">
              <FloatingLabel label="End Date">
                <Form.Control
                  type="date"
                  value={config.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                />
              </FloatingLabel>
            </Col>

            <Col md="2">
              <FloatingLabel label="Start Time">
                <Form.Control
                  type="time"
                  value={config.startTime}
                  onChange={(e) => handleChange("startTime", e.target.value)}
                />
              </FloatingLabel>
            </Col>

            <Col md="2">
              <FloatingLabel label="End Time">
                <Form.Control
                  type="time"
                  value={config.endTime}
                  onChange={(e) => handleChange("endTime", e.target.value)}
                />
              </FloatingLabel>
            </Col>
          </>
        )}

        {schedule === "WEEKLY" && config && (
          <Col md="12">
            <div className="d-flex flex-wrap gap-2 mt-2">
              {(config as ScheduleConfigWeekly).days &&
                DAYS.map((day) => (
                  <Form.Check
                    key={day}
                    type="checkbox"
                    label={day}
                    checked={(config as ScheduleConfigWeekly).days.includes(
                      day,
                    )}
                    onChange={() => handleDayToggle(day)}
                  />
                ))}
            </div>
          </Col>
        )}
      </Row>
    </Form>
  );
}
