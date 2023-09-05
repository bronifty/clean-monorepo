import React from "react";
import {
  booksChild,
  booksParent,
  booksGrandParent,
  child,
  parent,
  grandparent,
} from "../utils/store";

export function DescendantsParent() {
  const data = parent;
  const title = "parent";
  const [dataValue, setDataValue] = React.useState(data.value);
  React.useEffect(() => {
    const dataSubscription = data.subscribe((value) => {
      setDataValue(value);
    });
    return () => {
      dataSubscription();
    };
  }, []);
  const handleButtonClick = () => {
    data.value += 1;
  };
  return (
    <div>
      <div>
        {title}: {dataValue}
      </div>
      <button onClick={handleButtonClick}>Update {title} Value</button>
    </div>
  );
}
