import { DbResponse } from "@/types/db";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../client";
import { PAY_TRIGGER, USERS, TRIGGERS } from "../constants";

export const trigger: any = {
  setPendingPayTigger: async (uid: string): Promise<DbResponse> => {
    try {
      const triggerRef = doc(db, USERS, uid, TRIGGERS, PAY_TRIGGER);

      await setDoc(triggerRef, { status: "pending" });

      return {
        code: 200,
        data: "trigger created",
        error: null,
      };
    } catch (error) {
      return {
        code: 500,
        data: null,
        error,
      };
    }
  },
  setCompletePayTrigger: async (uid: string): Promise<DbResponse> => {
    try {
      const triggerRef = doc(db, USERS, uid, TRIGGERS, PAY_TRIGGER);
      const userDoc = await getDoc(triggerRef);

      if (userDoc.data()?.status === "pending") {
        await setDoc(triggerRef, { status: "complete" });
      }

      return {
        code: 200,
        data: "trigger updated",
        error: null,
      };
    } catch (error) {
      return {
        code: 500,
        data: null,
        error,
      };
    }
  },
};
