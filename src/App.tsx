import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import axios from "axios";

const TITLE = "React GraphQL Github Client";
const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env["GITHUB_ACCESS_TOKEN "]}`
  }
});

function App() {
  const [path, setPath] = useState(
    "the-road-to-learn-react/the-road-to-learn-react"
  );

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPath(event.target.value);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // fetch data
  };

  useEffect(() => {
    const fetchFromGit = async () => {
      await axiosGitHubGraphQL.get(`/${path}`);
    };
    fetchFromGit();
  }, []);

  return (
    <div>
      <h1>{TITLE}</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="url">Show opem issues for https://github.com/</label>
        <input
          id="url"
          value={path}
          type={"text"}
          onChange={onChange}
          style={{ width: "300px" }}
        />
        <button type={"submit"}>Search</button>
      </form>
      <hr />
    </div>
  );
}

export default App;
