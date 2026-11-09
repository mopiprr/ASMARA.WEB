import { useCallback, useEffect, useState } from "react";

import api from "../../../services/api";

import type { MyTicketStatistics } from "../types/procurement.types";

export function useProcurementStatistics() {
  const [statistics, setStatistics] = useState<MyTicketStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await api.get<MyTicketStatistics>(
        "/tickets/my-statistics",
        { params: { type: 2 } }, // 2 = Procurement
      );

      setStatistics(response.data);
    } catch (err: unknown) {
      // Card cukup menampilkan "-" kalau gagal, tabel tetap jalan.
      console.error("Failed to fetch procurement statistics:", err);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStatistics();
  }, [fetchStatistics]);

  return {
    statistics,
    isLoading,
    fetchStatistics,
  };
}
