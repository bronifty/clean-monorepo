import React from "react";
import { child } from "../utils/store";

export function DescendantsChild() {
  const data = child;
  const title = "child";
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
