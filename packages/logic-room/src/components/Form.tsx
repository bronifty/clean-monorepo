import React from "react";

interface FormData {
  value: { name: string; author: string }[];
}

export default function Form({ data }: { data: FormData }) {
  const defaultValues = {
    name: "",
    author: "",
  };
  const [fields, setFields] = React.useState(defaultValues);
  function setField(field: string, value: string) {
    setFields((old) => ({ ...old, [field]: value }));
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    data.value = [...data.value, fields];
    setFields(defaultValues);
  };
  return (
    <form onSubmit={(e) => handleSubmit(e)}>
      <label htmlFor="name">name: </label>
      <input
        id="name"
        type="text"
        value={fields.name}
        onChange={(e) => setField("name", e.target.value)}
      />
      <label htmlFor="author">author: </label>
      <input
        id="author"
        type="text"
        value={fields.author}
        onChange={(e) => setField("author", e.target.value)}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
