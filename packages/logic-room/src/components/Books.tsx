import React from "react";
import Form from "./Form";

interface BooksProps {
  data: {
    value: any; // Specify the correct type instead of 'any' if possible
    subscribe: (callback: (value: any) => void) => () => void; // Adjust the types as necessary
  };
  title: string;
}

export function Books({ data, title }: BooksProps) {
  const [dataValue, setDataValue] = React.useState(data.value);
  React.useEffect(() => {
    const dataSubscription = data.subscribe((value: any) => {
      // Specify the correct type instead of 'any'
      setDataValue(value);
    });
    return () => {
      dataSubscription();
    };
  }, []);

  return (
    <div>
      <h2>{title}</h2>
      <div>{JSON.stringify(dataValue, null, 2)}</div>
      <Form data={data} />
    </div>
  );
}
