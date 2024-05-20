import React from "react";

interface Presenter {
  post: (fields: { name: string; author: string }) => void;
}

export function FormPost({ presenter }: { presenter: Presenter }) {
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
    presenter.post(fields);
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
