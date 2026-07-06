import FeatherIcon, { Home, ShoppingBag } from "feather-icons-react";
import { useAppDispatch, useAppSelector } from "Hook/hooks";
import { Category } from "Models/category";
import { Item } from "Models/item";
import { Modifier } from "Models/modifier";
import { ModifierGroup } from "Models/modifierGroup";
import { useEffect, useMemo, useState } from "react";
import {
  Breadcrumb,
  Button,
  Col,
  Container,
  FloatingLabel,
  Form,
  Modal,
  Row,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
  BookingHeader,
  CartItem,
  getCategories,
  resetBooking,
  saveBooking,
  setBooking,
  setCurrentView,
  setNavigationStack,
  setSelectedCategory,
  setSelectedItem,
  setSelectedModifierGroup,
  setSelectedSubCategory,
  setSummaryDiscount,
  updateBooking,
  VIEW,
} from "../../Redux/Ducks/homeSlice";
import { toggleLoader } from "../../Redux/Ducks/loaderSlice";
import { setToast } from "../../Redux/Ducks/toastSlice";
import {
  requestGetModifierGroup,
  requestPhoneNumberDetails,
} from "../../Redux/Sagas/Requests/home";
import { API_URL } from "Utils/constants";
import {
  getOrders,
  removeEditOrder,
  updateOrderStatus,
} from "../../Redux/Ducks/orderSlice";

import { formatSave } from "Utils/date-formate";
import { DateTime } from "ts-luxon";

