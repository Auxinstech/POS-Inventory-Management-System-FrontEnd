import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { produce } from "immer";
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "Models/category";
import {
  IDiscount,
  IDiscountCreatePayload,
  IDiscountListResponse,
  IDiscountsListParams,
  IDiscountUpdatePayload,
} from "Models/discounts";
import { CreateItemRequest, Item, UpdateItemRequest } from "Models/item";
import { CreateModifierRequest, Modifier } from "Models/modifier";
import {
  CreateModifierGroupRequest,
  ModifierGroup,
  UpdateModifierGroupRequest,
  UpdateModifierGroupSortRequest,
} from "Models/modifierGroup";

export enum VIEW {
  CATEGORIES = 1,
  SUB_CATEGORIES = 2,
  ITEMS = 3,
  MODIFIER_GROUP = 4,
  CHECK_OUT = 5,
}

export interface NavigationStack {
  value: Category | Item | ModifierGroup | null;
  type: VIEW;
}

export interface SummaryDiscount {
  discountType: "percentage" | "price" | null;
  discountValue: number | null;
}

export interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  amount: number;
  comment: string;
  modifiers: Array<{
    pivotId?: number;
    id: number;
    name: string;
    price: number;
  }>;
}

export interface BookingHeader {
  phone_number: string;
  first_name: string;
  last_name: string;
  order_type: string;
  post_code: string;
  door_no: string;
  street: string;
  city: string;
  payment_method: string;
  amount: number;
  total: number;
  service_charges: number;
  delivery_charges: number;
  store_id: number;
  comment: string;
  source: string;
  discount: number;
  status?: string;
}

export interface Booking {
  header: BookingHeader;
  items: CartItem[];
}

