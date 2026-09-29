import { createElement } from "react";
import type { ReactNode } from "react";

export interface CategoryNode {
  id: number;
  name: string;
  parentId?: number | null;
  children?: CategoryNode[];
}

export interface FlatCategory {
  id: number;
  name: string;
  parentId: number | null;
  depth: number;
  path: string;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/**
 * The API nests categories only one level deep (`children` of a child are
 * always empty), so the raw node is kept shallow here; the hook walks each
 * node's detail endpoint to recover the real descendants.
 */
export function toCategoryNode(raw: unknown): CategoryNode | null {
  if (!isRecord(raw)) return null;
  const id = Number(raw.id);
  if (!Number.isFinite(id)) return null;

  const parentId =
    raw.parentId === null || raw.parentId === undefined
      ? null
      : Number(raw.parentId);

  const children = Array.isArray(raw.children)
    ? raw.children
        .map(toCategoryNode)
        .filter((child): child is CategoryNode => child !== null)
    : [];

  return {
    id,
    name: typeof raw.name === "string" ? raw.name : String(raw.name ?? ""),
    parentId: Number.isFinite(parentId) ? parentId : null,
    ...(children.length > 0 ? { children } : {}),
  };
}

/** Depth-first flatten that also records the full path of every category. */
export function flattenCategoryTree(
  nodes: CategoryNode[] | undefined,
  depth = 0,
  parentPath = ""
): FlatCategory[] {
  const flat: FlatCategory[] = [];

  for (const node of nodes ?? []) {
    const path = parentPath ? `${parentPath} / ${node.name}` : node.name;
    flat.push({
      id: node.id,
      name: node.name,
      parentId: node.parentId ?? null,
      depth,
      path,
    });
    flat.push(...flattenCategoryTree(node.children, depth + 1, path));
  }

  return flat;
}

/** Ids of a node and everything below it, used to block cyclic parents. */
export function collectCategoryIds(node: CategoryNode | null | undefined): Set<number> {
  const ids = new Set<number>();

  const walk = (current: CategoryNode | null | undefined) => {
    if (!current || ids.has(current.id)) return;
    ids.add(current.id);
    current.children?.forEach(walk);
  };

  walk(node);
  return ids;
}

export function findCategoryNode(
  nodes: CategoryNode[] | undefined,
  id: number
): CategoryNode | null {
  for (const node of nodes ?? []) {
    if (node.id === id) return node;
    const found = findCategoryNode(node.children, id);
    if (found) return found;
  }
  return null;
}

/**
 * Indented label used by `Select`'s `optionRender`, so nested categories are
 * readable inside the dropdown without indenting the selected value.
 */
export function indentCategoryLabel(label: ReactNode, depth: number): ReactNode {
  return createElement(
    "span",
    { style: { paddingInlineStart: depth * 14 } },
    label
  );
}
