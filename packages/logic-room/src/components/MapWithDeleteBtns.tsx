export function MapWithDeleteBtns({ dataValue, presenter }) {
  return (
    <div>
      {dataValue?.map((val, idx) => (
        <>
          <div key={idx}>
            <span>{val.name}</span> |<span>{val.author}</span>
          </div>
          <button onClick={() => presenter.delete(idx)}>Delete</button>
        </>
      ))}
    </div>
  );
}
