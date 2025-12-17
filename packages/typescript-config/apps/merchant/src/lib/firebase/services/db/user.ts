import { DbResponse, UserData } from "@/types/db";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import { db } from "../../client";
import { USERS } from "../constants";

export const user: any = {
  getAll: async (): Promise<DbResponse> => {
    try {
      const res = await getDocs(collection(db, USERS));
      return {
        data: res.docs.map((doc) => ({ ...doc.data() })),
        error: null,
        code: 200,
      };
    } catch (error) {
      return { data: null, error, code: 500 };
    }
  },
  getOne: async (uid: string): Promise<DbResponse> => {
    try {
      // * GET USER
      const userRef = doc(db, USERS, uid);
      const userDoc = await getDoc(userRef);

      return {
        data: userDoc.data(),
        error: null,
        code: 200,
      };
    } catch (error) {
      return { data: null, error, code: 500 };
    }
  },
  create: async (uid: string, data: UserData): Promise<DbResponse> => {
    try {
      // * CREATE USER
      const userRef = doc(db, USERS, uid);
      await setDoc(userRef, data);

      return {
        data: null,
        error: null,
        code: 200,
      };
    } catch (error) {
      return { data: null, error, code: 500 };
    }
  },
  update: async (uid: string, data: UserData): Promise<DbResponse> => {
    try {
      const userRef = doc(db, USERS, uid);
      await setDoc(userRef, data, { merge: true });
      return {
        code: 200,
        data: "user updated",
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