const Menu = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const deliveryConfiguration = useAppSelector(
    (x) => x.Setting.delivery_configuration,
  );
  const {
    navigationStack,
    currentView,
    selectedCategory,
    selectedSubCategory,
    selectedItem,
    selectedModifierGroup,
    booking,
    summaryDiscount,
  } = useAppSelector((x) => x.Home);
  const EditOrderItem = useAppSelector((x) => x.Order.EditOrderItem);
  const EditOrderItemID = useAppSelector((x) => x.Order.EditOrderItemID);
  const [showOptions, setShowOptions] = useState<boolean>(true);
  const [isOptionsModal, toggleOptionsModal] = useState<boolean>(false);

  const [isDicountModalOpen, toggleDiscountModal] = useState<boolean>(false);
  const [isAddItemModalOpen, toggleAddItemModal] = useState<boolean>(false);
  const [isCommentModalOpen, toggleCommentModal] = useState<boolean>(false);
  const [isItemCommentModalOpen, toggleItemCommentModal] = useState(false);
  const [isAddModifierModalOpen, toggleAddModifierModal] = useState(false);
  const [selectedCommentItem, setSelectedCommentItem] =
    useState<CartItem | null>(null);
  const [isSubtotalVisisble, toggleSubtotal] = useState<boolean>(true);
  const [discountPrice, setDiscountPrice] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [itemComment, setItemComment] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState(0);
  const [modifierName, setModifierName] = useState("");
  const [modifierPrice, setModifierPrice] = useState(0);
  const settings = useAppSelector((state) => state.Setting.settings);
  const [currencySymbol, setCurrencySymbol] = useState<string>("");
  const [serviceCharges, setServiceCharges] = useState<number>(0);
  const [isPostalCodeMatched, setIsPostalCodeMatched] = useState<any>({
    isMatched: false,
    data: null,
  });
  const [isRestrictedPostalCode, setIsRestrictedPostalCode] =
    useState<boolean>(false);
  const [disableDelivery, setDisableDelivery] = useState(false);
  const [disablePickup, setDisablePickup] = useState(false);

  const hasItemsinCart = booking.items.length > 0;
  const categories = useAppSelector((x) => x.Home.categories);
  const store_id = useAppSelector((x) => x.Home.selected_store) as any;
  const store_slug = useAppSelector(
    (x) => x.Home.stores.find((x) => x.id == store_id)?.slug,
  ) as any;

  // Find currency symbol from the settings object
  useEffect(() => {
    if (settings.find((x) => x.key == "currency-symbol")?.value)
      setCurrencySymbol(
        settings.find((x) => x.key == "currency-symbol")?.value as any,
      );
  }, [settings]);

  // Memoize service_charges setting
  const serviceChargesSetting = useMemo(() => {
    return settings.find((x) => x.key === "service_charges");
  }, [settings]);

  // Sync service_charges state when setting changes
  useEffect(() => {
    if (serviceChargesSetting?.value) {
      const parsed = parseFloat(serviceChargesSetting.value);
      setServiceCharges(isNaN(parsed) ? 0 : parsed);
    }
  }, [serviceChargesSetting]);

  useEffect(() => {
    const allowOrderFromDC = settings.find(
      (x: any) => x.key === "allow_orders_from_allowed_post_codes",
    );
    if (allowOrderFromDC?.value) {
      setIsRestrictedPostalCode(allowOrderFromDC.value === "true");
    }
  }, [settings]);

  // Sync Delivery Options
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

  const findMatchingDelivery = (postCode: any, deliveryConfiguration: any) => {
    // Normalize: keep the space!
    let normalizedInput = postCode
      .trim()
      .replace(/\s{2,}/g, " ")
      .toUpperCase();

    // Auto-correct: If no space and input looks like a full postcode (e.g., "LS13BE")
    if (!normalizedInput.includes(" ") && normalizedInput.length >= 5) {
      let bestCorrection = null;
      let bestOutwardLength = -1;

      // ✅ START FROM 4 (longest outward) to prefer "LS13" over "LS1"
      for (let i = 4; i >= 2; i--) {
        const possibleOutward = normalizedInput.slice(0, i);
        const possibleInward = normalizedInput.slice(i);

        if (possibleInward.length === 3) {
          // Check if this is a valid postcode format
          // Outward: letters + digits, Inward: digit + letters
          if (
            /^[A-Z]+\d+$/.test(possibleOutward) &&
            /^\d[A-Z]{2}$/.test(possibleInward)
          ) {
            // Prefer longer outward codes (more specific)
            if (i > bestOutwardLength) {
              bestOutwardLength = i;
              bestCorrection = possibleOutward + " " + possibleInward;
            }
          }
        }
      }

      if (bestCorrection) {
        console.log(
          `Auto-corrected "${normalizedInput}" → "${bestCorrection}"`,
        );
        normalizedInput = bestCorrection;
      }
    }
    const parts = normalizedInput.split(" ");
    const inputOutward = parts[0] || "";
    const inputInward = parts[1] || "";

    // Check if input has a valid inward code (1-3 characters, starting with digit)
    const hasInward =
      inputInward && inputInward.length > 0 && inputInward.length <= 3;

    const matches = deliveryConfiguration
      .map((config: any) => {
        const configCode = config.code || "";
        const normalizedConfig = configCode
          .trim()
          .replace(/\s{2,}/g, " ")
          .toUpperCase();

        const configParts = normalizedConfig.split(" ");
        const configOutward = configParts[0] || "";
        const configInward = configParts[1] || "";
        const hasConfigInward =
          configInward && configInward.length > 0 && configInward.length <= 3;

        let score = 0;
        let matchType = "";

        // PRIORITY 1: Exact full postcode match (outward + inward) - HIGHEST
        if (
          hasInward &&
          hasConfigInward &&
          normalizedInput === normalizedConfig
        ) {
          score = 1000;
          matchType = "FULL_EXACT";
        }
        // PRIORITY 2: Same outward, input inward matches config inward exactly
        else if (
          hasInward &&
          hasConfigInward &&
          inputOutward === configOutward &&
          inputInward === configInward
        ) {
          score = 950;
          matchType = "FULL_INWARD_EXACT";
        }
        // PRIORITY 3: Input inward is a prefix of config inward (e.g., "LS12 4" → "LS12 4AB")
        else if (
          hasInward &&
          hasConfigInward &&
          inputOutward === configOutward &&
          configInward.startsWith(inputInward) &&
          inputInward !== configInward
        ) {
          score = 900;
          matchType = "FULL_INWARD_PREFIX";
        }
        // PRIORITY 4: Config inward is a prefix of input inward (e.g., "LS12 4AB" → "LS12 4")
        else if (
          hasInward &&
          hasConfigInward &&
          inputOutward === configOutward &&
          inputInward.startsWith(configInward) &&
          inputInward !== configInward
        ) {
          score = 875;
          matchType = "FULL_INWARD_MATCH";
        }
        // PRIORITY 5: Same outward, both have inward but different
        else if (
          hasInward &&
          hasConfigInward &&
          inputOutward === configOutward
        ) {
          score = 800;
          matchType = "FULL_SAME_OUTWARD";
        }
        // PRIORITY 6: Input has inward, config has no inward, same outward
        else if (
          hasInward &&
          !hasConfigInward &&
          inputOutward === configOutward
        ) {
          score = 700;
          matchType = "OUTWARD_MATCH_FULL_INPUT";
        }
        // PRIORITY 7: Both outward-only and match exactly
        else if (
          !hasInward &&
          !hasConfigInward &&
          inputOutward === configOutward
        ) {
          score = 600;
          matchType = "EXACT_OUTWARD";
        }
        // PRIORITY 8: Input outward-only, config has inward, same outward
        else if (
          !hasInward &&
          hasConfigInward &&
          inputOutward === configOutward
        ) {
          score = 500;
          matchType = "OUTWARD_MATCH_WITH_CONFIG_INWARD";
        }
        // PRIORITY 9: Prefix match for outward codes (only when input has NO inward)
        else if (
          !hasInward &&
          !hasConfigInward &&
          inputOutward !== configOutward &&
          inputOutward.startsWith(configOutward)
        ) {
          // Only allow if config is a valid outward prefix
          const lastChar = configOutward[configOutward.length - 1];
          if (lastChar >= "0" && lastChar <= "9") {
            score = 400;
            matchType = "OUTWARD_PREFIX";
          }
        }

        return {
          config,
          score,
          matchType,
          codeLength: normalizedConfig.length,
          hasInward: hasConfigInward,
          configOutward,
          configInward,
        };
      })
      .filter((m: any) => m.score > 0)
      .sort((a: any, b: any) => {
        // Higher score wins
        if (a.score !== b.score) return b.score - a.score;
        // If scores equal, prefer longer codes (more specific)
        return b.codeLength - a.codeLength;
      });

    // ✅ FIX 2: If no match found, try to find the longest prefix match
    if (matches.length === 0) {
      // Try to match just the outward code (even if invalid)
      const fallbackMatches = deliveryConfiguration
        .map((config: any) => {
          const configCode = config.code || "";
          const normalizedConfig = configCode
            .trim()
            .replace(/\s{2,}/g, " ")
            .toUpperCase();

          const configParts = normalizedConfig.split(" ");
          const configOutward = configParts[0] || "";

          // Check if input outward starts with config outward
          if (
            inputOutward.startsWith(configOutward) &&
            configOutward.length > 0
          ) {
            // Score based on how much of the outward matches
            const matchLength = configOutward.length;
            const score = matchLength * 100; // Longer matches get higher scores

            return {
              config,
              score,
              matchType: "FALLBACK_PREFIX",
              codeLength: normalizedConfig.length,
            };
          }
          return null;
        })
        .filter((m: any) => m !== null)
        .sort((a: any, b: any) => b.score - a.score);

      if (fallbackMatches.length > 0) {
        console.log(
          `⚠️  Fallback match: "${inputOutward}" → "${fallbackMatches[0].config.code}"`,
        );
        return fallbackMatches[0].config;
      }
    }

    // Debug output
    if (matches.length > 0) {
      console.log(
        `✅ "${postCode}" → "${matches[0].config.code}" (${matches[0].matchType})`,
      );
      if (matches.length > 1) {
        const otherMatches = matches
          .slice(1, 4)
          .map((m: any) => m.config.code + ` (${m.matchType})`);
        console.log(
          `   Other matches: ${otherMatches.join(", ")}${matches.length > 4 ? `, +${matches.length - 4} more` : ""}`,
        );
      }
    } else {
      console.log(`❌ "${postCode}" → No match found`);
    }

    return matches.length > 0 ? matches[0].config : null;
  };

  const totals = useMemo(() => {
    // 1. Subtotal = items + modifiers
    let subtotal = 0;

    booking.items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      const modifiersTotal =
        item.modifiers.reduce((sum, mod) => sum + (mod.price || 0), 0) *
        item.quantity;
      subtotal += itemTotal + modifiersTotal;
    });

    // 2. Delivery charges
    let deliveryCharges = 0;
    const postCode = (booking.header.post_code || "")
      .replace(/\s+/g, "")
      .toUpperCase();

    let matchingDelivery = findMatchingDelivery(
      postCode,
      deliveryConfiguration,
    );

    // Apply delivery charges logic

    if (matchingDelivery) {
      const { min_order, free_delivery_amount, charges, driver_fee } =
        matchingDelivery;

      setIsPostalCodeMatched({ isMatched: true, data: matchingDelivery });

      if (booking.header.order_type !== "Delivery") {
        matchingDelivery = null;
        deliveryCharges = 0;
      } else if (
        subtotal >= Number(free_delivery_amount) &&
        Number(free_delivery_amount) !== 0
      ) {
        deliveryCharges = 0; // Free delivery
      } else if (subtotal >= Number(min_order)) {
        deliveryCharges = Number(charges) + Number(driver_fee);
      } else {
        deliveryCharges = Number(charges) + Number(driver_fee);
      }
    } else {
      setIsPostalCodeMatched({ isMatched: false, data: null });
    }

    // 3. Pre-discount total (includes service charges if cart has items)
    let preDiscountTotal =
      subtotal + deliveryCharges + (hasItemsinCart ? serviceCharges : 0);

    // 4. Discount applied on the full amount
    let discount = 0;
    if (
      summaryDiscount.discountType != null &&
      summaryDiscount.discountValue != null
    ) {
      if (summaryDiscount.discountType === "price") {
        discount = summaryDiscount.discountValue;
      } else if (summaryDiscount.discountType === "percentage") {
        discount = (summaryDiscount.discountValue / 100) * preDiscountTotal;
      }
    }

    if (discount > preDiscountTotal) {
      discount = preDiscountTotal;
    }

    // 5. Final total
    const total = preDiscountTotal - discount;

    return {
      subtotal, // items + modifiers only
      deliveryCharges,
      serviceCharges: hasItemsinCart ? serviceCharges : 0,
      discount,
      total,
    };
  }, [booking, summaryDiscount, deliveryConfiguration, serviceCharges]);

  const categories_loaded = useAppSelector((x) => x.Home.categories_loaded);

  useEffect(() => {
    dispatch(
      setBooking({
        ...booking,
        header: {
          ...booking.header,
          store_id,
        },
      }),
    );

    if (!categories_loaded) {
      dispatch(getCategories(store_id));
    }
  }, [categories_loaded, store_id]);

  useEffect(() => {
    dispatch(
      setBooking({
        ...booking,
        header: {
          ...booking.header,
          total: totals.total,
          amount: totals.subtotal,
          service_charges: serviceCharges,
          delivery_charges: totals.deliveryCharges,
          discount: totals.discount,
        },
      }),
    );
  }, [
    totals.total,
    totals.subtotal,
    totals.deliveryCharges,
    totals.discount,
    serviceCharges,
  ]);

  const handleCategoryClick = (category: Category) => {
    let stack = [{ type: VIEW.CATEGORIES, value: category }];
    dispatch(setNavigationStack(stack));
    dispatch(setSelectedCategory(category));
    dispatch(setCurrentView(VIEW.SUB_CATEGORIES));

    if (
      category.children?.[0]?.name == category.name &&
      category.children.length == 1
    ) {
      let firstSubCategory = category.children[0];
      if (firstSubCategory) dispatch(setSelectedSubCategory(firstSubCategory));
      dispatch(setCurrentView(VIEW.ITEMS));
    }
  };

  const handleSubCategoryClick = (subCategory: Category) => {
    let stack = [
      ...navigationStack,
      { type: VIEW.SUB_CATEGORIES, value: subCategory },
    ];
    dispatch(setNavigationStack(stack));
    dispatch(setSelectedSubCategory(subCategory));
    dispatch(setCurrentView(VIEW.ITEMS));
  };

  const handleItemClick = (item: Item) => {
    const stack = [...navigationStack, { type: VIEW.ITEMS, value: item }];
    dispatch(setNavigationStack(stack));

    // ---- DUMMY / DEFAULT VALUES (TEMPORARY) ----
    const defaultQuantity = item.default_quantity ?? 1;
    const defaultDiscount = Number(item.default_discount) ?? 0;
    const defaultDiscountType = item.default_discount_type ?? "amount";
    // -------------------------------------------

    const price = Number(item.price) || 0;

    const calculateUnitPrice = () => {
      const base = price * defaultQuantity;

      let discountedTotal = base;

      if (defaultDiscountType === "percentage") {
        discountedTotal = base - base * (defaultDiscount / 100);
      } else {
        discountedTotal = base - defaultDiscount;
      }

      return discountedTotal / defaultQuantity;
    };

    const newItem: CartItem = {
      id: item.id,
      name: item.name,
      price: calculateUnitPrice(),
      comment: "",
      quantity: defaultQuantity,
      modifiers: [],
      amount: price,
    };

    dispatch(
      setBooking({
        ...booking,
        items: [...booking.items, newItem],
      }),
    );

    dispatch(setSelectedItem(item));

    if (item.modifier_groups.length > 0) {
      const sortedGroups = [...item.modifier_groups].sort((a, b) => {
        const getSortKey = (group: typeof a) => {
          const sort =
            typeof group.pivot?.sort === "number" ? group.pivot.sort : -1;
          const id = group.pivot?.id ?? group.id;
          return { sort, id };
        };

        const aKey = getSortKey(a);
        const bKey = getSortKey(b);

        if (aKey.sort !== bKey.sort) return aKey.sort - bKey.sort;
        return aKey.id - bKey.id;
      });

      dispatch(setSelectedModifierGroup(sortedGroups[0]));
      dispatch(setCurrentView(VIEW.MODIFIER_GROUP));
    } else {
      dispatch(setNavigationStack([]));
      dispatch(setCurrentView(VIEW.CATEGORIES));
    }
  };

  const getSortKey = (group: ModifierGroup) => {
    const sort = typeof group.pivot?.sort === "number" ? group.pivot.sort : -1;
    const id = group.pivot?.id ?? group.id;
    return { sort, id };
  };

  const sortModifierGroups = (groups: ModifierGroup[]) => {
    return [...groups].sort((a, b) => {
      const aKey = getSortKey(a);
      const bKey = getSortKey(b);

      if (aKey.sort !== bKey.sort) {
        return aKey.sort - bKey.sort; // lower sort = higher priority
      }
      return aKey.id - bKey.id; // tie-break using pivot.id
    });
  };

  const goBack = () => {
    if (selectedModifierGroup && selectedItem?.modifier_groups) {
      const modifierGroups = selectedItem.modifier_groups;
      const sortedGroups = sortModifierGroups(modifierGroups);

      const currentIndex = sortedGroups.findIndex(
        (g) =>
          g.id === selectedModifierGroup.id &&
          g.pivot?.id === selectedModifierGroup.pivot?.id,
      );

      const previousGroup = sortedGroups[currentIndex - 1];

      if (previousGroup) {
        dispatch(setSelectedModifierGroup(previousGroup));
        dispatch(setCurrentView(VIEW.MODIFIER_GROUP));
        return;
      }
    }

    // fallback to stack
    const stack = [...navigationStack];
    if (stack.length === 0) {
      dispatch(setCurrentView(VIEW.CATEGORIES));
    } else {
      const last = stack.pop();
      dispatch(setCurrentView(last?.type || VIEW.CATEGORIES));
    }
    dispatch(setNavigationStack(stack));
  };

  const goNext = () => {
    if (selectedModifierGroup && selectedItem?.modifier_groups) {
      const modifierGroups = selectedItem.modifier_groups;
      const sortedGroups = sortModifierGroups(modifierGroups);

      const currentIndex = sortedGroups.findIndex(
        (g) =>
          g.id === selectedModifierGroup.id &&
          g.pivot?.id === selectedModifierGroup.pivot?.id,
      );

      const nextGroup = sortedGroups[currentIndex + 1];

      if (nextGroup) {
        dispatch(setSelectedModifierGroup(nextGroup));
      } else {
        dispatch(setNavigationStack([]));
        dispatch(setCurrentView(VIEW.CATEGORIES));
      }
    } else {
      dispatch(setNavigationStack([]));
      dispatch(setCurrentView(VIEW.CATEGORIES));
    }
  };

  const getNextSortedModifierGroup = (
    modifierGroups: ModifierGroup[] | undefined,
    currentGroupId: number,
    currentPivotId: number,
  ): ModifierGroup | null => {
    if (!Array.isArray(modifierGroups)) return null;

    const sortedGroups = sortModifierGroups(modifierGroups);

    const currentIndex = sortedGroups.findIndex(
      (g) => g.id === currentGroupId && g.pivot?.id === currentPivotId,
    );

    return currentIndex >= 0 && currentIndex + 1 < sortedGroups.length
      ? sortedGroups[currentIndex + 1]
      : null;
  };

  const handleModifierClick = async (modifier: Modifier) => {
    const updatedCart = [...booking.items];
    const lastItemIndex = updatedCart.length - 1;
    const lastItem = { ...updatedCart[lastItemIndex] };

    const clonedModifiers = [...(lastItem.modifiers || [])];

    if (!selectedModifierGroup || !selectedItem) return;

    const pivotId = selectedModifierGroup.pivot?.id;
    if (!pivotId) {
      console.warn("No pivot.id found for selectedModifierGroup");
      return;
    }

    // Count how many times this exact modifier (within this pivot group) is already selected
    const currentCount = clonedModifiers.filter(
      (mod) => mod.id === modifier.id && mod.pivotId === pivotId,
    ).length;

    // Count total modifiers in this group (by pivot)
    const groupCount = clonedModifiers.filter(
      (mod) => mod.pivotId === pivotId,
    ).length;

    if (modifier.allow_multiple) {
      if (modifier.max > 0 && currentCount >= modifier.max) {
        dispatch(
          setToast({
            type: "error",
            message: `Cannot add more of this modifier. Max allowed: ${modifier.max}`,
          }),
        );
        return;
      }

      if (
        selectedModifierGroup.max > 0 &&
        groupCount >= selectedModifierGroup.max
      ) {
        dispatch(
          setToast({
            type: "error",
            message: `Cannot add more modifiers in this group. Group max: ${selectedModifierGroup.max}`,
          }),
        );
        return;
      }
    } else {
      if (
        selectedModifierGroup.max > 0 &&
        groupCount >= selectedModifierGroup.max
      ) {
        dispatch(
          setToast({
            type: "error",
            message: `Cannot add more modifiers in this group. Group max: ${selectedModifierGroup.max}`,
          }),
        );
        return;
      }
    }

    if (customSelection !== "") {
      clonedModifiers.push({
        id: modifier.id,
        name: `${customSelection} ${modifier.name}`,
        price: 0,
        pivotId: pivotId, // track unique group instance
      });
      setCustomSelection("");
    } else {
      // ✅ Add modifier with pivotId
      clonedModifiers.push({
        id: modifier.id,
        name: modifier.name,
        price: parseFloat(modifier.price as any),
        pivotId: pivotId, // track unique group instance
      });
    }

    // Recalculate total
    const modifiersTotal = clonedModifiers.reduce(
      (sum, mod) => sum + (mod.price || 0),
      0,
    );

    lastItem.modifiers = clonedModifiers;
    lastItem.amount = (lastItem.price + modifiersTotal) * lastItem.quantity;

    updatedCart[lastItemIndex] = lastItem;

    dispatch(
      setBooking({
        ...booking,
        items: updatedCart,
      }),
    );

    // --- MIN checks (only for this pivot group) ---
    if (currentCount + 1 < modifier.min) {
      dispatch(
        setToast({
          type: "error",
          message: `You must select at least ${modifier.min} of ${modifier.name}.`,
        }),
      );
      return;
    }

    if (groupCount + 1 < selectedModifierGroup.min) {
      dispatch(
        setToast({
          type: "error",
          message: `You must select at least ${selectedModifierGroup.min} modifiers in this group.`,
        }),
      );
      return;
    }

    // if Current Modifier contains next modifier group id, open it first
    let nextGroupSorted;
    if (modifier.next_modifier_group_id) {
      dispatch(toggleLoader(true));
      const res = await requestGetModifierGroup(
        modifier.next_modifier_group_id,
      );
      dispatch(toggleLoader(false));
      // Normalize to same shape used elsewhere
      const nextGroup = {
        ...res.data,
        pivot: res?.data?.pivot || { id: Date.now() }, // ✅ fallback pivot
      };
      dispatch(setSelectedModifierGroup(nextGroup));
      dispatch(setCurrentView(VIEW.MODIFIER_GROUP));
      return;
    } else {
      // Auto-open next group (same as before)
      nextGroupSorted = getNextSortedModifierGroup(
        selectedItem.modifier_groups,
        selectedModifierGroup.id,
        pivotId,
      );
    }

    if (!modifier.allow_multiple && nextGroupSorted) {
      if (!selectedModifierGroup.is_multi_selection) {
        dispatch(setSelectedModifierGroup(nextGroupSorted));
      }
    } else if (!modifier.allow_multiple) {
      dispatch(setNavigationStack([]));
      dispatch(setCurrentView(VIEW.CATEGORIES));
    }
  };

  const incrementItem = (item: CartItem) => {
    const updatedCart = booking.items.map((cartItem) => {
      if (cartItem === item) {
        const updatedItem = {
          ...cartItem,
          quantity: cartItem.quantity + 1,
        };
        const modifiersTotal = (updatedItem.modifiers || []).reduce(
          (sum, mod) => sum + (mod.price || 0),
          0,
        );
        updatedItem.amount =
          (updatedItem.price + modifiersTotal) * updatedItem.quantity;
        return updatedItem;
      }
      return cartItem;
    });

    dispatch(
      setBooking({
        ...booking,
        items: updatedCart,
      }),
    );
  };

  const decrementItem = (item: CartItem) => {
    const updatedCart = booking.items.map((cartItem) => {
      if (cartItem === item) {
        const updatedItem = {
          ...cartItem,
          quantity: cartItem.quantity - 1,
        };
        const modifiersTotal = (updatedItem.modifiers || []).reduce(
          (sum, mod) => sum + (mod.price || 0),
          0,
        );
        updatedItem.amount =
          (updatedItem.price + modifiersTotal) * updatedItem.quantity;
        return updatedItem;
      }
      return cartItem;
    });

    dispatch(
      setBooking({
        ...booking,
        items: updatedCart,
      }),
    );
  };

  const deleteItem = (item: CartItem) => {
    const updatedCart = booking.items.filter((ci) => ci !== item);
    dispatch(
      setBooking({
        ...booking,
        items: updatedCart,
      }),
    );
  };
  const deleteModifier = (ModifierIndex: number, itemIndex: number) => {
    const updatedItems = booking.items.map((item, index) => {
      if (index === itemIndex) {
        return {
          ...item,
          modifiers: item.modifiers.filter(
            (_, modIndex) => modIndex !== ModifierIndex,
          ),
        };
      }
      return item;
    });

    // Dispatch updated booking
    dispatch(
      setBooking({
        ...booking,
        items: updatedItems,
      }),
    );
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  const finishBooking = async () => {
    if (booking.items.length == 0) {
      return dispatch(setToast({ type: "error", message: "Cart Empty!" }));
    }

    if (disableDelivery && booking.header.order_type === "Delivery") {
      return dispatch(
        setToast({ type: "error", message: "Delivery is disabled." }),
      );
    }

    if (disablePickup && booking.header.order_type === "Pick Up") {
      return dispatch(
        setToast({ type: "error", message: "Pickup is disabled." }),
      );
    }

    if (booking.header.order_type === "Delivery") {
      if (
        isPostalCodeMatched.isMatched &&
        isPostalCodeMatched.data &&
        booking.header.total < parseFloat(isPostalCodeMatched.data.min_order)
      ) {
        dispatch(
          setToast({
            type: "error",
            message: `The minimum order amount for this postal code:${booking.header.post_code} must be ${currencySymbol}${isPostalCodeMatched.data.min_order}. `,
          }),
        );
        return;
      } else if (isPostalCodeMatched.isMatched && isPostalCodeMatched.data) {
        // ✅ Postal code matched successfully - allow the order
        console.log("Postal code matched, proceeding with order");
        // Continue with order placement
      } else if (isRestrictedPostalCode) {
        // ❌ Only show restricted error when no match AND restricted is true
        console.log(
          "isRestrictedPostalCode",
          isRestrictedPostalCode,
          isPostalCodeMatched.data,
        );
        return dispatch(
          setToast({
            type: "error",
            message:
              "We are currently unable to process orders for this postal code.",
          }),
        );
      }
    }

    if (EditOrderItemID && EditOrderItem.items.length > 0) {
      dispatch(
        updateBooking(booking, {
          onSuccess: async () => {
            await dispatch(updateOrderStatus("Pending"));
            dispatch(
              setBooking({
                header: {
                  phone_number: "",
                  first_name: "",
                  last_name: "",
                  post_code: "",
                  door_no: "",
                  street: "",
                  city: "",
                  order_type: "Delivery",
                  payment_method: "Cash",
                  amount: 0,
                  total: 0,
                  service_charges: 0,
                  delivery_charges: 0,
                  store_id: 0,
                  comment: "",
                  source: "pos",
                  discount: 0,
                },
                items: [],
              }),
            );
            setShowOptions(true);
            dispatch(setNavigationStack([]));
            dispatch(setCurrentView(VIEW.CATEGORIES));
            dispatch(setSelectedCategory(null));
            dispatch(setSelectedSubCategory(null));
            dispatch(setSelectedItem(null));
            dispatch(setSelectedModifierGroup(null));
            const today = new Date();
            const day = formatSave(today);
            const storeId = Number(store_id);
            dispatch(getOrders({ store_id: storeId, day }));
            // dispatch(setBeepCount(2));
            // requestTestPrinter(store_slug);
            dispatch(removeEditOrder());
            navigate("/orders");
          },
        }),
      );
    } else {
      dispatch(
        saveBooking(booking, {
          onSuccess: async () => {
            dispatch(
              setBooking({
                header: {
                  phone_number: "",
                  first_name: "",
                  last_name: "",
                  post_code: "",
                  door_no: "",
                  street: "",
                  city: "",
                  order_type: "Delivery",
                  payment_method: "Cash",
                  amount: 0,
                  total: 0,
                  service_charges: 0,
                  delivery_charges: 0,
                  store_id: 0,
                  comment: "",
                  source: "pos",
                  discount: 0,
                },
                items: [],
              }),
            );
            setShowOptions(true);
            dispatch(setNavigationStack([]));
            dispatch(setCurrentView(VIEW.CATEGORIES));
            dispatch(setSelectedCategory(null));
            dispatch(setSelectedSubCategory(null));
            dispatch(setSelectedItem(null));
            dispatch(setSelectedModifierGroup(null));
            const today = new Date();
            const day = formatSave(today);
            const storeId = Number(store_id);
            dispatch(getOrders({ store_id: storeId, day }));
            // dispatch(setBeepCount(2));
            // requestTestPrinter(store_slug);
            navigate("/orders");
          },
        }),
      );
    }
  };

  useEffect(() => {
    if (EditOrderItemID && EditOrderItem.items.length > 0) {
      dispatch(setBooking(EditOrderItem));
    }
  }, []);

  const handleCheckout = () => {
    dispatch(setNavigationStack([]));
    dispatch(setCurrentView(VIEW.CHECK_OUT));
  };

  const openDiscount = () => {
    if (booking.items.length >= 1) {
      toggleDiscountModal(true);
      resetDiscount();
    }
    closeOptionsModal();
  };

  const openAddItem = () => {
    toggleAddItemModal(true);
    closeOptionsModal();
  };

  const openComment = () => {
    toggleCommentModal(true);

    if (booking.header.comment) {
      setComment(booking.header.comment);
    }
    closeOptionsModal();
  };

  const openItemComment = (item: CartItem) => {
    setSelectedCommentItem(item); // store the index of the item
    setItemComment(booking.items.find((x) => x == item)?.comment || ""); // preload existing comment if any
    toggleItemCommentModal(true);
  };

  const openAddModifer = (item: CartItem) => {
    setSelectedCommentItem(item); // store the index of the item
    toggleAddModifierModal(true);
  };

  const closeDiscount = () => {
    toggleDiscountModal(false);
    setDiscountPrice(0);
    setDiscountPercentage(0);
    closeOptionsModal();
  };

  const closeAddItem = () => {
    toggleAddItemModal(false);
    setItemName("");
    setItemPrice(0);
    closeOptionsModal();
  };

  const closeComment = () => {
    toggleCommentModal(false);
    setComment("");
    closeOptionsModal();
  };

  const closeItemComment = () => {
    toggleItemCommentModal(false);
    setItemComment("");
    setSelectedCommentItem(null);
  };

  const closeAddModifier = () => {
    toggleAddModifierModal(false);
    setModifierName("");
    setModifierPrice(0);
    closeOptionsModal();
  };

  const closeOptionsModal = () => {
    toggleOptionsModal(false);
  };

  const openOptionsModal = () => {
    toggleOptionsModal(true);
  };

  const resetDiscount = () => {
    if (
      summaryDiscount.discountType == null ||
      summaryDiscount.discountValue == null
    ) {
      setDiscountPrice(0);
      setDiscountPercentage(0);
    } else {
      if (summaryDiscount.discountType == "price") {
        setDiscountPrice(summaryDiscount.discountValue);
        setDiscountPercentage(0);
        dispatch(
          setSummaryDiscount({
            discountType: "price",
            discountValue: 0,
          }),
        );
      } else if (summaryDiscount.discountType == "percentage") {
        setDiscountPercentage(summaryDiscount.discountValue);
        setDiscountPrice(0);
        dispatch(
          setSummaryDiscount({
            discountType: "percentage",
            discountValue: 0,
          }),
        );
      }
    }
  };

  const applyDiscount = () => {
    if (discountPrice > 0 || discountPercentage > 0) {
      dispatch(
        setSummaryDiscount({
          discountType: discountPrice > 0 ? "price" : "percentage",
          discountValue: discountPrice > 0 ? discountPrice : discountPercentage,
        }),
      );
      toggleSubtotal(true);
      closeDiscount();
    } else {
      toggleSubtotal(true);
      closeDiscount();
    }
  };

  const applyComment = () => {
    dispatch(
      setBooking({
        ...booking,
        header: {
          ...booking.header,
          comment,
        },
      }),
    );

    closeComment();
  };

  const applyItemComment = () => {
    if (selectedCommentItem !== null) {
      const updatedItems = [...booking.items];
      let idx = updatedItems.findIndex((x) => x == selectedCommentItem);
      if (idx != -1) {
        updatedItems[idx] = {
          ...updatedItems[idx],
          comment: itemComment,
        };

        dispatch(
          setBooking({
            ...booking,
            items: updatedItems,
          }),
        );
      }
    }

    closeItemComment();
  };

  const addItem = () => {
    dispatch(
      setBooking({
        ...booking,
        items: [
          ...booking.items,
          {
            id: 0,
            name: itemName,
            price: itemPrice,
            amount: itemPrice,
            comment: "",
            modifiers: [],
            quantity: 1,
          },
        ],
      }),
    );

    closeAddItem();
  };

  const addModifier = () => {
    if (selectedCommentItem !== null) {
      const updatedItems = [...booking.items];
      let idx = updatedItems.findIndex((x) => x == selectedCommentItem);
      if (idx != -1) {
        updatedItems[idx] = {
          ...updatedItems[idx],
          modifiers: [
            ...updatedItems[idx].modifiers,
            {
              id: 0,
              name: modifierName,
              price: modifierPrice,
            },
          ],
        };

        dispatch(
          setBooking({
            ...booking,
            items: updatedItems,
          }),
        );
      }
    }

    closeAddModifier();
  };

  const discountPriceChange = (e: any) => {
    setDiscountPrice(parseFloat(e.target.value));
    setDiscountPercentage(0);
  };

  const discountPercentageChange = (e: any) => {
    if (e.target.value <= 100) {
      setDiscountPercentage(parseFloat(e.target.value));
    }
    setDiscountPrice(0);
  };

  const commentChange = (e: any) => {
    setComment(e.target.value);
  };

  const itemCommentChange = (e: any) => {
    setItemComment(e.target.value);
  };

  const itemNameChange = (e: any) => {
    setItemName(e.target.value);
  };

  const itemPriceChange = (e: any) => {
    setItemPrice(parseFloat(e.target.value));
  };

  const modifierNamChange = (e: any) => {
    setModifierName(e.target.value);
  };

  const modifierPriceChange = (e: any) => {
    setModifierPrice(parseFloat(e.target.value));
  };

  const getPostCodeDetails = async (post_code: string) => {
    if (post_code.replace(" ", "").length == 6) {
      dispatch(toggleLoader(true));

      try {
        const res: any = await fetch(
          `${API_URL}postal-codes?code=${post_code}`,
        );

        const { data } = await res.json();
        if (res.status == 200) {
          dispatch(
            setBooking({
              ...booking,
              header: {
                ...booking.header,
                street: data?.street || "",
                city: data?.city || "",
              },
            }),
          );
        }
        dispatch(toggleLoader(false));
      } catch (err) {
        dispatch(toggleLoader(false));
        console.log(err);
      }
    }
  };

  const normalizeNumber = (num: string) => num.replace(/\s+/g, "").trim();
  const [lastPhoneNumber, setLastPhoneNumber] = useState("");

  const getPhoneNumberDetails = async (phone_number: string) => {
    setLastPhoneNumber(phone_number);
    if (lastPhoneNumber && lastPhoneNumber === phone_number) return;
    const normalizedInput = normalizeNumber(phone_number);
    const normalizedCurrent = normalizeNumber(lastPhoneNumber);

    if (normalizedInput == normalizedCurrent) return;

    if (normalizedInput) {
      dispatch(toggleLoader(true));

      try {
        const res: any = await requestPhoneNumberDetails(normalizedInput);

        const { data } = res;
        if (data) {
          dispatch(
            setBooking({
              ...booking,
              header: {
                ...booking.header,
                first_name: data?.first_name || "",
                last_name: data?.last_name || "",
                street: data?.street || "",
                city: data?.city || "",
                post_code: data?.post_code || "",
                door_no: data?.door_no || "",
              },
            }),
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        dispatch(toggleLoader(false));
      }
    }
  };

  const onBookingHeaderChange = (field: keyof BookingHeader, value: any) => {
    if (field === "order_type" && value !== "Delivery") {
      dispatch(
        setBooking({
          ...booking,
          header: {
            ...booking.header,
            post_code: "",
            door_no: "",
            street: "",
            city: "",
            [field]: value,
          },
        }),
      );
    } else
      dispatch(
        setBooking({
          ...booking,
          header: {
            ...booking.header,
            [field]: value,
          },
        }),
      );
  };

  const resetBookingFunc = () => {
    dispatch(resetBooking());
    dispatch(removeEditOrder());
    closeOptionsModal();
  };

  const [customSelection, setCustomSelection] = useState<string>("");

  const onFree = () => {
    setCustomSelection("FREE");
  };
  const onNo = () => {
    setCustomSelection("NO");
  };
  const onLess = () => {
    setCustomSelection("LESS");
  };

  const handleSearchClick = ({
    category,
    subCategory,
    item,
  }: {
    category: Category;
    subCategory: Category;
    item: Item;
  }) => {
    handleCategoryClick(category);
    handleSubCategoryClick(subCategory);
    handleItemClick(item);
  };

  const [mode, setMode] = useState("ALL");

  const onModeChange = (e: "DELIVERY" | "PICKUP" | "ALL") => {
    dispatch(setNavigationStack([]));
    dispatch(setCurrentView(VIEW.CATEGORIES));

    setMode(e);

    dispatch(
      setBooking({
        ...booking,
        header: {
          ...booking.header,
          order_type: e === "DELIVERY" || e === "ALL" ? "Delivery" : "Pick Up",
        },
      }),
    );
  };

  // Time Zone

  const [timeZone, setTimeZone] = useState<string>("UTC"); // default fallback
  console.log("Resolved timezone:", timeZone);
  useEffect(() => {
    const tzSetting = settings.find((x) => x.key === "timezone");

    if (!tzSetting?.value) {
      setTimeZone("UTC"); // fallback if missing
      return;
    }

    try {
      const parsed = JSON.parse(tzSetting.value); // ✅ parse the VALUE

      // expect object like { value: "Europe/London", ... }
      if (parsed?.value && typeof parsed.value === "string") {
        setTimeZone(parsed.value);
      } else if (typeof parsed === "string") {
        setTimeZone(parsed); // fallback if backend sends plain string
      } else {
        setTimeZone("UTC");
      }
    } catch (e) {
      console.warn("Invalid timezone JSON, fallback to UTC", e);
      setTimeZone("UTC");
    }
  }, [settings]);

  const isTimeWithinRange = (
    nowMinutes: number,
    startMinutes: number,
    endMinutes: number,
  ) => {
    // Normal same-day range
    if (startMinutes <= endMinutes) {
      return nowMinutes >= startMinutes && nowMinutes <= endMinutes;
    }

    // Overnight range (cross-midnight)
    return nowMinutes >= startMinutes || nowMinutes <= endMinutes;
  };

  const getTimePartsInTZ = (timeZone: string) => {
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const get = (type: string) => parts.find((p) => p.type === type)?.value;

    const weekdayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };

    const weekday = get("weekday");
    const hour = get("hour");
    const minute = get("minute");

    return {
      dayIndex: weekday ? (weekdayMap[weekday] ?? 0) : 0,
      hours: hour ? Number(hour) : 0,
      minutes: minute ? Number(minute) : 0,
    };
  };

  const getTodayInTZ = (timeZone: string) => {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date()); // YYYY-MM-DD
  };

  const isScheduledNow = (entity: any, timeZone: string) => {
    // No schedule → always visible
    if (!entity?.schedule || !entity?.schedule_config) return true;

    const config = entity.schedule_config;

    // --- DATE CHECK (timezone-safe) ---
    if (config.startDate && config.endDate) {
      const today = getTodayInTZ(timeZone);

      if (today < config.startDate || today > config.endDate) {
        return false;
      }
    }

    // --- TIME CHECK ---
    if (!config.startTime || !config.endTime) return true;

    const { dayIndex, hours, minutes } = getTimePartsInTZ(timeZone);

    const [sh, sm] = config.startTime.split(":").map(Number);
    const [eh, em] = config.endTime.split(":").map(Number);

    const nowMinutes = hours * 60 + minutes;
    const startMinutes = sh * 60 + sm;
    const endMinutes = eh * 60 + em;

    // --- DAILY ---
    if (entity.schedule === "DAILY") {
      return isTimeWithinRange(nowMinutes, startMinutes, endMinutes);
    }

    // --- WEEKLY ---
    const dayNameMap: Record<string, number> = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };

    if (entity.schedule === "WEEKLY") {
      const rawDays = config.days ?? [];

      const normalizedDays = rawDays
        .map((d: any) => {
          if (typeof d === "number") return d === 7 ? 0 : d; // support 1–7
          if (typeof d === "string") return dayNameMap[d.toUpperCase()];
          return null;
        })
        .filter((d: number | null): d is number => d !== null);

      if (!normalizedDays.includes(dayIndex)) return false;

      return isTimeWithinRange(nowMinutes, startMinutes, endMinutes);
    }

    return true;
  };

  const isBaseAvailable = (entity: any) => {
    const availability =
      entity.item_availability ??
      entity.category_availability ??
      entity.availability;

    const normalizedAvailability =
      typeof availability === "string"
        ? availability.toLowerCase()
        : availability;

    return normalizedAvailability === "available";
  };

  const isModeAvailable = (entity: any, mode: string) => {
    if (mode === "ALL") return true;
    if (mode === "DELIVERY") return entity.available_for_delivery === true;
    if (mode === "PICKUP") return entity.available_for_pickup === true;
    return false;
  };

  const isVisible = (entity: any, mode: string) => {
    if (!timeZone) return true; // skip schedule check until timezone loaded
    return (
      isBaseAvailable(entity) &&
      isModeAvailable(entity, mode) &&
      isScheduledNow(entity, timeZone)
    );
  };

  const isVisibleModifier = (modifier: Modifier, mode: string) => {
    return (
      isBaseAvailable(modifier) &&
      isModeAvailable(modifier, mode) &&
      isScheduledNow(modifier, timeZone)
    );
  };

  const isVisibleGroup = (group: any, mode: string) => {
    return isModeAvailable(group, mode) && isScheduledNow(group, timeZone);
  };

  const filterTree = (categories: Category[], mode: string): Category[] => {
    if (!categories) return [];

    return categories
      .map((category): Category | null => {
        if (!isVisible(category, mode)) return null;

        const children: Category[] = category.children
          ? filterTree(category.children, mode)
          : [];

        const items: Item[] = category.items
          ? category.items
              .map((item): Item | null => {
                if (!isVisible(item, mode)) return null;

                const modifier_groups: ModifierGroup[] =
                  item.modifier_groups
                    ?.map((group): ModifierGroup | null => {
                      if (!isVisibleGroup(group, mode)) return null;

                      const modifiers: Modifier[] =
                        group.modifiers.filter((mod) =>
                          isVisibleModifier(mod, mode),
                        ) || [];

                      if (modifiers.length === 0) return null;

                      return { ...group, modifiers };
                    })
                    .filter(
                      (group): group is ModifierGroup => group !== null,
                    ) || [];

                return { ...item, modifier_groups };
              })
              .filter((item): item is Item => item !== null)
          : [];

        return { ...category, children, items };
      })
      .filter((category): category is Category => category !== null);
  };

  const filteredCategories = useMemo(() => {
    return filterTree(categories, mode);
  }, [categories, mode, timeZone]); // add timeZone dependency

  const [isActive, setIsActive] = useState({
    category: null,
    sub: null,
    item: null,
    group: null,
    mod: null,
  });

  // Opened Linked Modifier Group

  const handleClickToOpenModifierGroup = (x: CartItem, y: any) => {
    let found: {
      category: Category;
      sub: Category;
      item: Item;
      group: ModifierGroup;
      mod: Modifier;
    } | null = null;

    categories.forEach((c: Category) => {
      c.children?.forEach((sub: Category) => {
        sub.items?.forEach((item: Item) => {
          if (item.id === x.id) {
            item.modifier_groups?.forEach((group: ModifierGroup) => {
              const mod = group.modifiers?.find(
                (mod: Modifier) => mod.id === y.id,
              );
              if (mod) {
                found = {
                  category: c,
                  sub,
                  item,
                  group,
                  mod,
                };
              }
            });
          }
        });
      });
    });

    if (found) {
      const { category, sub, item, group, mod } = found;
      dispatch(setSelectedModifierGroup(group));
      dispatch(setCurrentView(VIEW.MODIFIER_GROUP));
      setIsActive({
        category,
        sub,
        item,
        group,
        mod,
      });
    }
  };
  return (
    <>
      <Modal show={isDicountModalOpen} onHide={closeDiscount} centered>
        <Modal.Header closeButton>
          <Modal.Title>Discount</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col md="6">
              <FloatingLabel
                controlId="discountPrice"
                label="Discount Price"
                className="mb-3"
              >
                <Form.Control
                  size="sm"
                  type="number"
                  value={discountPrice}
                  onChange={discountPriceChange}
                />
              </FloatingLabel>
            </Col>
            <Col md="6">
              <FloatingLabel
                controlId="discountPercentage"
                label="Discount Percentage"
                className="mb-3"
              >
                <Form.Control
                  size="sm"
                  type="number"
                  value={discountPercentage}
                  onChange={discountPercentageChange}
                />
              </FloatingLabel>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={resetDiscount}>
            RESET
          </Button>
          <Button variant="primary" onClick={applyDiscount}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isCommentModalOpen} onHide={closeComment} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FloatingLabel controlId="comment" label="Comment" className="mb-3">
            <Form.Control
              size="sm"
              type="text"
              value={comment}
              onChange={commentChange}
            />
          </FloatingLabel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeComment}>
            CANCEL
          </Button>
          <Button variant="primary" onClick={applyComment}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isItemCommentModalOpen}
        onHide={closeItemComment}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Comment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FloatingLabel
            controlId="itemComment"
            label="Comment"
            className="mb-3"
          >
            <Form.Control
              size="sm"
              type="text"
              value={itemComment}
              onChange={itemCommentChange}
            />
          </FloatingLabel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeItemComment}>
            CANCEL
          </Button>
          <Button variant="primary" onClick={applyItemComment}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isAddItemModalOpen} onHide={closeAddItem} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Add Item</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FloatingLabel controlId="itemName" label="Name" className="mb-3">
            <Form.Control
              size="sm"
              type="text"
              value={itemName}
              onChange={itemNameChange}
            />
          </FloatingLabel>
          <FloatingLabel controlId="itemPrice" label="Price" className="mb-3">
            <Form.Control
              size="sm"
              type="number"
              value={itemPrice}
              onChange={itemPriceChange}
            />
          </FloatingLabel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeAddItem}>
            CANCEL
          </Button>
          <Button variant="primary" onClick={addItem}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isAddModifierModalOpen}
        onHide={closeAddModifier}
        centered
        size="sm"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Modifier</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FloatingLabel controlId="modifierName" label="Name" className="mb-3">
            <Form.Control
              size="sm"
              type="text"
              value={modifierName}
              onChange={modifierNamChange}
            />
          </FloatingLabel>
          <FloatingLabel
            controlId="modifierPrice"
            label="Price"
            className="mb-3"
          >
            <Form.Control
              size="sm"
              type="number"
              value={modifierPrice}
              onChange={modifierPriceChange}
            />
          </FloatingLabel>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={closeAddModifier}>
            CANCEL
          </Button>
          <Button variant="primary" onClick={addModifier}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={isOptionsModal}
        onHide={closeOptionsModal}
        centered
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>More Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="summary-options d-flex gap-2">
            <Button
              style={{
                height: "55px",
              }}
              variant="outline-primary"
              onClick={openAddItem}
              className="w-100"
            >
              <FeatherIcon icon="plus" size={16} className="me-1" />
              Add Item
            </Button>

            <Button
              className="w-100"
              style={{
                height: "55px",
              }}
              variant="success"
              onClick={openDiscount}
              disabled={booking.items.length < 1} // disable if no items
            >
              <FeatherIcon icon="percent" size={16} className="me-1" />
              Discount
            </Button>

            <Button
              style={{
                height: "55px",
              }}
              className="w-100"
              variant="outline-warning"
              onClick={openComment}
            >
              <FeatherIcon icon="message-circle" size={16} className="me-1" />
              Comments
            </Button>

            <Button
              style={{
                height: "55px",
              }}
              className="w-100"
              variant="outline-danger"
              onClick={resetBookingFunc}
            >
              <FeatherIcon icon="x" size={16} className="me-1" />
              Cancel
            </Button>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={closeOptionsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="menu">
        <Container fluid>
          <Row>
            <Col md="8" className="p-0">
              {currentView == VIEW.CHECK_OUT ? (
                <CheckOut
                  bookingHeader={booking.header}
                  onChange={onBookingHeaderChange}
                  onBack={goBack}
                  getPostCodeDetails={getPostCodeDetails}
                  getPhoneNumberDetails={getPhoneNumberDetails}
                  disableDelivery={disableDelivery}
                  disablePickup={disablePickup}
                />
              ) : (
                <div className="menu-panel">
                  <div className="menu-panel-content">
                    <Row className="menu-items my-3">
                      <Col md="4" className="mb-3">
                        <div
                          className="btn-group"
                          role="group"
                          aria-label="Mode toggle"
                        >
                          <button
                            type="button"
                            className={`btn ${mode === "ALL" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => onModeChange("ALL")}
                          >
                            ALL
                          </button>
                          <button
                            type="button"
                            className={`btn ${mode === "DELIVERY" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => onModeChange("DELIVERY")}
                          >
                            DELIVERY
                          </button>
                          <button
                            type="button"
                            className={`btn ${mode === "PICKUP" ? "btn-primary" : "btn-outline-primary"}`}
                            onClick={() => onModeChange("PICKUP")}
                          >
                            PICKUP
                          </button>
                        </div>
                      </Col>
                      <Col md="8" className="mb-3">
                        <CategoryDropdown
                          categories={filteredCategories}
                          onSelect={handleSearchClick}
                        />
                      </Col>
                      <Col md="12">
                        <Breadcrumb>
                          {navigationStack.map((x, idx) => {
                            let isActive = navigationStack.length == idx + 1;

                            return (
                              <Breadcrumb.Item key={idx} active={isActive}>
                                {x?.value?.name}
                              </Breadcrumb.Item>
                            );
                          })}
                        </Breadcrumb>
                      </Col>
                      {currentView === VIEW.CATEGORIES && (
                        <CategoryList
                          categories={filteredCategories}
                          onCategoryClick={handleCategoryClick}
                        />
                      )}
                      {currentView === VIEW.SUB_CATEGORIES &&
                        selectedCategory && (
                          <SubCategoryList
                            category={selectedCategory}
                            onSubCategoryClick={handleSubCategoryClick}
                            onBack={goBack}
                          />
                        )}
                      {currentView === VIEW.ITEMS && selectedSubCategory && (
                        <ItemList
                          subCategory={selectedSubCategory}
                          onItemClick={handleItemClick}
                          onBack={goBack}
                        />
                      )}
                      {currentView === VIEW.MODIFIER_GROUP &&
                        selectedModifierGroup && (
                          <ModifiersList
                            isActive={isActive}
                            modifierGroup={selectedModifierGroup}
                            modifiers={selectedModifierGroup?.modifiers}
                            onModifierClick={handleModifierClick}
                            onBack={goBack}
                            onNext={goNext}
                            onFree={onFree}
                            onNo={onNo}
                            onLess={onLess}
                            customSelection={customSelection}
                          />
                        )}
                    </Row>
                  </div>
                </div>
              )}
            </Col>
            <Col md="4" className="p-0">
              <div className="summary">
                <div className="summary-controls">
                  <Container fluid>
                    <Row>
                      {currentView == VIEW.CHECK_OUT ? (
                        <Col md="10">
                          <Button
                            variant="primary"
                            className="w-100"
                            onClick={finishBooking}
                          >
                            FINISH
                          </Button>
                        </Col>
                      ) : (
                        <Col md="10">
                          <Button
                            variant="primary"
                            className="w-100"
                            onClick={handleCheckout}
                          >
                            CHECK OUT
                          </Button>
                        </Col>
                      )}
                      <Col md="2" className="g-0">
                        <Button
                          variant="light"
                          className="w-fit"
                          onClick={openOptionsModal}
                        >
                          <FeatherIcon icon="more-vertical" size={20} />
                        </Button>
                      </Col>
                    </Row>
                  </Container>
                </div>

                <>
                  <div
                    className="summary-total"
                    // onClick={() => toggleSubtotal(!isSubtotalVisisble)}
                  >
                    {EditOrderItemID && EditOrderItem.items.length > 0 && (
                      <div className="summary-total-sub-field">
                        <span>Order Id</span>
                        <span>{EditOrderItemID}</span>
                      </div>
                    )}

                    <div className="summary-total-field">
                      <span>Total</span>
                      <span>
                        {currencySymbol}
                        {totals.total.toFixed(2) ?? 0.0}
                      </span>
                    </div>

                    <>
                      {booking.header.post_code && (
                        <div className="summary-total-sub-field">
                          <h6>Sub Total</h6>
                          <span>
                            {currencySymbol}
                            {totals.subtotal.toFixed(2) ?? 0.0}
                          </span>
                        </div>
                      )}

                      {summaryDiscount.discountType != null &&
                        summaryDiscount.discountValue != null &&
                        summaryDiscount.discountValue != 0 && (
                          <div className="summary-total-sub-field">
                            {summaryDiscount.discountType === "percentage" ? (
                              <h6 className="d-flex align-items-center gap-1">
                                <p className="text-primary">
                                  {summaryDiscount.discountValue}%
                                </p>{" "}
                                <p>Discount</p>
                                <i
                                  className="cursur-pointer"
                                  onClick={resetDiscount}
                                >
                                  <FeatherIcon
                                    icon="x-circle"
                                    size={16}
                                    color="red"
                                  />
                                </i>
                              </h6>
                            ) : (
                              <div className="d-flex align-items-center gap-1">
                                <p>Discount</p>
                                <i
                                  className="cursur-pointer"
                                  onClick={resetDiscount}
                                >
                                  <FeatherIcon
                                    icon="x-circle"
                                    size={16}
                                    color="red"
                                  />
                                </i>
                              </div>
                            )}

                            <span className="text-primary m-0">
                              - {currencySymbol}
                              {totals.discount.toFixed(2) ?? 0.0}
                            </span>
                          </div>
                        )}

                      {booking.header.post_code && (
                        <div className="summary-total-sub-field">
                          <h6>Delivery Charges</h6>
                          <span>
                            {totals.deliveryCharges > 0
                              ? `${currencySymbol}${totals.deliveryCharges.toFixed(
                                  2,
                                )}`
                              : `${currencySymbol}0.00`}
                          </span>
                        </div>
                      )}
                    </>
                    {hasItemsinCart && (
                      <div className="summary-total-sub-field">
                        <h6>Service Charges</h6>
                        <span>
                          {currencySymbol}
                          {serviceCharges.toFixed(2) ?? 0.0}
                        </span>
                      </div>
                    )}
                  </div>
                </>

                <div className="summary-lines">
                  {booking.items.map((x, idx) => (
                    <div
                      key={idx}
                      className="summary-line"
                      style={{
                        backgroundColor:
                          idx % 2 === 0 ? "#f9f9f9" : "rgb(253 253 253)",
                      }}
                    >
                      <div className="summary-item w-100">
                        <Row className="w-100 g-0">
                          {/* Name */}
                          <Col md="6">
                            <div className="summary-item-name">{x.name}</div>
                          </Col>

                          <Col md="3">
                            <div className="quantity-control">
                              <div
                                className={`quantity-btn ${x.quantity === 1 ? "disabled" : ""}`}
                                onClick={() =>
                                  x.quantity > 1 && decrementItem(x)
                                }
                              >
                                <FeatherIcon icon="minus" size={16} />
                              </div>

                              <div className="quantity-value">{x.quantity}</div>

                              <div
                                className="quantity-btn"
                                onClick={() => incrementItem(x)}
                              >
                                <FeatherIcon icon="plus" size={16} />
                              </div>
                            </div>
                          </Col>

                          <Col
                            md="3"
                            className="ps-2 d-flex justify-content-between align-items-center"
                          >
                            <span className="price ">
                              {currencySymbol}
                              {(
                                x.price +
                                x.modifiers.reduce(
                                  (sum, mod) => sum + (mod.price || 0),
                                  0,
                                )
                              ).toFixed(2) ?? 0.0}
                            </span>

                            <div
                              className="cursur-pointer"
                              onClick={() => deleteItem(x)}
                            >
                              <FeatherIcon icon="trash" size={18} color="red" />
                            </div>
                          </Col>
                        </Row>
                      </div>

                      <div className="summary-footer d-flex gap-3">
                        <span
                          role="button"
                          className="d-flex align-items-center gap-1 text-decoration-none fs-6"
                          onClick={() => openAddModifer(x)}
                        >
                          <FeatherIcon icon="plus" size={12} />
                          <span>Modifier</span>
                        </span>

                        <span
                          role="button"
                          className="d-flex align-items-center gap-1 text-decoration-none fs-6"
                          onClick={() => openItemComment(x)}
                        >
                          <FeatherIcon icon="plus" size={12} />
                          <span>Comments</span>
                        </span>
                      </div>

                      {x?.comment ? (
                        <div
                          className="summary-item-comment"
                          onClick={() => openItemComment(x)}
                        >
                          <FeatherIcon
                            icon="message-circle"
                            size="14"
                            className="summary-commment-icon"
                          />
                          <span className="summary-commment-text">
                            {x.comment}
                          </span>
                        </div>
                      ) : null}
                      <div className="summary-modifiers">
                        {x.modifiers.map((y, yIdx) => (
                          <span key={yIdx} className="summary-modifier">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="cursur-pointer"
                                onClick={() => deleteModifier(yIdx, idx)}
                              >
                                <FeatherIcon
                                  icon="x-circle"
                                  size={18}
                                  color="red"
                                />
                              </div>

                              <h6
                                className="cursur-pointer hover:text-primary transition-hover"
                                onClick={() =>
                                  handleClickToOpenModifierGroup(x, y)
                                }
                                style={{
                                  cursor: "pointer",
                                  transition: "color 0.2s ease",
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.color = "#0d6efd")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.color = "")
                                }
                              >
                                {y.name}
                              </h6>
                            </div>
                            {y.price ? (
                              <span>
                                {currencySymbol}
                                {y.price.toFixed(2) ?? 0.0}
                              </span>
                            ) : (
                              <span>{currencySymbol}0.00</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {booking.header.comment ? (
                  <div className="summary-comment" onClick={openComment}>
                    <FeatherIcon
                      icon="message-circle"
                      size="20"
                      className="summary-commment-icon"
                    />
                    <span className="summary-commment-text">
                      {booking.header.comment}
                    </span>
                  </div>
                ) : null}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

function CategoryDropdown({
  categories,
  onSelect,
}: {
  categories: Category[];
  onSelect?: ({
    category,
    subCategory,
    item,
  }: {
    category: Category;
    subCategory: Category;
    item: Item;
  }) => void;
}) {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return categories;

    const term = search.toLowerCase();

    return categories
      .map((cat) => ({
        ...cat,
        children: cat.children
          .map((sub) => ({
            ...sub,
            items: sub.items.filter((item) =>
              item.name.toLowerCase().includes(term),
            ),
          }))
          .filter((sub) => sub.items.length > 0),
      }))
      .filter((cat) => cat.children.length > 0);
  }, [search, categories]);

  return (
    <div className="position-relative w-100">
      <button
        className="btn btn-outline-primary w-100 text-start"
        onClick={() => {
          dispatch(
            setNavigationStack([{ type: VIEW.CATEGORIES, value: null }]),
          );
          setOpen(!open);
        }}
      >
        Search Items..
      </button>

      {open && (
        <div
          className="dropdown-menu show w-100 p-3"
          style={{ maxHeight: "400px", overflowY: "auto" }}
        >
          <input
            type="text"
            className="form-control mb-3"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {filtered.map((category) => (
            <div key={category.name}>
              <div className="fw-bold">{category.name}</div>

              {category.children.map((sub) => (
                <div key={sub.name} className="ms-2">
                  <div className="text-muted small">{sub.name}</div>

                  {sub.items.map((item) => (
                    <button
                      key={item.name}
                      className="dropdown-item ps-4"
                      onClick={() => {
                        onSelect?.({
                          category: category,
                          subCategory: sub,
                          item: item,
                        });
                        setOpen(false);
                      }}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const CategoryList = ({
  categories,
  onCategoryClick,
}: {
  categories: Array<Category>;
  onCategoryClick: (category: Category) => void;
}) => {
  const navigate = useNavigate();

  const addCategory = () => {
    navigate("/add-category");
  };

  const settings = useAppSelector((x) => x.Setting.settings);

  const current_color = useMemo(() => {
    return settings.find((x) => x.key === "default_color")?.value;
  }, [settings]);

  const current_font_size = useMemo(() => {
    return settings.find((x) => x.key === "menu_font_size")?.value;
  }, [settings]);

  return (
    <>
      {categories.map((x, idx) => {
        return (
          <Col md="3" key={idx} className="g-0  p-1">
            <div
              className="menu-item cursor-pointer"
              style={{ backgroundColor: current_color || "#c1121f" }}
              onClick={() => onCategoryClick(x)}
            >
              <h6 className={`${current_font_size || "fs-6"} text-white`}>
                {x.name}
              </h6>
            </div>
          </Col>
        );
      })}

      <Col md="3" className="g-0 p-1 ">
        <Button
          className={`${current_font_size || "fs-6"} fw-bold text-primary bg-white back-btn menu-item`}
          variant="outline-primary"
          onClick={addCategory}
        >
          Add Category
        </Button>
      </Col>
    </>
  );
};

export const SubCategoryList = ({
  category,
  onSubCategoryClick,
  onBack,
}: {
  category: Category;
  onSubCategoryClick: (subCategory: Category) => void;
  onBack: () => void;
}) => {
  const navigate = useNavigate();

  const addSubCategory = () => {
    navigate(`/add-sub-category/${category.id}`);
  };

  const settings = useAppSelector((x) => x.Setting.settings);

  const current_color = useMemo(() => {
    return settings.find((x) => x.key === "default_color")?.value;
  }, [settings]);

  const current_font_size = useMemo(() => {
    return settings.find((x) => x.key === "menu_font_size")?.value;
  }, [settings]);

  return (
    <>
      <Col md="12">
        <div className="menu-list-title">
          <h6>{category.name}</h6>
          <span>{category.description}</span>
        </div>
      </Col>
      {category.children.map((x, idx) => {
        return (
          <Col md="3" key={idx} className="g-0  p-1">
            <div
              className="menu-item"
              style={{ backgroundColor: current_color || "#c1121f" }}
              onClick={() => onSubCategoryClick(x)}
            >
              <h6 className={`${current_font_size || "fs-6"} text-white`}>
                {x.name}
              </h6>
            </div>
          </Col>
        );
      })}
      <Col md="3" className="g-0  p-1">
        <Button
          className={`${current_font_size || "fs-6"} fw-bold text-primary bg-white back-btn menu-item`}
          variant="outline-primary"
          onClick={addSubCategory}
        >
          Add Sub Category
        </Button>
      </Col>

      <Col md="12" className="g-0  p-1">
        <div className="bottom-controls">
          <Button className="back-btn" variant="outline-info" onClick={onBack}>
            Back
          </Button>
        </div>
      </Col>
    </>
  );
};

export const ItemList = ({
  subCategory,
  onItemClick,
  onBack,
}: {
  subCategory: Category;
  onItemClick: (item: Item) => void;
  onBack: () => void;
}) => {
  const navigate = useNavigate();
  const settings = useAppSelector((state) => state.Setting.settings);
  const [currencySymbol, setCurrencySymbol] = useState<string>("");

  const current_color = useMemo(() => {
    return settings.find((x) => x.key === "default_color")?.value;
  }, [settings]);

  const current_font_size = useMemo(() => {
    return settings.find((x) => x.key === "menu_font_size")?.value;
  }, [settings]);

  // Find currency symbol from the settings object
  useEffect(() => {
    if (settings.find((x) => x.key == "currency-symbol")?.value)
      setCurrencySymbol(
        settings.find((x) => x.key == "currency-symbol")?.value as any,
      );
  }, [settings]);

  const addItem = () => {
    navigate(`/add-item/${subCategory.id}`);
  };
  return (
    <>
      <Col md="12">
        <div className="menu-list-title">
          <h6>{subCategory.name}</h6>
          <span>{subCategory.description}</span>
        </div>
      </Col>
      {subCategory?.items?.map((x, idx) => {
        return (
          <Col md="3" key={idx} className="g-0  p-1">
            <div
              className="menu-item"
              style={{
                backgroundColor: current_color || "#c1121f",
              }}
              onClick={() => onItemClick(x)}
            >
              <h6 className={`${current_font_size || "fs-6"} text-white`}>
                {x.name}
              </h6>

              {/* Price - Right */}
              <span className="">
                {currencySymbol}
                {x.price}
              </span>
            </div>
          </Col>
        );
      })}
      <Col md="3" className="g-0  p-1">
        <Button
          className={`${current_font_size || "fs-6"} fw-bold text-primary bg-white back-btn menu-item`}
          variant="outline-primary"
          onClick={addItem}
        >
          Add Item
        </Button>
      </Col>
      <Col md="12" className="g-0  p-1">
        <div className="bottom-controls">
          <Button className="back-btn" variant="outline-info" onClick={onBack}>
            Back
          </Button>
        </div>
      </Col>
    </>
  );
};

export const ModifiersList = ({
  isActive,
  modifierGroup,
  modifiers,
  onModifierClick,
  onBack,
  onNext,
  onFree,
  onNo,
  onLess,
  customSelection,
}: {
  isActive: any;
  modifierGroup: ModifierGroup;
  modifiers: Modifier[];
  onModifierClick: (modifier: Modifier) => void;
  onBack: () => void;
  onNext: () => void;
  onFree: () => void;
  onNo: () => void;
  onLess: () => void;
  customSelection: string;
}) => {
  const navigate = useNavigate();

  const settings = useAppSelector((state) => state.Setting.settings);
  const [currencySymbol, setCurrencySymbol] = useState<string>("");
  const current_color = useMemo(() => {
    return settings.find((x) => x.key === "default_color")?.value;
  }, [settings]);

  const current_font_size = useMemo(() => {
    return settings.find((x) => x.key === "menu_font_size")?.value;
  }, [settings]);

  // Find currency symbol from the settings object
  useEffect(() => {
    if (settings.find((x) => x.key == "currency-symbol")?.value)
      setCurrencySymbol(
        settings.find((x) => x.key == "currency-symbol")?.value as any,
      );
  }, [settings]);

  const editModifierGroup = () => {
    navigate(`/edit-modifier-group/${modifierGroup.id}`);
  };

  return (
    <>
      <Col md="12">
        <div className="menu-list-title">
          <h6>{modifierGroup.name}</h6>
          <span>{modifierGroup.description}</span>
        </div>
      </Col>

      {modifiers.map((x, idx) => {
        return (
          <Col md="3" key={idx} className="g-0  p-1">
            <div
              style={{
                backgroundColor: current_color || "#c1121f",
                // border: isActive?.mod?.id === x.id ? "2px solid #2ba21c" : "",
              }}
              className="menu-item"
              onClick={() => onModifierClick(x)}
            >
              <h6 className={`${current_font_size || "fs-6"} text-white`}>
                {x.name}
              </h6>{" "}
              {x.price != 0 ? (
                <span>
                  {currencySymbol}
                  {x.price}
                </span>
              ) : null}
            </div>
          </Col>
        );
      })}
      <Col md="3" className="g-0  p-1">
        <Button
          className={`${current_font_size || "fs-6"} fw-bold text-primary bg-white back-btn menu-item`}
          variant="outline-primary"
          onClick={editModifierGroup}
        >
          Add Modifier
        </Button>
      </Col>
      {modifierGroup.allow_custom_selection ? (
        <Col md="12">
          <div className="bottom-controls">
            <Button
              variant={`${customSelection === "NO" ? "danger" : "outline-danger"}`}
              className="btn-options"
              onClick={onNo}
            >
              NO
            </Button>
            <Button
              variant={`${
                customSelection === "FREE" ? "warning" : "outline-warning"
              }`}
              className="btn-options"
              onClick={onFree}
            >
              FREE
            </Button>
            <Button
              variant={`${
                customSelection === "LESS" ? "info" : "outline-info"
              }`}
              className="btn-options"
              onClick={onLess}
            >
              LESS
            </Button>
          </div>
        </Col>
      ) : null}

      <Col md="12">
        <div className="bottom-controls">
          <Button className="back-btn" variant="outline-info" onClick={onBack}>
            Back
          </Button>
          <Button className="next-btn" variant="primary" onClick={onNext}>
            Next
          </Button>
        </div>
      </Col>
    </>
  );
};

export const CheckOut = ({
  onBack,
  bookingHeader,
  onChange,
  getPostCodeDetails,
  getPhoneNumberDetails,
  disableDelivery,
  disablePickup,
}: {
  onBack: () => void;
  bookingHeader: BookingHeader;
  onChange: (field: keyof BookingHeader, value: any) => void;
  getPostCodeDetails: (post_code: string) => void;
  getPhoneNumberDetails: (phone_number: string) => void;
  disableDelivery: boolean;
  disablePickup: boolean;
}) => {
  const orderTypes = [
    {
      label: "Delivery",
      value: "Delivery",
      icon: <Home size={20} />,
      time: "60 mins",
    },
    {
      label: "Pick Up",
      value: "Pick Up",
      icon: <ShoppingBag size={20} />,
      time: "15 mins",
    },
    {
      label: "In Store",
      value: "In Store",
      icon: <Home size={20} />,
      time: "20 mins",
    },
  ];
  return (
    <div className="checkout">
      <div className="checkout-header">
        <a role="button" onClick={onBack}>
          <FeatherIcon icon="chevron-left" size={16} />
        </a>
        <span>Check Out</span>
      </div>
      <div className="form-container m-0">
        <div className="form-section">
          <Row>
            <Col md="12">
              <Form.Group controlId="order_type" className="mb-4 ">
                <Form.Label as="legend" className="mb-2">
                  <h6>Order Type</h6>
                </Form.Label>
                <div
                  className="d-flex  border-bottom pb-2 "
                  style={{ gap: "0.5rem" }}
                >
                  {orderTypes.map((type) => {
                    const isDisabled =
                      (type.value === "Delivery" && disableDelivery) ||
                      (type.value === "Pick Up" && disablePickup);
                    const isSelected = bookingHeader.order_type === type.value;

                    return (
                      <Button
                        key={type.value}
                        className={`d-flex flex-column align-items-center justify-content-center px-4 py-3 rounded-3 ${
                          isSelected && !isDisabled
                            ? "bg-primary text-white shadow-lg border-primary"
                            : "bg-white text-dark border-2 border-light-subtle"
                        } ${isDisabled ? "opacity-50" : "hover-shadow"}`}
                        style={{
                          flex: 1,
                          minHeight: "80px",
                          transition: "all 0.3s ease",
                          transform:
                            isSelected && !isDisabled
                              ? "scale(1.02)"
                              : "scale(1)",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.5 : 1,
                        }}
                        onClick={() => {
                          if (!isDisabled) {
                            onChange("order_type", type.value);
                          }
                        }}
                        disabled={isDisabled}
                      >
                        <div className="text-center w-100">
                          <div
                            className={`mb-2 ${isSelected && !isDisabled ? "text-white" : "text-primary"}`}
                            style={{ fontSize: "2rem" }}
                          >
                            {type.icon}
                          </div>
                          <strong
                            className={`d-block mb-1 ${isSelected && !isDisabled ? "text-white" : "text-dark"}`}
                          >
                            {type.label}
                          </strong>
                          <div
                            className={`small ${isSelected && !isDisabled ? "text-white-50" : "text-muted"}`}
                          >
                            {type.time}
                          </div>
                          {isSelected && !isDisabled && (
                            <div className="mt-2">
                              <span className="badge bg-white text-primary rounded-pill px-3 py-1">
                                Selected
                              </span>
                            </div>
                          )}
                          {isDisabled && (
                            <div className="mt-2">
                              <span className="badge bg-secondary text-white rounded-pill px-3 py-1">
                                Disabled
                              </span>
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </Form.Group>
            </Col>

            <Col md={4}>
              <FloatingLabel
                controlId="phone_number"
                label="Phone Number"
                className="mb-3"
              >
                <Form.Control
                  size="sm"
                  type="text"
                  value={bookingHeader.phone_number}
                  onBlur={() =>
                    getPhoneNumberDetails(bookingHeader.phone_number)
                  }
                  onChange={(e) => onChange("phone_number", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md={4}>
              <FloatingLabel
                controlId="first_name"
                label="First Name"
                className="mb-3"
              >
                <Form.Control
                  size="sm"
                  type="text"
                  value={bookingHeader.first_name}
                  onChange={(e) => onChange("first_name", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            <Col md={4}>
              <FloatingLabel
                controlId="last_name"
                label="Last Name"
                className="mb-3"
              >
                <Form.Control
                  size="sm"
                  type="text"
                  value={bookingHeader.last_name}
                  onChange={(e) => onChange("last_name", e.target.value)}
                />
              </FloatingLabel>
            </Col>
            {bookingHeader.order_type === "Delivery" &&
              bookingHeader.phone_number && (
                <>
                  <Col md={12}>
                    <h6>Address Details</h6>
                  </Col>
                  <Col md={4}>
                    <FloatingLabel
                      controlId="post_code"
                      label="Post Code"
                      className="mb-3"
                    >
                      <Form.Control
                        size="sm"
                        type="text"
                        value={bookingHeader.post_code}
                        onBlur={() =>
                          getPostCodeDetails(bookingHeader.post_code)
                        }
                        onChange={(e) => onChange("post_code", e.target.value)}
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={4}>
                    <FloatingLabel
                      controlId="door_no"
                      label="Door No"
                      className="mb-3"
                    >
                      <Form.Control
                        size="sm"
                        type="text"
                        value={bookingHeader.door_no}
                        onChange={(e) => onChange("door_no", e.target.value)}
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={4}></Col>
                  <Col md={6}>
                    <FloatingLabel
                      controlId="street"
                      label="Street"
                      className="mb-3"
                    >
                      <Form.Control
                        size="sm"
                        type="text"
                        value={bookingHeader.street}
                        onChange={(e) => onChange("street", e.target.value)}
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md={4}>
                    <FloatingLabel
                      controlId="city"
                      label="City"
                      className="mb-3"
                    >
                      <Form.Control
                        size="sm"
                        type="text"
                        value={bookingHeader.city}
                        onChange={(e) => onChange("city", e.target.value)}
                      />
                    </FloatingLabel>
                  </Col>
                  <Col md="2"></Col>
                </>
              )}
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Menu;
