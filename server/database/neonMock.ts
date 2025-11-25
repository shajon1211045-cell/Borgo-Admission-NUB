// Simple mock for Neon (demo-only). This does NOT connect to a real Neon DB.
// It provides a minimal client API and connect function to allow the server to
// pretend Neon is available for demos without any MCP integration.

export const connectNeonMock = async (): Promise<void> => {
  console.log(
    "🔧 Neon mock client initialized (demo mode). No real Neon connection established.",
  );
};

export const getNeonClient = () => {
  return {
    query: async (sql: string, params: any[] = []) => {
      console.warn("neonMock.query called - returning empty result for demo", {
        sql,
        params,
      });
      return { rows: [] };
    },
  };
};
