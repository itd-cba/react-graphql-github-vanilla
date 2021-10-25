import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useReducer,
  useCallback
} from "react";
import axios from "axios";
import { Organization, Repository } from "./Organization";
import {
  ErrorMessage,
  GQLError,
  OrganizationType,
  SuccessMessage
} from "./types";

type State = {
  data: Response;
  isLoading: boolean;
  errors?: GQLError[];
};

type Response = {
  path: string;
  organization?: OrganizationType;
};
type Action =
  | { type: "request" }
  | { type: "success"; organization: OrganizationType; cursor?: string }
  | { type: "failure"; errors: [GQLError] }
  | { type: "update_path"; path: string };

const TITLE = "React GraphQL Github Client";
const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env["REACT_APP_GITHUB_ACCESS_TOKEN"]}`
  }
});

const GET_ISSUES_OF_REPOSITORY = `
  query ($organization: String!, $repository: String!, $cursor:String) {
    organization(login: $organization) {
      name
      url
      repository(name: $repository) {
        name
        url
        issues(first: 5, after: $cursor,  states: [OPEN]) {
          totalCount
          pageInfo {
            endCursor
            hasNextPage
          }
          edges {
            node {
              id
              title
              url
              reactions(last: 3) {
              edges {
                node {
                  id
                  content
                }
              }
            }
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
      console.log(action.organization);
      if (!action.cursor) {
        return {
          ...state,
          data: {
            ...state.data,
            organization: action.organization
          },
          isLoading: false,
          errors: undefined
        };
      }
      return {
        ...state,
        data: {
          ...state.data,
          organization: {
            ...action.organization,
            repository: {
              ...action.organization.repository,
              issues: {
                ...action.organization.repository.issues,
                edges: [
                  ...state.data.organization?.repository.issues.edges!,
                  ...action.organization.repository.issues.edges
                ]
              }
            }
          }
        },
        isLoading: false,
        errors: undefined
      };
    case "failure":
      console.log(action.errors);
      return {
        ...state,
        isLoading: false,
        errors: action.errors
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

const isSuccess = (data: any): data is SuccessMessage => {
  return (data as SuccessMessage).data.hasOwnProperty("organization");
};

const isFailure = (data: any): data is ErrorMessage => {
  return (data as ErrorMessage).data.hasOwnProperty("errors");
};

function App() {
  const [state, dispatch] = useReducer(reducer, {
    data: { path: "the-road-to-learn-react/the-road-to-learn-react" },
    isLoading: false
  });
  const organization = state.data.organization;
  const errors = state.errors;

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "update_path", path: event.target.value });
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onFetchFromGithub();
  };

  const onFetchFromGithub = useCallback(
    (cursor?: string) => {
      const [organization, repository] = state.data.path.split("/");
      dispatch({ type: "request" });
      axiosGitHubGraphQL
        .post("", {
          query: GET_ISSUES_OF_REPOSITORY,
          variables: { organization, repository, cursor }
        })
        .then(result => {
          console.log(result);
          if (isFailure(result)) {
            dispatch({ type: "failure", errors: result.data.errors });
          } else if (isSuccess(result.data)) {
            dispatch({
              type: "success",
              organization: result.data.data.organization,
              cursor: cursor
            });
          }
        });
    },
    [state.data.path]
  );

  const fetchMoreIssues = () => {
    const { endCursor } = organization?.repository.issues.pageInfo!;
    onFetchFromGithub(endCursor);
  };

  useEffect(() => {
    onFetchFromGithub();
    // eslint-disable-next-line
  }, []);

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
        <Organization organization={organization} errors={errors}>
          {organization && (
            <Repository
              repository={organization.repository}
              onFetchMoreIssues={fetchMoreIssues}
            />
          )}
        </Organization>
      ) : (
        <p>No Information yet…</p>
      )}
    </div>
  );
}

export default App;
