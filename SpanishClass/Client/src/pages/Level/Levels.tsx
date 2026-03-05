import { useEffect, useState } from "react";
import { apiGet } from "../../api/api";
import { Level } from "./Level.Props";

export default function Levels() {
  const [levels, setLevels] = useState<Level[]>([]);

  useEffect(() => {
    apiGet<Level[]>("/levels").then(setLevels).catch(console.error);
  }, []);

  return (
    <div className="page-center">
      <h2>Spanish Levels</h2>
      {levels.map((l) => (
        <li key={l.id}>
          <b>{l.name}</b> – {l.description} – {l.price}€
        </li>
      ))}
    </div>
  );
}
