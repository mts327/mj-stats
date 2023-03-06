import { Link } from "react-router-dom";

export const StatsYear = () => {
  return (
    <div className="width100">
      <h1>スタッツ</h1>
      <Link to="/stats/total">通算</Link>
      <br />
      <Link to="/stats/2021">2021年</Link>
      <br />
      <Link to="/stats/2022">2022年</Link>
      <br />
      <Link to="/stats/2023">2023年</Link>
    </div>
  );
};