import DeliveryConfigurationGrid from "Components/DeliveryConfigurationGrid";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  Button,
  Card,
  Col,
  FloatingLabel,
  Form,
  FormLabel,
  Row,
} from "react-bootstrap";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import {
  changeSetting,
  getStoreSettings,
} from "../../Redux/Ducks/settingSlice";
import { parse } from "path";
import TimezoneSelect, {
  allTimezones,
  ITimezoneOption,
  type ITimezone,
} from "react-timezone-select";

// ============================================================================
// Types & Interfaces
// ============================================================================

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

type ShopTime = {
  [key in DayOfWeek]: {
    openingTime: string;
    closingTime: string;
    isClosed: any;
  };
};

export type TDeliverTimings = {
  delivery_time: string;
  pickup_time: string;
  instore_time: string;
};

interface ExtendedTimezone {
  value: string;
  label: string;
  offset: number;
  abbrev: string;
  altName: string;
}

interface StoreDetails {
  name: string;
  address: string;
  phone: string;
  description: string;
  email: string;
}

interface StripeSettings {
  stripe_secret_key: string;
  stripe_webhook_secret: string;
  stripe_public_key: string;
  is_enabled: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const currencies = {
  AUD: "Australian Dollar",
  BRL: "Brazilian Real",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Renminbi Yuan",
  CZK: "Czech Koruna",
  DKK: "Danish Krone",
  EUR: "Euro",
  GBP: "British Pound",
  HKD: "Hong Kong Dollar",
  HUF: "Hungarian Forint",
  IDR: "Indonesian Rupiah",
  ILS: "Israeli New Shekel",
  INR: "Indian Rupee",
  ISK: "Icelandic Króna",
  JPY: "Japanese Yen",
  KRW: "South Korean Won",
  MXN: "Mexican Peso",
  MYR: "Malaysian Ringgit",
  NOK: "Norwegian Krone",
  NZD: "New Zealand Dollar",
  PHP: "Philippine Peso",
  PLN: "Polish Złoty",
  RON: "Romanian Leu",
  SEK: "Swedish Krona",
  SGD: "Singapore Dollar",
  THB: "Thai Baht",
  TRY: "Turkish Lira",
  USD: "United States Dollar",
  ZAR: "South African Rand",
};

const shopDefaultTime: ShopTime = {
  monday: {
    openingTime: "09:00",
    closingTime: "17:00",
    isClosed: "0",
  },
  tuesday: {
    openingTime: "09:00",
    closingTime: "17:00",
    isClosed: "0",
  },
  wednesday: {
    openingTime: "09:00",
    closingTime: "17:00",
    isClosed: "0",
  },
  thursday: {
    openingTime: "09:00",
    closingTime: "17:00",
    isClosed: "0",
  },
  friday: {
    openingTime: "09:00",
    closingTime: "17:00",
    isClosed: "0",
  },
  saturday: {
    openingTime: "09:00",
    closingTime: "17:00",
    isClosed: "0",
  },
  sunday: {
    openingTime: "09:00",
    closingTime: "17:00",
    isClosed: "0",
  },
};

const defaultDeliveryTimings = {
  delivery_time: "10",
  pickup_time: "10",
  instore_time: "10",
};

// ============================================================================
// Main Component
// ============================================================================

const Store = () => {
  // --------------------------------------------------------------------------
  // Redux Hooks
  // --------------------------------------------------------------------------
  const dispatch = useAppDispatch();
  const settings = useAppSelector((x) => x.Setting.settings);
  const selected_store = useAppSelector((x) => x.Home.selected_store);

  // --------------------------------------------------------------------------
  // State Declarations - Grouped by feature
  // --------------------------------------------------------------------------

  // Currency State
  const [currencyList, setCurrencyList] =
    useState<Record<string, string>>(currencies);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("");
  const [currencySymbol, setCurrencySymbol] = useState<string>("");

  // Service Charges State
  const [serviceCharges, setServiceCharges] = useState<number>(0);

  // Billing State
  const [billingType, setBillingType] = useState("fixed");
  const [billingFrequency, setBillingFrequency] = useState("monthly");
  const [fixedServiceCharges, setFixedServiceCharges] = useState<number>(0);

  // UI Customization State
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [fontSize, setFontSize] = useState("fs-6");

  // Shop Operations State
  const [printCount, setPrintCount] = useState<number>(0);
  const [mqttStatus, setMqttStatus] = useState<boolean>(false);

  // Shop Timing State
  const [shopTime, setShopTime] = useState<ShopTime>(shopDefaultTime);
  const [deliveryTimings, setDeliveryTimings] = useState<TDeliverTimings>(
    defaultDeliveryTimings,
  );
  const [selectedTimezone, setSelectedTimezone] = useState<ITimezoneOption>({
    value: "",
    label: "",
    offset: 0,
    abbrev: "",
    altName: "",
  });

  // Payment Gateway State
  const [stripe, setStripe] = useState<StripeSettings>({
    stripe_secret_key: "",
    stripe_webhook_secret: "",
    stripe_public_key: "",
    is_enabled: false,
  });
  const [allowCOD, setAllowCOD] = useState(false);

  // Delivery Options
  const [disableDelivery, setDisableDelivery] = useState(false);
  const [disablePickup, setDisablePickup] = useState(false);

  // Store Details State
  const [storeDetails, setStoreDetails] = useState<StoreDetails>({
    name: "",
    address: "",
    phone: "",
    description: "",
    email: "",
  });

  // Strict Mode State
  const [allowOrdersFromAllowedPostCodes, setAllowOrdersFromAllowedPostCodes] =
    useState(false);

  // Public Site
  const [siteLogo, setSiteLogo] = useState("");
  const [siteColor, setSiteColor] = useState("#000000");
  console.log(siteLogo);

  // --------------------------------------------------------------------------
  // Helper Functions
  // --------------------------------------------------------------------------

  const getCurrencySymbol = (code: string): string => {
    try {
      return (0)
        .toLocaleString("en", {
          style: "currency",
          currency: code,
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })
        .replace(/\d/g, "")
        .trim();
    } catch {
      return "";
    }
  };

  // --------------------------------------------------------------------------
  // Effect Hooks - Sync settings to local state
  // --------------------------------------------------------------------------

  // Sync Delivery Options
  useEffect(() => {
    const findAllowCOD = settings.find((x) => x.key === "allowCOD");
    if (findAllowCOD?.value) {
      const parsedAlllowCOD = JSON.parse(findAllowCOD.value);
      if (parsedAlllowCOD) setAllowCOD(parsedAlllowCOD);
    }
  }, [settings]);

  useEffect(() => {
    const findAllowDelivery = settings.find(
      (x) => x.key === "disable_delivery",
    );
    if (findAllowDelivery?.value) {
      const parsedAllowDelivery = JSON.parse(findAllowDelivery.value);
      if (parsedAllowDelivery) setDisableDelivery(parsedAllowDelivery);
    }
  }, [settings]);

  useEffect(() => {
    const findAllowPickup = settings.find((x) => x.key === "disable_pickup");
    if (findAllowPickup?.value) {
      const parsedAllowPickup = JSON.parse(findAllowPickup.value);
      if (parsedAllowPickup) setDisablePickup(parsedAllowPickup);
    }
  }, [settings]);

  // Sync Timezone setting
  useEffect(() => {
    const findTZValue = settings.find((x) => x.key === "timezone");
    if (findTZValue?.value) {
      const parsedTZ = JSON.parse(findTZValue.value);
      if (parsedTZ) setSelectedTimezone(parsedTZ);
    }
  }, [settings]);

  // Sync Stripe settings
  useEffect(() => {
    const stripeSecretSetting = settings.find(
      (x) => x.key === "stripe_secret_key",
    );
    const stripePublicSetting = settings.find(
      (x) => x.key === "stripe_public_key",
    );
    const stripeWebhookSetting = settings.find(
      (x) => x.key === "stripe_webhook_secret",
    );
    const isEnabledSetting = settings.find(
      (x) => x.key === "stripe_is_enabled",
    );

    setStripe((prev) => ({
      ...prev,
      stripe_secret_key: stripeSecretSetting?.value
        ? JSON.parse(stripeSecretSetting.value)
        : prev.stripe_secret_key,
      stripe_public_key: stripePublicSetting?.value
        ? JSON.parse(stripePublicSetting.value)
        : prev.stripe_public_key,
      stripe_webhook_secret: stripeWebhookSetting?.value
        ? JSON.parse(stripeWebhookSetting.value)
        : prev.stripe_webhook_secret,
      is_enabled: isEnabledSetting?.value === "true",
    }));
  }, [settings]);

  // Sync Delivery Timings
  useEffect(() => {
    const deliveryTime = settings.find(
      (x) => x.key == "delivery_timings_delivery_time",
    );
    const pickupTime = settings.find(
      (x) => x.key == "delivery_timings_pickup_time",
    );
    const instoreTime = settings.find(
      (x) => x.key == "delivery_timings_instore_time",
    );

    setDeliveryTimings({
      delivery_time: deliveryTime?.value || "10",
      pickup_time: pickupTime?.value || "10",
      instore_time: instoreTime?.value || "10",
    });
  }, [settings]);

  // Sync Currency and Service Charges
  useEffect(() => {
    const currencySetting = settings.find((x) => x.key === "currency");
    if (currencySetting?.value) {
      setSelectedCurrency(currencySetting.value);
    }

    const serviceChargesSetting = settings.find(
      (x) => x.key === "service_charges",
    );
    if (serviceChargesSetting?.value) {
      const parsed = parseFloat(serviceChargesSetting.value);
      setServiceCharges(isNaN(parsed) ? 0 : parsed);
    }
  }, [settings]);

  // Sync Print Count
  useEffect(() => {
    const printCountSetting = settings.find((x) => x.key === "print_count");
    if (printCountSetting?.value) {
      setPrintCount(parseInt(printCountSetting.value));
    }
  }, [settings]);

  // Sync MQTT Status
  useEffect(() => {
    const mqttStatusToggler = settings.find((x) => x.key === "mqtt_status");
    if (mqttStatusToggler?.value) {
      setMqttStatus(mqttStatusToggler.value === "true");
    }
  }, [settings]);

  // Sync Color setting
  useEffect(() => {
    const colorSetting = settings.find((x) => x.key === "default_color");
    if (colorSetting?.value) {
      setSelectedColor(colorSetting.value);
    }
  }, [settings]);

  // Sync Site Color setting
  useEffect(() => {
    const siteColorSetting = settings.find((x) => x.key === "site_color");
    if (siteColorSetting?.value) {
      setSiteColor(siteColorSetting.value);
    }
  }, [settings]);

  useEffect(() => {
    const siteLogo = settings.find((x) => x.key === "public_site_logo");
    if (siteLogo?.value) {
      setSiteLogo(siteLogo.value);
    }
  }, [settings]);

  // Sync Font Size setting
  useEffect(() => {
    const fontSizeSetting = settings.find((x) => x.key === "menu_font_size");
    if (fontSizeSetting?.value) {
      setFontSize(fontSizeSetting.value);
    }
  }, [settings]);

  // Sync Shop Operating Times
  useEffect(() => {
    for (const [day, time] of Object.entries(shopDefaultTime)) {
      const typedDay = day as DayOfWeek;

      const openingSetting = settings.find(
        (x) => x.key === `${day}-openingTime`,
      );
      const closingSetting = settings.find(
        (x) => x.key === `${day}-closingTime`,
      );
      const isClosedSetting = settings.find((x) => x.key === `${day}-isClosed`);

      if (isClosedSetting?.value) {
        setShopTime((prev) => ({
          ...prev,
          [typedDay]: { ...prev[typedDay], isClosed: isClosedSetting.value },
        }));
      }

      if (openingSetting?.value) {
        setShopTime((prev) => ({
          ...prev,
          [typedDay]: { ...prev[typedDay], openingTime: openingSetting.value },
        }));
      }

      if (closingSetting?.value) {
        setShopTime((prev) => ({
          ...prev,
          [typedDay]: { ...prev[typedDay], closingTime: closingSetting.value },
        }));
      }
    }
  }, [settings]);

  // Sync Store Details
  useEffect(() => {
    if (settings && settings.length > 0) {
      const getSettingValue = (key: string): string => {
        return settings.find((x) => x.key === key)?.value || "";
      };

      setStoreDetails({
        name: getSettingValue("pos_store_name"),
        address: getSettingValue("pos_store_address"),
        phone: getSettingValue("pos_store_phone"),
        description: getSettingValue("pos_store_description"),
        email: getSettingValue("pos_store_email"),
      });
    }
  }, [settings]);

  // Sync Billing Type
  useEffect(() => {
    const billingTypeSetting = settings.find(
      (x: any) => x.key === "billing_type",
    );
    if (billingTypeSetting?.value) {
      setBillingType(billingTypeSetting.value);
    }
  }, [settings]);

  // Sync Billing Frequency
  useEffect(() => {
    const billingFrequencySetting = settings.find(
      (x: any) => x.key === "billing_frequency",
    );
    if (billingFrequencySetting?.value) {
      setBillingFrequency(billingFrequencySetting.value);
    }
  }, [settings]);

  // Sync Fixed Service Charges
  useEffect(() => {
    const fixedServiceChargesSetting = settings.find(
      (x: any) => x.key === "fixed_service_charges",
    );
    if (fixedServiceChargesSetting?.value) {
      setFixedServiceCharges(parseFloat(fixedServiceChargesSetting.value));
    }
  }, [settings]);

  // Fetch currency list from Frankfurter API
  // useEffect(() => {
  //   dispatch(toggleLoader(true));
  //   fetch("https://api.frankfurter.app/currencies")
  //     .then((res) => res.json())
  //     .then((data) => setCurrencyList(data));
  //   dispatch(toggleLoader(false));
  // }, []);

  // Update currency symbol when selected currency changes
  useEffect(() => {
    if (selectedCurrency) {
      const symbol = getCurrencySymbol(selectedCurrency);
      setCurrencySymbol(symbol);
      dispatch(
        changeSetting({
          key: "currency-symbol",
          value: symbol,
          status: "active",
          store_id: 0,
          user_id: 0,
        }),
      );
    } else {
      setCurrencySymbol("");
    }
  }, [selectedCurrency]);

  // Strict Mode Handlers
  useEffect(() => {
    const allowOrderFromDC = settings.find(
      (x: any) => x.key === "allow_orders_from_allowed_post_codes",
    );
    if (allowOrderFromDC?.value) {
      setAllowOrdersFromAllowedPostCodes(allowOrderFromDC.value === "true");
    }
  }, [settings]);

  // --------------------------------------------------------------------------
  // Event Handlers
  // --------------------------------------------------------------------------

  // Currency Handlers
  const selectCurrency = (e: any) => {
    setSelectedCurrency(e.target.value);
    dispatch(
      changeSetting({
        key: "currency",
        value: e.target.value,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  // Service Charges Handlers
  const handleServiceChargesChange = (e: any) => {
    setServiceCharges(parseFloat(e.target.value));
  };

  const handleSaveServiceCharges = () => {
    dispatch(
      changeSetting({
        key: "service_charges",
        value: serviceCharges.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    if (selected_store !== undefined && selected_store !== null) {
      dispatch(getStoreSettings(selected_store));
    }
  };

  // Print Count Handlers
  const handlePrintCountChange = (e: any) => {
    setPrintCount(parseInt(e.target.value));
  };

  const handleSavePrintCount = async () => {
    await dispatch(
      changeSetting({
        key: "print_count",
        value: printCount.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  // Billing Handlers
  const handleBillingTypeChange = (e: any) => {
    setBillingType(e.target.value);
  };

  const handleBillingFrequencyChange = (e: any) => {
    setBillingFrequency(e.target.value);
  };

  const handleFixedServiceChargesChange = (e: any) => {
    setFixedServiceCharges(parseFloat(e.target.value));
  };

  const handleSaveBillingType = async () => {
    await dispatch(
      changeSetting({
        key: "billing_type",
        value: billingType,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  const handleSaveBillingFrequency = async () => {
    await dispatch(
      changeSetting({
        key: "billing_frequency",
        value: billingFrequency,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  const handleSaveFixedServiceCharges = async () => {
    dispatch(
      changeSetting({
        key: "fixed_service_charges",
        value: fixedServiceCharges.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  // Stripe Handlers
  const handleSaveStripe = async () => {
    dispatch(
      changeSetting({
        key: "stripe_secret_key",
        value: JSON.stringify(stripe.stripe_secret_key),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    dispatch(
      changeSetting({
        key: "stripe_public_key",
        value: JSON.stringify(stripe.stripe_public_key),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    dispatch(
      changeSetting({
        key: "stripe_webhook_secret",
        value: JSON.stringify(stripe.stripe_webhook_secret),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    dispatch(
      changeSetting({
        key: "stripe_is_enabled",
        value: JSON.stringify(stripe.is_enabled),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  // UI Customization Handlers
  const handleSaveColor = () => {
    dispatch(
      changeSetting({
        key: "default_color",
        value: selectedColor.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    if (selected_store !== undefined && selected_store !== null) {
      dispatch(getStoreSettings(selected_store));
    }
  };

  const handleSaveSiteColor = () => {
    dispatch(
      changeSetting({
        key: "site_color",
        value: siteColor.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    if (selected_store !== undefined && selected_store !== null) {
      dispatch(getStoreSettings(selected_store));
    }
  };

  const handleSaveFontSize = () => {
    dispatch(
      changeSetting({
        key: "menu_font_size",
        value: fontSize.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    if (selected_store !== undefined && selected_store !== null) {
      dispatch(getStoreSettings(selected_store));
    }
  };

  // Shop Operating Hours Handlers
  const handleSaveShopTime = () => {
    for (const [day, time] of Object.entries(shopTime)) {
      dispatch(
        changeSetting({
          key: `${day}-openingTime`,
          value: time.openingTime,
          status: "active",
          store_id: 0,
          user_id: 0,
        }),
      );
      dispatch(
        changeSetting({
          key: `${day}-closingTime`,
          value: time.closingTime,
          status: "active",
          store_id: 0,
          user_id: 0,
        }),
      );
      dispatch(
        changeSetting({
          key: `${day}-isClosed`,
          value: time.isClosed.toString(),
          status: "active",
          store_id: 0,
          user_id: 0,
        }),
      );
    }

    if (selected_store !== undefined && selected_store !== null) {
      dispatch(getStoreSettings(selected_store));
    }
  };

  // Delivery Timings Handlers
  const handleDeliveryTimings = (e: any) => {
    setDeliveryTimings({
      ...deliveryTimings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveDeliveryTimings = () => {
    dispatch(
      changeSetting({
        key: "delivery_timings_delivery_time",
        value: deliveryTimings.delivery_time,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    dispatch(
      changeSetting({
        key: "delivery_timings_pickup_time",
        value: deliveryTimings.pickup_time,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    dispatch(
      changeSetting({
        key: "delivery_timings_instore_time",
        value: deliveryTimings.instore_time,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    if (selected_store !== undefined && selected_store !== null) {
      dispatch(getStoreSettings(selected_store));
    }
  };

  // Timezone Handlers
  const handleSaveTimezone = () => {
    if (!selectedTimezone) return;
    dispatch(
      changeSetting({
        key: "timezone",
        value: JSON.stringify(selectedTimezone, null, 2),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    if (selected_store !== undefined && selected_store !== null) {
      dispatch(getStoreSettings(selected_store));
    }
  };

  // Store Details Handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStoreDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStoreDetailsSubmit = async () => {
    await dispatch(
      changeSetting({
        key: "pos_store_name",
        value: storeDetails.name,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    await dispatch(
      changeSetting({
        key: "pos_store_phone",
        value: storeDetails.phone,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    await dispatch(
      changeSetting({
        key: "pos_store_email",
        value: storeDetails.email,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    await dispatch(
      changeSetting({
        key: "pos_store_address",
        value: storeDetails.address,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    await dispatch(
      changeSetting({
        key: "pos_store_description",
        value: storeDetails.description,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
    if (selected_store !== undefined && selected_store !== null) {
      await dispatch(getStoreSettings(selected_store));
    }
    console.log("Submitting store details:", storeDetails);
  };

  // MQTT Status Handlers
  const handleMqttStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMqttStatus(e.target.checked);
  };

  const handleSaveMqttStatus = async () => {
    await dispatch(
      changeSetting({
        key: "mqtt_status",
        value: mqttStatus.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  // Delivery Options Handlers
  const handleSaveAllowCOD = async () => {
    await dispatch(
      changeSetting({
        key: "allowCOD",
        value: allowCOD.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };
  const handleSaveDisableDelivery = async () => {
    await dispatch(
      changeSetting({
        key: "disable_delivery",
        value: disableDelivery.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };
  const handleSaveDisablePickup = async () => {
    await dispatch(
      changeSetting({
        key: "disable_pickup",
        value: disablePickup.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  // Strict Mode Handlers
  const handleSaveAllowOrdersFromAllowedPostCodes = async () => {
    await dispatch(
      changeSetting({
        key: "allow_orders_from_allowed_post_codes",
        value: allowOrdersFromAllowedPostCodes.toString(),
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  // Site logo

  const handleSavePublicSiteLogo = async () => {
    await dispatch(
      changeSetting({
        key: "public_site_logo",
        value: siteLogo,
        status: "active",
        store_id: 0,
        user_id: 0,
      }),
    );
  };

  // Master Save Handler
  const handleSaveAllSettings = async () => {
    await handleSaveServiceCharges();
    await handleSaveColor();
    await handleSaveFontSize();
    await handleSaveShopTime();
    await handleSaveDeliveryTimings();
    await handleSaveTimezone();
    await handleStoreDetailsSubmit();
    await handleSavePrintCount();
    await handleSaveMqttStatus();
    await handleSaveBillingType();
    await handleSaveBillingFrequency();
    await handleSaveFixedServiceCharges();
    await handleSaveStripe();
    await handleSaveAllowCOD();
    await handleSaveAllowOrdersFromAllowedPostCodes();
    await handleSavePublicSiteLogo();
    await handleSaveSiteColor();
    await handleSaveDisableDelivery();
    await handleSaveDisablePickup();
  };

  // Helper function to render accordion sections
  const renderAccordion = (title: string, content: React.ReactNode) => {
    return (
      <Accordion defaultActiveKey={title} className="mt-3">
        <Accordion.Item eventKey={title}>
          <Accordion.Header>{title}</Accordion.Header>
          <Accordion.Body>{content}</Accordion.Body>
        </Accordion.Item>
      </Accordion>
    );
  };

  // --------------------------------------------------------------------------
  // JSX Render
  // --------------------------------------------------------------------------

  return (
    <div className="setting-form">
      <div className="form-header">
        <span>Store Settings</span>
      </div>
      <div
        className="form-container"
        style={{
          width: "100%",
          overflowX: "hidden",
        }}
      >
        {/* Currency Section */}
        {renderAccordion(
          "Currency",
          <Row>
            <Col md={3}>
              <FloatingLabel
                controlId="currencySelect"
                label="Select Currency"
                className="mb-3"
              >
                <Form.Select
                  size="sm"
                  value={selectedCurrency}
                  onChange={selectCurrency}
                >
                  <option value="">Select Currency</option>
                  {Object.entries(currencyList).map(([code, name]) => (
                    <option key={code} value={code}>
                      {code} - {name}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </Col>
            <Col md={3}>
              <FloatingLabel
                controlId="currencySymbol"
                label="Currency Symbol"
                className="mb-3"
              >
                <Form.Control
                  size="sm"
                  type="text"
                  readOnly
                  value={currencySymbol}
                />
              </FloatingLabel>
            </Col>
          </Row>,
        )}

        {/* Timezone Section */}
        {renderAccordion(
          "Timezone",
          <Row>
            <Col md={4} className="mt-2 pt-0 z-3">
              <TimezoneSelect
                value={selectedTimezone}
                onChange={setSelectedTimezone}
              />
            </Col>
          </Row>,
        )}

        {/* Orders / Service Charges Section */}
        {renderAccordion(
          "Orders",
          <Row className="d-flex align-items-center mb-2">
            <Col md={3}>
              <FloatingLabel controlId="serviceCharges" label="Service Charges">
                <Form.Control
                  size="sm"
                  type="number"
                  value={serviceCharges}
                  onChange={handleServiceChargesChange}
                />
              </FloatingLabel>
            </Col>
          </Row>,
        )}

        {/* Billing Section */}
        {renderAccordion(
          "Billing",
          <Row className="d-flex align-items-center mb-2">
            <Col md={3}>
              <FloatingLabel controlId="BillingType" label="Billing Type">
                <Form.Select
                  size="sm"
                  value={billingType}
                  onChange={handleBillingTypeChange}
                >
                  <option value="fixed">Fixed</option>
                  <option value="service_charges">Service Charges</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
            {billingType === "fixed" && (
              <Col md={3}>
                <FloatingLabel
                  controlId="fixedServiceCharges"
                  label="Fixed Service Charges"
                >
                  <Form.Control
                    size="sm"
                    type="number"
                    value={fixedServiceCharges}
                    onChange={handleFixedServiceChargesChange}
                  />
                </FloatingLabel>
              </Col>
            )}
            <Col md={3}>
              <FloatingLabel
                controlId="BillingFrequency"
                label="Billing Frequency"
              >
                <Form.Select
                  size="sm"
                  value={billingFrequency}
                  onChange={handleBillingFrequencyChange}
                >
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
          </Row>,
        )}

        {/* Font Size Section */}
        {renderAccordion(
          "Font Size",
          <Row className="d-flex align-items-center mb-3">
            <Col md={3}>
              <FloatingLabel controlId="fontSize" label="Font Size (Menu)">
                <Form.Select
                  size="sm"
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                >
                  <option value="fs-1">fs-1 (largest)</option>
                  <option value="fs-2">fs-2</option>
                  <option value="fs-3">fs-3</option>
                  <option value="fs-4">fs-4</option>
                  <option value="fs-5">fs-5</option>
                  <option value="fs-6">fs-6 (smallest)</option>
                </Form.Select>
              </FloatingLabel>
            </Col>
          </Row>,
        )}

        {/* Color Section */}
        {renderAccordion(
          "Color",
          <Row className="d-flex align-items-center mb-4">
            <Col md={3}>
              <Form.Group controlId="color">
                <input
                  type="color"
                  className="form-control form-control-sm"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>,
        )}

        {/* Shop Operating Hours Section */}
        {renderAccordion(
          "Shop Time",
          <Row className="gy-4">
            {(Object.keys(shopTime) as DayOfWeek[]).map((day) => (
              <Col md={4} sm={6} xs={12} key={day}>
                <Card className="p-3 shadow-sm h-100">
                  <h6 className="text-primary text-uppercase mb-3">{day}</h6>
                  <div className="mb-2">
                    <label
                      htmlFor={`${day}-openingTime`}
                      className="form-label fw-semibold"
                    >
                      Opening Time
                    </label>
                    <input
                      type="time"
                      id={`${day}-openingTime`}
                      className="form-control"
                      value={shopTime[day].openingTime}
                      onChange={(e) =>
                        setShopTime((prev) => ({
                          ...prev,
                          [day]: {
                            ...prev[day],
                            openingTime: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`${day}-closingTime`}
                      className="form-label fw-semibold"
                    >
                      Closing Time
                    </label>
                    <input
                      type="time"
                      id={`${day}-closingTime`}
                      className="form-control"
                      value={shopTime[day].closingTime}
                      onChange={(e) =>
                        setShopTime((prev) => ({
                          ...prev,
                          [day]: {
                            ...prev[day],
                            closingTime: e.target.value,
                          },
                        }))
                      }
                    />
                    <input
                      className="px-2 mx-2 mt-2"
                      type="checkbox"
                      name={`${day}-isClosed`}
                      checked={
                        shopTime[day].isClosed === "1" ||
                        shopTime[day].isClosed === "true"
                      }
                      onChange={(e) =>
                        setShopTime((prev) => ({
                          ...prev,
                          [day]: {
                            ...prev[day],
                            isClosed: e.target.checked ? "1" : "0",
                          },
                        }))
                      }
                    />
                    <label
                      htmlFor={`${day}-isClosed`}
                      className="form-label fw-semibold mt-2"
                    >
                      Close Shop
                    </label>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>,
        )}

        {/* Delivery Timings Section */}
        {renderAccordion(
          "Delivery Timings",
          <Row className="d-flex align-items-center my-2">
            <Col md={3}>
              <FloatingLabel controlId="delivery_time" label="Delivery Time">
                <Form.Control
                  size="sm"
                  name="delivery_time"
                  type="number"
                  value={deliveryTimings.delivery_time}
                  onChange={handleDeliveryTimings}
                />
              </FloatingLabel>
            </Col>
            <Col md={3}>
              <FloatingLabel controlId="pickup_time" label="Pickup Time">
                <Form.Control
                  size="sm"
                  type="number"
                  name="pickup_time"
                  value={deliveryTimings.pickup_time}
                  onChange={handleDeliveryTimings}
                />
              </FloatingLabel>
            </Col>
            <Col md={3}>
              <FloatingLabel controlId="instore_time" label="InStore Time">
                <Form.Control
                  size="sm"
                  type="number"
                  name="instore_time"
                  value={deliveryTimings.instore_time}
                  onChange={handleDeliveryTimings}
                />
              </FloatingLabel>
            </Col>
          </Row>,
        )}

        {/* Store Details Section */}
        {renderAccordion(
          "Store Details",
          <Row>
            <label className="my-4 fw-bold">Store Details for Website</label>
            <Row className="mb-3">
              <Col md={4}>
                <FloatingLabel controlId="name" label="Store Name">
                  <Form.Control
                    size="sm"
                    type="text"
                    name="name"
                    value={storeDetails.name}
                    onChange={handleInputChange}
                    placeholder="Store Name"
                    required
                  />
                </FloatingLabel>
              </Col>
              <Col md={4}>
                <FloatingLabel controlId="phone" label="Phone Number">
                  <Form.Control
                    size="sm"
                    type="tel"
                    name="phone"
                    value={storeDetails.phone}
                    onChange={handleInputChange}
                    placeholder="Phone Number"
                  />
                </FloatingLabel>
              </Col>
              <Col md={4}>
                <FloatingLabel controlId="Email" label="Email Address">
                  <Form.Control
                    size="sm"
                    type="tel"
                    name="email"
                    value={storeDetails.email}
                    onChange={handleInputChange}
                    placeholder="Email Address"
                  />
                </FloatingLabel>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <FloatingLabel controlId="address" label="Address">
                  <Form.Control
                    size="sm"
                    as="textarea"
                    name="address"
                    value={storeDetails.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    style={{ height: "100px" }}
                  />
                </FloatingLabel>
              </Col>
              <Col md={6}>
                <FloatingLabel controlId="description" label="Description">
                  <Form.Control
                    size="sm"
                    as="textarea"
                    name="description"
                    value={storeDetails.description}
                    onChange={handleInputChange}
                    placeholder="description"
                    style={{ height: "100px" }}
                  />
                </FloatingLabel>
              </Col>
            </Row>
          </Row>,
        )}

        {/* COD Section */}
        {renderAccordion(
          "Delivery Options",
          <Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="cod-switch"
                  label="Enable Cash Payment"
                  checked={allowCOD}
                  onChange={(e) => {
                    setAllowCOD(e.target.checked);
                  }}
                  className="mb-0"
                />
              </Col>
              <Col md={6}>
                <p>
                  Disabling this will remove the COD functionality from the
                  store. Make sure to set up the payment gateway before
                  disabling this feature.
                </p>
              </Col>
            </Row>
            {/* New Option 1: Disable Delivery Orders */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="delivery-switch"
                  label="Disable Delivery Orders"
                  checked={disableDelivery}
                  onChange={(e) => {
                    setDisableDelivery(e.target.checked);
                  }}
                  className="mb-0"
                />
              </Col>
              <Col md={6}>
                <p>
                  Disabling this will prevent customers from placing delivery
                  orders. Only pickup orders will be available.
                </p>
              </Col>
            </Row>
            {/* New Option 2: Disable Pickup Orders */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="pickup-switch"
                  label="Disable Pickup Orders"
                  checked={disablePickup}
                  onChange={(e) => {
                    setDisablePickup(e.target.checked);
                  }}
                  className="mb-0"
                />
              </Col>
              <Col md={6}>
                <p>
                  Disabling this will prevent customers from placing pickup
                  orders. Only delivery orders will be available.
                </p>
              </Col>
            </Row>
            <Row className="d-flex align-items-center mb-2">
              <Col md={6} className="d-flex align-items-center gap-2">
                <Form.Check
                  type="switch"
                  id="allow-orders-from-allowed-post-codes"
                  label=" Only Allow Orders from Delivery Configuraton Post Codes"
                  checked={allowOrdersFromAllowedPostCodes}
                  onChange={(e) => {
                    setAllowOrdersFromAllowedPostCodes(e.target.checked);
                  }}
                  className="mb-0"
                />
              </Col>
              <Col md={6}>
                <p>
                  Disabling this will allow orders from any post code. Make sure
                  to set up the delivery configuration before disabling this
                  feature.
                </p>
              </Col>
            </Row>
            ,
          </Row>,
        )}

        {/* Public Site Section */}
        {renderAccordion(
          "Public Site",
          <Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Public Site Logo URL</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter logo URL (e.g., https://example.com/logo.png)"
                    value={siteLogo}
                    onChange={(e) => setSiteLogo(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Enter the URL of your logo image. Recommended size:
                    200x50px.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                {siteLogo && (
                  <div>
                    <p>Current Logo:</p>
                    <img
                      src={siteLogo}
                      alt="Site Logo"
                      style={{ maxHeight: "50px", maxWidth: "200px" }}
                    />
                  </div>
                )}
              </Col>
            </Row>
            {/* New Option 3: Upload Logo Image */}
            {/* <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Public Site Logo</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        // Handle file upload logic here
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSiteLogo(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <Form.Text className="text-muted">
                    Upload a logo image for the public site. Recommended size:
                    200x50px.
                  </Form.Text>
                </Form.Group>
              </Col> */}
            {/* <Col md={4}>
                {siteLogo && (
                  <div>
                    <p>Current Logo:</p>
                    <img
                      src={siteLogo}
                      alt="Site Logo"
                      style={{ maxHeight: "50px", maxWidth: "200px" }}
                    />
                  </div>
                )}
              </Col>
            </Row> */}
            <Row className="d-flex align-items-center mb-4">
              <Col md={3}>
                <Form.Group controlId="color">
                  <input
                    type="color"
                    className="form-control form-control-sm"
                    value={siteColor}
                    onChange={(e) => setSiteColor(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Row>,
        )}

        {/* Stripe Settings Section */}
        {renderAccordion(
          "Stripe Settings",
          <Row>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Check
                  type="switch"
                  id="stripe-switch"
                  label="Enable Stripe Integration"
                  checked={stripe.is_enabled}
                  onChange={(e) => {
                    setStripe({
                      ...stripe,
                      is_enabled: e.target.checked,
                    });
                  }}
                  className="mb-0"
                />
              </Col>
              <Col md={4}>
                <FloatingLabel
                  controlId="stripe_public_key"
                  label="Stripe Public Key"
                >
                  <Form.Control
                    size="sm"
                    type="password"
                    name="stripe_public_key"
                    value={stripe.stripe_public_key}
                    onChange={(e) => {
                      setStripe({
                        ...stripe,
                        stripe_public_key: e.target.value,
                      });
                    }}
                    placeholder="Stripe Public Key"
                  />
                </FloatingLabel>
              </Col>
              <Col md={4}>
                <FloatingLabel
                  controlId="stripe_secret_key"
                  label="Stripe Secret Key"
                >
                  <Form.Control
                    size="sm"
                    type="password"
                    name="stripe_secret_key"
                    value={stripe.stripe_secret_key}
                    onChange={(e) => {
                      setStripe({
                        ...stripe,
                        stripe_secret_key: e.target.value,
                      });
                    }}
                    placeholder="Stripe Secret Key"
                  />
                </FloatingLabel>
              </Col>
              <Col md={4}>
                <FloatingLabel
                  controlId="stripe_webhook_secret"
                  label="Stripe Webhook Secret"
                >
                  <Form.Control
                    size="sm"
                    type="password"
                    name="stripe_webhook_secret"
                    value={stripe.stripe_webhook_secret}
                    onChange={(e) => {
                      setStripe({
                        ...stripe,
                        stripe_webhook_secret: e.target.value,
                      });
                    }}
                    placeholder="Stripe Webhook Secret"
                  />
                </FloatingLabel>
              </Col>
            </Row>
          </Row>,
        )}

        {/* Print Count Section */}
        {renderAccordion(
          "Print Count",
          <Row className="d-flex align-items-center mb-2">
            <Col md={3}>
              <FloatingLabel controlId="printCount" label="Print Count">
                <Form.Control
                  size="sm"
                  type="number"
                  value={printCount}
                  onChange={handlePrintCountChange}
                />
              </FloatingLabel>
            </Col>
          </Row>,
        )}

        {/* MQTT Status Section */}
        {renderAccordion(
          "Display Auto printing status on Header",
          <Row className="d-flex align-items-center mb-2">
            <Col md={3} className="d-flex align-items-center gap-2">
              <Form.Check
                type="switch"
                id="mqtt-switch"
                label="Auto printing status"
                checked={mqttStatus}
                onChange={handleMqttStatusChange}
                className="mb-0"
              />
            </Col>
          </Row>,
        )}

        {/* Save All Button */}
        <Row>
          <Col xs={12} className="d-flex justify-content-end mt-4">
            <Button variant="primary" size="lg" onClick={handleSaveAllSettings}>
              Save All Settings
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Store;
