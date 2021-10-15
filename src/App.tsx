import React, { ChangeEvent, FormEvent, useEffect, useReducer } from "react";
import axios, { AxiosError } from "axios";
import { Organization } from "./Organization";
import { OrganizationType } from "./types";

type State = {
  data: Response;
  isLoading: boolean;
  errors?: any[];
};

type Response = {
  path: string;
  organization?: OrganizationType;
};
type Action =
  | { type: "request" }
  | { type: "success"; results: any }
  | { type: "failure"; error: any[] }
  | { type: "update_path"; path: string };

const TITLE = "React GraphQL Github Client";
const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env["REACT_APP_GITHUB_ACCESS_TOKEN"]}`
  }
});

const GET_ISSUES_OF_REPOSITORY = `
{
organization(login: "the-road-to-learn-react") {
name
url
repository(name: "the-road-to-learn-react") {
  name
  url
  issues(last: 5) {
    edges {
      node {
        id
        title
        url
      }
    }
  }
}
}
}
`;

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "request": {
      return { ...state, isLoading: true };
    }
    case "success":
      console.log(action.results);
      return {
        ...state,
        data: {
          ...state.data,
          organization: action.results.data?.organization
        },
        isLoading: false,
        errors: action.results.errors
      };
    case "failure":
      return {
        ...state,
        isLoading: false,
        errors: action.error
      };
    case "update_path":
      return {
        ...state,
        data: {
          ...state.data,
          path: action.path
        }
      };
  }
  return state;
};

function App() {
  const [state, dispatch] = useReducer(reducer, {
    data: { path: "the-road-to-learn-react/the-road-to-learn-react" },
    isLoading: false
  });

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "update_path", path: event.target.value });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // fetch data
  };
  const onFetchFromGithub = () => {
    dispatch({ type: "request" });
    axiosGitHubGraphQL
      .post("", { query: GET_ISSUES_OF_REPOSITORY })
      .then(result => {
        console.log(result);
        dispatch({ type: "success", results: result.data });
      });
  };
  useEffect(() => {
    onFetchFromGithub();
  }, []);

  const organization = state.data.organization;
  const errors = state.errors;

  return (
    <div>
      <h1>{TITLE}</h1>

      <form onSubmit={onSubmit}>
        <label htmlFor="url">Show open issues for https://github.com/</label>
        <input
          id="url"
          value={state.data?.path}
          type={"text"}
          onChange={onChange}
          style={{ width: "300px" }}
        />
        <button type={"submit"}>Search</button>
      </form>
      <hr />
      {organization || errors ? (
        <Organization organization={organization} errors={errors} />
      ) : (
        <p>No Information yet…</p>
      )}
    </div>
  );
}

export default App;
