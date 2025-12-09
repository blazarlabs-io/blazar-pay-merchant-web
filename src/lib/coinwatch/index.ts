"use client";

export const getAdaToUsd = async () => {
  const response = await fetch("/api/coin-prices");
  const data = await response.json();
  return data.ada;
};

export const getWbtcToUsd = async () => {
  const response = await fetch("/api/coin-prices");
  const data = await response.json();
  return data.wbtc;
};
