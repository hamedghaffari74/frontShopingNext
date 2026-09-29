export const headerMediaKeys = {
  all: ["header-media"] as const,
  list: (onlyActive: boolean) => ["header-media", "list", { onlyActive }] as const,
  active: ["header-media", "active"] as const,
};
