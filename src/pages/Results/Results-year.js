import { Link } from "react-router-dom";

export const ResultsYear = () => {
  return (
    <div className="width100">
      <h1>順位成績表</h1>
      <Link to="/results/total">通算</Link>
      <br />
      <Link to="/results/2021">2021年</Link>
      <br />
      <Link to="/results/2022">2022年</Link>
      <br />
      <Link to="/results/2023">2023年</Link>
    </div>
  );
};