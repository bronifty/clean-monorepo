import React from "react";
import Form from "./Form";
import { booksParent } from "../utils/store";

export function BooksParent() {
  const data = booksParent;
  const title = "booksParent";
  const [dataValue, setDataValue] = React.useState(data.value);
  React.useEffect(() => {
    const dataSubscription = data.subscribe((value) => {
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
