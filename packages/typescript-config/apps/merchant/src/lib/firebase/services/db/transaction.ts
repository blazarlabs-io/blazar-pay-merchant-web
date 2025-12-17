import { DbResponse } from "@/types/db";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../client";

export const transaction: any = {
  getAll: async (): Promise<DbResponse> => {
    try {
      const res = await getDocs(collection(db, "transactions"));
      return {
        data: res.docs.map((doc) => ({ ...doc.data() })),
        error: null,
        code: 200,
      };
    } catch (error) {
      return { data: null, error, code: 500 };
    }
  },
};
