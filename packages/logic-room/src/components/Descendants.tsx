import React from "react";

interface DescendantsProps {
  data: {
    value: number;
    subscribe: (callback: (value: number) => void) => () => void;
  };
  title: string;
}

export function Descendants({ data, title }: DescendantsProps) {
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
