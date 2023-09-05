import { DescendantsChild } from "./DescendantsChild";
import { DescendantsParent } from "./DescendantsParent";
import { DescendantsGrandParent } from "./DescendantsGrandParent";

export function DescendantsLayout() {
  return (
    <>
      <DescendantsChild />
      <div></div>
      <DescendantsParent />
      <div></div>
      <DescendantsGrandParent />
    </>
  );
}
