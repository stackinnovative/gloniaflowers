import { LexoRank } from "lexorank";

/** Evenly spaced drag-and-drop positions, in the format @sanity/orderable-document-list uses. */
export function orderRanks(count: number): string[] {
  let rank = LexoRank.min();
  return Array.from({ length: count }, () => (rank = rank.genNext().genNext()).toString());
}