export interface Store {
  id: number;
  slug: string;
  name: string;
  address: string;
  postal_code: string;
  url: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface IHome {
  categories: Category[];
  categories_loaded: boolean;
  stores: Store[];
  selected_store: number | null;
  stores_loaded: boolean;
  booking: Booking;
  navigationStack: NavigationStack[];
  currentView: VIEW;
  selectedCategory: Category | null;
  selectedSubCategory: Category | null;
  selectedItem: Item | null;
  selectedModifierGroup: ModifierGroup | null;
  summaryDiscount: SummaryDiscount;
  discounts: IDiscount[];
  discount_pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

const InitialState: IHome = {
  discounts: [],
  discount_pagination: undefined,
  categories: [],
  categories_loaded: false,
  stores: [],
  selected_store: null,
  stores_loaded: false,
  booking: {
    header: {
      phone_number: "",
      first_name: "",
      last_name: "",
      post_code: "",
      door_no: "",
      street: "",
      city: "",
      payment_method: "Cash",
      amount: 0,
      total: 0,
      service_charges: 0,
      delivery_charges: 0,
      store_id: 0,
      comment: "",
      order_type: "Delivery",
      source: "pos",
      discount: 0,
    },
    items: [],
  },
  navigationStack: [],
  currentView: VIEW.CATEGORIES,
  selectedCategory: null,
  selectedSubCategory: null,
  selectedItem: null,
  selectedModifierGroup: null,
  summaryDiscount: {
    discountType: null,
    discountValue: null,
  },
};
const HomeSlice = createSlice({
  name: "home",
  initialState: InitialState,
  reducers: {
    RESET() {},
    getStores() {},
    setStores(state, action: PayloadAction<Store[]>) {
      return produce(state, (draftState) => {
        draftState.stores = action.payload;
        draftState.stores_loaded = true;
      });
    },
    setSelectedStore(state, action: PayloadAction<number>) {
      return produce(state, (draftState) => {
        draftState.selected_store = action.payload;
        draftState.categories_loaded = false;
      });
    },

    // Categories
    getCategories(state, action: PayloadAction<number>) {
      return produce(state, (draftState) => {
        draftState.categories_loaded = false;
        draftState.categories = [];
      });
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      return produce(state, (draftState) => {
        draftState.categories = action.payload;
        draftState.categories_loaded = true;
      });
    },
    saveCategory: {
      reducer: (
        state,
        action: PayloadAction<
          CreateCategoryRequest,
          string,
          { onSuccess: () => void } | undefined
        >,
      ) => {},
      prepare: (
        payload: CreateCategoryRequest,
        meta?: { onSuccess: () => void } | undefined,
      ) => ({
        payload,
        meta,
      }),
    },
    addCategory(state, action: PayloadAction<Category>) {
      return produce(state, (draftState) => {
        const newCategory = action.payload;
        if (newCategory.parent_id) {
          const parentIndex = draftState.categories.findIndex(
            (cat) => cat.id === newCategory.parent_id,
          );
          if (parentIndex !== -1) {
            draftState.categories[parentIndex].children.push(newCategory);
          }
        } else {
          draftState.categories.push(newCategory);
        }
      });
    },
    updateCategory: {
      reducer: (
        state,
        action: PayloadAction<
          UpdateCategoryRequest,
          string,
          { onSuccess: () => void } | undefined
        >,
      ) => {
        return produce(state, (draftState) => {
          const updatedCategory = action.payload;
          if (updatedCategory.parent_id) {
            const parentIndex = draftState.categories.findIndex(
              (cat) => cat.id === updatedCategory.parent_id,
            );
            if (parentIndex !== -1) {
              const subIndex = draftState.categories[
                parentIndex
              ].children.findIndex((child) => child.id === updatedCategory.id);
              if (subIndex !== -1) {
                draftState.categories[parentIndex].children[subIndex] = {
                  ...draftState.categories[parentIndex].children[subIndex],
                  ...updatedCategory,
                  updated_at: new Date().toISOString(),
                };
              }
            }
          } else {
            const catIndex = draftState.categories.findIndex(
              (cat) => cat.id === updatedCategory.id,
            );
            if (catIndex !== -1) {
              draftState.categories[catIndex] = {
                ...draftState.categories[catIndex],
                ...updatedCategory,
                updated_at: new Date().toISOString(),
              };
            }
          }
        });
      },
      prepare: (
        payload: UpdateCategoryRequest,
        meta?: { onSuccess: () => void } | undefined,
      ) => ({
        payload,
        meta,
      }),
    },
    removeCategory: {
      reducer: (
        state,
        action: PayloadAction<
          number,
          string,
          { onSuccess: () => void } | undefined
        >,
      ) => {
        return produce(state, (draftState) => {
          const idToRemove = action.payload;

          // Remove from top-level categories
          const topIndex = draftState.categories.findIndex(
            (cat) => cat.id === idToRemove,
          );
          if (topIndex !== -1) {
            draftState.categories.splice(topIndex, 1);
            return;
          }

          // Remove from subcategories
          draftState.categories.forEach((cat) => {
            const subIndex = cat.children.findIndex(
              (sub) => sub.id === idToRemove,
            );
            if (subIndex !== -1) {
              cat.children.splice(subIndex, 1);
            }
          });
        });
      },
      prepare: (
        payload: number,
        meta?: { onSuccess: () => void } | undefined,
      ) => ({
        payload,
        meta,
      }),
    },

    saveItem: {
      reducer: (
        state,
        action: PayloadAction<
          CreateItemRequest,
          string,
          { onSuccess: () => void } | undefined
        >,
      ) => {},
      prepare: (
        payload: CreateItemRequest,
        meta?: { onSuccess: () => void },
      ) => ({
        payload,
        meta,
      }),
    },

    addItem(state, action: PayloadAction<Item>) {
      return produce(state, (draftState) => {
        const newItem = action.payload;
        newItem.categories.forEach((updCats) => {
          // Look for the subcategory using parent_id
          const parentCategory = draftState.categories.find((cat) =>
            cat.children.some((sub) => sub.id === updCats.id),
          );

          if (parentCategory) {
            const subCat = parentCategory.children.find(
              (sub) => sub.id === updCats.id,
            );
            if (subCat) {
              subCat.items = subCat.items || [];
              subCat.items.push(newItem);
            }
          }
        });
      });
    },

    updateItem: {
      reducer: (
        state,
        action: PayloadAction<
          UpdateItemRequest,
          string,
          { onSuccess: () => void } | undefined
        >,
      ) => {
        return produce(state, (draftState) => {
          const updatedItem = action.payload;

          draftState.categories.forEach((parent) => {
            parent.children.forEach((sub) => {
              const itemIndex = sub.items?.findIndex(
                (item) => item.id === updatedItem.id,
              );

              if (itemIndex !== undefined && itemIndex !== -1) {
                const oldItem = sub.items[itemIndex];

                // Sort modifier_groups based on updatedItem.modifier_groups (which is a number[])
                const sortedModifierGroups: any = updatedItem.modifier_groups
                  .map((id) =>
                    oldItem.modifier_groups.find((mg) => mg.id === id),
                  )
                  .filter(Boolean); // remove undefined if any id wasn't matched

                // Similarly for allergens if needed:
                const sortedAllergens: any = updatedItem.allergens
                  .map((id) => oldItem.allergens.find((a) => a.id === id))
                  .filter(Boolean);

                sub.items[itemIndex] = {
                  ...oldItem,
                  ...updatedItem,
                  modifier_groups: sortedModifierGroups,
                  allergens: sortedAllergens,
                  updated_at: new Date().toISOString(),
                  categories: oldItem.categories,
                };
              }
            });
          });
        });
      },
      prepare: (
        payload: UpdateItemRequest,
        meta?: { onSuccess: () => void },
      ) => ({
        payload,
        meta,
      }),
    },

    removeItem: {
      reducer: (
        state,
        action: PayloadAction<
          number,
          string,
          { onSuccess: () => void } | undefined
        >,
      ) => {
        return produce(state, (draftState) => {
          const idToRemove = action.payload;

          // Traverse subcategories to find and remove item
          draftState.categories.forEach((parent) => {
            parent.children.forEach((sub) => {
              const itemIndex = sub.items?.findIndex(
                (item) => item.id === idToRemove,
              );
              if (itemIndex !== undefined && itemIndex !== -1) {
                sub.items?.splice(itemIndex, 1);
              }
            });
          });
        });
      },
      prepare: (payload: number, meta?: { onSuccess: () => void }) => ({
        payload,
        meta,
      }),
    },

    saveModifierGroup: {
      reducer: (
        state,
        action: PayloadAction<
          CreateModifierGroupRequest,
          string,
          { onSuccess?: (data: ModifierGroup) => void } | undefined
        >,
      ) => {},
      prepare: (
        payload: CreateModifierGroupRequest,
        meta?: { onSuccess: (data: ModifierGroup) => void },
      ) => ({
        payload,
        meta,
      }),
    },

    addModifierGroup: {
      reducer: (
        state,
        action: PayloadAction<{
          modifierGroup: ModifierGroup;
          items: number[];
        }>,
      ) => {
        return produce(state, (draftState) => {
          const data = action.payload;
          const { modifierGroup, items } = action.payload;
          draftState.categories.forEach((parent) => {
            parent.children.forEach((sub) => {
              sub.items?.forEach((item) => {
                if (items.includes(item.id)) {
                  item.modifier_groups = item.modifier_groups || [];
                  const exists = item.modifier_groups.some(
                    (mg) => mg.id === modifierGroup.id,
                  );
                  if (!exists) item.modifier_groups.push(modifierGroup);
                }
              });
            });
          });
        });
      },
      prepare: (modifierGroup: ModifierGroup, items: number[]) => ({
        payload: { modifierGroup, items },
      }),
    },

    LinkModifierGroup: {
      reducer: (
        state,
        action: PayloadAction<{
          item_id?: number;
          modifier_group_id: number;
          onSuccess?: () => void | undefined;
        }>,
      ) => {
        return produce(state, (draftState) => {});
      },
      prepare: (
        payload: {
          item_id: number;
          modifier_group_id: number;
        },
        meta?: { onSuccess?: () => void },
      ) => ({
        payload: payload,
        meta,
      }),
    },

    updateModifierGroup: {
      reducer: (
        state,
        action: PayloadAction<
          { modifierGroup: UpdateModifierGroupRequest },
          string,
          { onSuccess?: (data: ModifierGroup) => void } | undefined
        >,
      ) => {
        return produce(state, (draftState) => {
          const { modifierGroup } = action.payload;

          draftState.categories.forEach((parent) => {
            parent.children.forEach((sub) => {
              sub.items?.forEach((item) => {
                if (
                  modifierGroup.items &&
                  modifierGroup.items.includes(item.id)
                ) {
                  const idx = item.modifier_groups?.findIndex(
                    (mg) => mg.id === modifierGroup.id,
                  );
                  if (idx !== undefined && idx >= 0) {
                    const oldModifierGroup = item.modifier_groups[idx];
                    item.modifier_groups[idx] = {
                      ...oldModifierGroup,
                      ...modifierGroup,
                    };
                  }
                }
              });
            });
          });
        });
      },
      prepare: (
        modifierGroup: UpdateModifierGroupRequest,
        meta?: { onSuccess: (data: ModifierGroup) => void },
      ) => ({
        payload: { modifierGroup },
        meta,
      }),
    },

    updateModifierGroupSort: {
      reducer: (
        state,
        action: PayloadAction<UpdateModifierGroupSortRequest>,
      ) => {
        const { item_id, modifier_group_id, sort, id } = action.payload;

        return produce(state, (draftState) => {
          for (const parent of draftState.categories) {
            for (const sub of parent.children) {
              for (const item of sub.items || []) {
                if (item.id === item_id) {
                  const mg = item.modifier_groups?.find(
                    (mg) => mg.id === modifier_group_id && mg.pivot?.id === id,
                  );
                  if (mg && mg.pivot) {
                    mg.pivot.sort = sort;
                  }
                }
              }
            }
          }
        });
      },

      prepare: (
        modifierGroup: UpdateModifierGroupSortRequest,
        meta?: { onSuccess: (data: ModifierGroup) => void },
      ) => ({
        payload: modifierGroup,
        meta,
      }),
    },

    removeModifierGroup: {
      reducer: (
        state,
        action: PayloadAction<
          number,
          string,
          { onSuccess?: () => void } | undefined
        >,
      ) => {
        return produce(state, (draftState) => {
          const idToRemove = action.payload;

          // Loop through all items and remove the modifier group by ID
          draftState.categories.forEach((parent) => {
            parent.children.forEach((sub) => {
              sub.items?.forEach((item) => {
                item.modifier_groups = item.modifier_groups?.filter(
                  (mg) => mg.id !== idToRemove,
                );
              });
            });
          });
        });
      },
      prepare: (id: number, meta?: { onSuccess?: () => void }) => ({
        payload: id,
        meta,
      }),
    },

    unlinkModifierGroup: {
      reducer: (
        state,
        action: PayloadAction<{
          item_id?: number;
          modifier_group_id: number;
          onSuccess?: () => void | undefined;
        }>,
      ) => {
        return produce(state, (draftState) => {
          const idToRemove = action.payload.modifier_group_id;

          // Loop through all items and remove the modifier group by ID
          draftState.categories.forEach((parent) => {
            parent.children.forEach((sub) => {
              sub.items?.forEach((item) => {
                item.modifier_groups = item.modifier_groups?.filter(
                  (mg) => mg.id !== idToRemove,
                );
              });
            });
          });
        });
      },
      prepare: (
        payload: {
          item_id: number;
          modifier_group_id: number;
        },
        meta?: { onSuccess?: () => void },
      ) => ({
        payload: payload,
        meta,
      }),
    },

    saveModifier: {
      reducer: (
        state,
        action: PayloadAction<
          CreateModifierRequest,
          string,
          { onSuccess?: (data: Modifier) => void } | undefined
        >,
      ) => {},
      prepare: (
        payload: CreateModifierRequest,
        meta?: { onSuccess?: (data: Modifier) => void },
      ) => ({
        payload,
        meta,
      }),
    },

    addModifier(state, action: PayloadAction<Modifier>) {
      return produce(state, (draftState) => {
        const modifier = action.payload;

        draftState.categories.forEach((parent) => {
          parent.children.forEach((sub) => {
            sub.items?.forEach((item) => {
              const modifierGroup = item.modifier_groups?.find(
                (x) => x.id === modifier.modifier_group_id,
              );
              if (modifierGroup) {
                const exists = modifierGroup.modifiers.some(
                  (m) => m.id === modifier.id,
                );
                if (!exists) {
                  modifierGroup.modifiers.push(modifier);
                }
              }
            });
          });
        });
      });
    },

    updateModifier(state, action: PayloadAction<Modifier>) {
      return produce(state, (draftState) => {
        const updatedModifier = action.payload;

        draftState.categories.forEach((parent) => {
          parent.children.forEach((sub) => {
            sub.items?.forEach((item) => {
              item.modifier_groups?.forEach((group) => {
                const modIndex = group.modifiers.findIndex(
                  (m) => m.id === updatedModifier.id,
                );
                if (modIndex !== -1) {
                  group.modifiers[modIndex] = {
                    ...group.modifiers[modIndex],
                    ...updatedModifier,
                    updated_at: new Date().toISOString(),
                  };
                }
              });
            });
          });
        });
      });
    },

    removeModifier(state, action: PayloadAction<number>) {
      return produce(state, (draftState) => {
        const idToRemove = action.payload;

        draftState.categories.forEach((parent) => {
          parent.children.forEach((sub) => {
            sub.items?.forEach((item) => {
              item.modifier_groups?.forEach((group) => {
                group.modifiers = group.modifiers.filter(
                  (m) => m.id !== idToRemove,
                );
              });
            });
          });
        });
      });
    },

    saveBooking: {
      reducer: (
        state,
        action: PayloadAction<
          Booking,
          string,
          { onSuccess: () => void } | undefined
        >,
      ) => {
        // return produce(state, (draftState) => {
        //   const index = draftState.menu.findIndex((category) => category.id === action.payload.id);
        //   if (index !== -1) {
        //     draftState.menu[index] = action.payload;
        //   } else {
        //     draftState.menu.push(action.payload);
        //   }
        // });
      },
      prepare: (
        payload: Booking,
        meta?: { onSuccess: () => void } | undefined,
      ) => ({
        payload,
        meta,
      }),
    },
    updateBooking: {
      reducer: (
        state,
        action: PayloadAction<
          Booking,
          string,
          { onSuccess: () => void } | undefined
        >,
      ) => {
        // return produce(state, (draftState) => {
        //   const index = draftState.menu.findIndex((category) => category.id === action.payload.id);
        //   if (index !== -1) {
        //     draftState.menu[index] = action.payload;
        //   } else {
        //     draftState.menu.push(action.payload);
        //   }
        // });
      },
      prepare: (
        payload: Booking,
        meta?: { onSuccess: () => void } | undefined,
      ) => ({
        payload,
        meta,
      }),
    },

    setNavigationStack: (
      state,
      action: PayloadAction<Array<NavigationStack>>,
    ) => {
      return produce(state, (draftState) => {
        draftState.navigationStack = action.payload;
      });
    },

    setCurrentView: (state, action: PayloadAction<VIEW>) => {
      return produce(state, (draftState) => {
        draftState.currentView = action.payload;
      });
    },

    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      return produce(state, (draftState) => {
        draftState.selectedCategory = action.payload;
      });
    },

    setSelectedSubCategory: (state, action: PayloadAction<Category | null>) => {
      return produce(state, (draftState) => {
        draftState.selectedSubCategory = action.payload;
      });
    },

    setSelectedItem: (state, action: PayloadAction<Item | null>) => {
      return produce(state, (draftState) => {
        draftState.selectedItem = action.payload;
      });
    },

    setSelectedModifierGroup: (
      state,
      action: PayloadAction<ModifierGroup | null>,
    ) => {
      return produce(state, (draftState) => {
        draftState.selectedModifierGroup = action.payload;
      });
    },

    setBooking: (state, action: PayloadAction<Booking>) => {
      return produce(state, (draftState) => {
        draftState.booking = action.payload;
      });
    },

    resetBooking: (state) => {
      return produce(state, (draftState) => {
        draftState.booking = {
          header: {
            phone_number: "",
            first_name: "",
            last_name: "",
            post_code: "",
            door_no: "",
            street: "",
            city: "",
            payment_method: "Cash",
            amount: 0,
            total: 0,
            service_charges: 0,
            delivery_charges: 0,
            store_id: 0,
            comment: "",
            order_type: "Delivery",
            source: "pos",
            discount: 0,
          },
          items: [],
        };
        draftState.navigationStack = [];
        draftState.currentView = VIEW.CATEGORIES;
        draftState.selectedCategory = null;
        draftState.selectedSubCategory = null;
        draftState.selectedItem = null;
        draftState.selectedModifierGroup = null;
        draftState.summaryDiscount = {
          discountType: null,
          discountValue: null,
        };
      });
    },
    resetMenu: (state) => {
      return produce(state, (draftState) => {
        draftState.navigationStack = [];
        draftState.currentView = VIEW.CATEGORIES;
        draftState.selectedCategory = null;
        draftState.selectedSubCategory = null;
        draftState.selectedItem = null;
        draftState.selectedModifierGroup = null;
      });
    },

    setSummaryDiscount: (state, action: PayloadAction<SummaryDiscount>) => {
      return produce(state, (draftState) => {
        draftState.summaryDiscount = action.payload;
      });
    },
    fetchDiscountList(
      state,
      action: PayloadAction<IDiscountsListParams | undefined>,
    ) {
      // Saga will handle this
    },
    setDiscountList(state, action: PayloadAction<IDiscountListResponse>) {
      state.discounts = action.payload.data;
      state.discount_pagination = {
        current_page: action.payload.current_page,
        last_page: action.payload.last_page,
        per_page: action.payload.per_page,
        total: action.payload.total,
      };
    },
    createDiscount: {
      reducer(
        state,
        action: PayloadAction<
          IDiscountCreatePayload,
          string,
          { onSuccess?: () => void }
        >,
      ) {
        // No reducer logic; saga handles it
      },
      prepare(
        data: IDiscountCreatePayload,
        meta: { onSuccess?: () => void } = {},
      ) {
        return { payload: data, meta };
      },
    },
    deleteDiscount: {
      reducer: (
        state,
        action: PayloadAction<
          number,
          string,
          { onSuccess?: () => void } | undefined
        >,
      ) => {
        state.discounts = state.discounts.filter(
          (discount) => discount.id !== action.payload,
        );
      },
      prepare: (id: number, meta?: { onSuccess?: () => void }) => ({
        payload: id,
        meta,
      }),
    },
    updateDiscount: {
      reducer: (
        state,
        action: PayloadAction<
          { id: number; data: Partial<IDiscountUpdatePayload> }, // Use update payload type
          string,
          { onSuccess?: (resData: any) => void } | undefined
        >,
      ) => {
        const { id, data } = action.payload;
        const index = state.discounts.findIndex(
          (discount) => discount.id === id,
        );
        if (index !== -1) {
          // Convert boolean to number for the update
          const updatedData: any = { ...data };
          if (typeof updatedData.is_active === "boolean") {
            updatedData.is_active = updatedData.is_active ? 1 : 0;
          }
          if (typeof updatedData.first_time_users_only === "boolean") {
            updatedData.first_time_users_only =
              updatedData.first_time_users_only ? 1 : 0;
          }
          if (typeof updatedData.monday === "boolean") {
            updatedData.monday = updatedData.monday ? 1 : 0;
          }
          if (typeof updatedData.tuesday === "boolean") {
            updatedData.tuesday = updatedData.tuesday ? 1 : 0;
          }
          if (typeof updatedData.wednesday === "boolean") {
            updatedData.wednesday = updatedData.wednesday ? 1 : 0;
          }
          if (typeof updatedData.thursday === "boolean") {
            updatedData.thursday = updatedData.thursday ? 1 : 0;
          }
          if (typeof updatedData.friday === "boolean") {
            updatedData.friday = updatedData.friday ? 1 : 0;
          }
          if (typeof updatedData.saturday === "boolean") {
            updatedData.saturday = updatedData.saturday ? 1 : 0;
          }
          if (typeof updatedData.sunday === "boolean") {
            updatedData.sunday = updatedData.sunday ? 1 : 0;
          }

          state.discounts[index] = {
            ...state.discounts[index],
            ...updatedData,
            updated_at: new Date().toISOString(),
          };
        }
      },
      prepare: (
        payload: { id: number; data: Partial<IDiscountUpdatePayload> },
        meta?: { onSuccess?: (resData: any) => void },
      ) => ({
        payload,
        meta,
      }),
    },
    updateDiscountInState(
      state,
      action: PayloadAction<{
        id: number;
        data: Partial<IDiscountUpdatePayload>;
      }>,
    ) {
      const { id, data } = action.payload;
      const index = state.discounts.findIndex((discount) => discount.id === id);
      if (index !== -1) {
        // Convert boolean to number for the update
        const updatedData: any = { ...data };
        if (typeof updatedData.is_active === "boolean") {
          updatedData.is_active = updatedData.is_active ? 1 : 0;
        }
        if (typeof updatedData.first_time_users_only === "boolean") {
          updatedData.first_time_users_only = updatedData.first_time_users_only
            ? 1
            : 0;
        }
        if (typeof updatedData.monday === "boolean") {
          updatedData.monday = updatedData.monday ? 1 : 0;
        }
        if (typeof updatedData.tuesday === "boolean") {
          updatedData.tuesday = updatedData.tuesday ? 1 : 0;
        }
        if (typeof updatedData.wednesday === "boolean") {
          updatedData.wednesday = updatedData.wednesday ? 1 : 0;
        }
        if (typeof updatedData.thursday === "boolean") {
          updatedData.thursday = updatedData.thursday ? 1 : 0;
        }
        if (typeof updatedData.friday === "boolean") {
          updatedData.friday = updatedData.friday ? 1 : 0;
        }
        if (typeof updatedData.saturday === "boolean") {
          updatedData.saturday = updatedData.saturday ? 1 : 0;
        }
        if (typeof updatedData.sunday === "boolean") {
          updatedData.sunday = updatedData.sunday ? 1 : 0;
        }

        state.discounts[index] = {
          ...state.discounts[index],
          ...updatedData,
        };
      }
    },
    addDiscount(state, action: PayloadAction<IDiscount>) {
      state.discounts.push(action.payload);
    },
    removeDiscount(state, action: PayloadAction<number>) {
      state.discounts = state.discounts.filter(
        (discount) => discount.id !== action.payload,
      );
    },
  },
});

export const {
  RESET,
  getStores,
  setStores,
  setSelectedStore,
  getCategories,
  setCategories,
  saveCategory,
  updateCategory,
  addCategory,
  removeCategory,
  saveItem,
  updateItem,
  addItem,
  removeItem,
  saveModifierGroup,
  updateModifierGroup,
  addModifierGroup,
  removeModifierGroup,
  unlinkModifierGroup,
  LinkModifierGroup,
  updateModifierGroupSort,
  saveModifier,
  addModifier,
  updateModifier,
  removeModifier,
  saveBooking,
  updateBooking,
  setNavigationStack,
  setCurrentView,
  setSelectedCategory,
  setSelectedSubCategory,
  setSelectedItem,
  setSelectedModifierGroup,
  setBooking,
  setSummaryDiscount,
  resetBooking,
  resetMenu,
  fetchDiscountList,
  setDiscountList,
  createDiscount,
  addDiscount,
  deleteDiscount,
  updateDiscount,
  removeDiscount,
  updateDiscountInState,
} = HomeSlice.actions;

export default HomeSlice.reducer;
