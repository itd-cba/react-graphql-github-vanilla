import React from "react";
import axios from "axios";

const TITLE = "React GraphQL Github Client";
const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env["GITHUB_ACCESS_TOKEN "]}`
  }
});

function App() {
  return (
    <div>
      <h1>{TITLE}</h1>
    </div>
  );
}

export default App;
