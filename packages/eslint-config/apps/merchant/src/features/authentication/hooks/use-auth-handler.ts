import { toast } from "@repo/ui/hooks/use-toast";
import { auth } from "@/lib/firebase/client";
import { setCookie } from "cookies-next";
import { AUTH_COOKIE } from "../data";
import { setToLocalStorage } from "@/utils/local-storage";
import { useAuth } from "../context";
import { useRouter } from "next/navigation";
import { UserCredential } from "firebase/auth";

export const useAuthHandler = () => {
  const { setUserHandler } = useAuth();
  const router = useRouter();

  const handleAuth = async (
    authFunction: (email: string, password: string) => Promise<UserCredential>,
    email: string,
    password: string,
  ) => {
    try {
      const userCredential = await authFunction(email, password);
      const user = userCredential.user;
      await setUserHandler(user);

      const idToken = await user.getIdToken();
      setCookie(AUTH_COOKIE, idToken, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      if (user.emailVerified) {
        toast({
          variant: "default",
          title: "Success",
          description: "Authentication successful",
        });
        router.replace("/dashboard/home");
      } else {
        toast({
          variant: "destructive",
          title: "Verify your email",
          description: "Please verify your email",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Authentication failed",
      });
    }
  };

  return { handleAuth };
};
