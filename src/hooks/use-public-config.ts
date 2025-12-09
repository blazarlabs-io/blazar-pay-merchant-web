"use client";

import { useState, useEffect } from "react";

interface PublicConfig {
  firebase: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId?: string;
  };
  captcha: {
    siteKey: string;
  };
  googleMaps: {
    apiKey: string;
  };
  app: {
    url: string;
  };
}

let configCache: PublicConfig | null = null;

export function usePublicConfig() {
  const [config, setConfig] = useState<PublicConfig | null>(configCache);
  const [loading, setLoading] = useState(!configCache);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (configCache) {
      setConfig(configCache);
      setLoading(false);
      return;
    }

    const fetchConfig = async () => {
      try {
        const response = await fetch("/api/config");
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.statusText}`);
        }
        const data = await response.json();
        configCache = data;
        setConfig(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch config");
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading, error };
}
