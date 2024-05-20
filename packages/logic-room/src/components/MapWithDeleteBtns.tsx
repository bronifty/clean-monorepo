import React from "react";

interface DataValueItem {
  name: string;
  author: string;
}

interface MapWithDeleteBtnsProps {
  dataValue: DataValueItem[];
  presenter: {
    delete: (index: number) => void;
  };
}

export function MapWithDeleteBtns({
  dataValue,
  presenter,
}: MapWithDeleteBtnsProps) {
  return (
    <div>
      {dataValue?.map((val, idx) => (
        <>
          <div key={idx}>
            <span>{val.name}</span> | <span>{val.author}</span>
          </div>
          <button onClick={() => presenter.delete(idx)}>Delete</button>
        </>
      ))}
    </div>
  );
}
