import api from "./apiConfig";

export interface IResidentialTestingSlot {
  startDate: string;
  endDate: string;
  capacity: number;
  bookedCount: number;
  remaining: number;
  isFull: boolean;
}

// Mirrors rentAChefBackend/src/controllers/booking/residentialTestingSlot.controller.ts —
// first slot opens 7 days out, each slot runs 5 days, with a 3-day gap
// before the next slot starts.
const SLOT_LENGTH_DAYS = 5;
const SLOT_GAP_DAYS = 3;
const FIRST_SLOT_OFFSET_DAYS = 7;
const SLOT_CAPACITY = 5;
const SLOTS_TO_GENERATE = 6;

const toDateKey = (date: Date): string => date.toISOString().split("T")[0];

/**
 * Computes the same rolling slot windows the backend generates, with no
 * capacity info (every slot shown as fully open). Used as the immediate,
 * always-available source of truth for which dates are pickable, so slot
 * selection never blocks on the live-capacity endpoint being reachable.
 */
export const generateLocalTestingSlots = (): IResidentialTestingSlot[] => {
  const slots: IResidentialTestingSlot[] = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let start = new Date(today);
  start.setDate(start.getDate() + FIRST_SLOT_OFFSET_DAYS);

  for (let i = 0; i < SLOTS_TO_GENERATE; i++) {
    const end = new Date(start);
    end.setDate(end.getDate() + SLOT_LENGTH_DAYS - 1);

    slots.push({
      startDate: toDateKey(start),
      endDate: toDateKey(end),
      capacity: SLOT_CAPACITY,
      bookedCount: 0,
      remaining: SLOT_CAPACITY,
      isFull: false,
    });

    start = new Date(end);
    start.setDate(start.getDate() + SLOT_GAP_DAYS);
  }

  return slots;
};

/** Live capacity from the backend — may not exist yet on every deployed environment, so callers should treat failures as non-fatal and fall back to `generateLocalTestingSlots`. */
export const getResidentialTestingSlots = async (): Promise<IResidentialTestingSlot[]> => {
  const res = await api.get("/residential/testing-slots");
  return res?.data?.payload || [];
};
