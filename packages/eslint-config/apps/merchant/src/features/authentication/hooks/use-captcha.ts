import { useCallback, useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { sendRecaptchaService } from "../services";
import { usePublicConfig } from "@/hooks/use-public-config";

interface useCaptchaProps {
  synchWithFormState: () => void;
}

export const useCaptcha = ({ synchWithFormState }: useCaptchaProps) => {
  const { config } = usePublicConfig();
  const recaptchaRef = useRef<typeof ReCAPTCHA>(null);
  const [isVerified, setIsVerified] = useState(!config?.captcha?.siteKey);

  const handleExpired = () => {
    if (config?.captcha?.siteKey) {
      setIsVerified(false);
    }
  };

  const handleCaptchaSubmission = useCallback(
    async (token: string | null) => {
      try {
        if (!token || !config?.captcha?.siteKey) return;
        await sendRecaptchaService(token);
        setIsVerified(true);
      } catch (e) {
        setIsVerified(false);
      }
    },
    [config?.captcha?.siteKey],
  );

  const handleChange = useCallback((token: string | null) => {
    handleCaptchaSubmission(token);
    try {
      // Synchronize the form state with the captcha state
      synchWithFormState();
    } catch (e) {
      return;
    }
  }, []);

  return { recaptchaRef, isVerified, handleExpired, handleChange };
};
