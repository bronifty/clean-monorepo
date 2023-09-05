import React from "react";

export function Descendants({ data, title }) {
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
