import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useReducer,
  useCallback
} from "react";
import axios, { AxiosResponse } from "axios";
import { Organization, Repository } from "./Organization";
import {
  ErrorMessage,
  GQLError,
  OrganizationType,
  AddStarMutationResponse,
  SuccessMessage,
  RemoveStarMutationResponse
} from "./types";
import {
  ADD_STAR,
  GET_ISSUES_OF_REPOSITORY,
  REMOVE_STAR
} from "./QueriesAndMutations";

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
  | { type: "update_path"; path: string }
  | { type: "update_star"; viewerHasStarred: boolean };

const TITLE = "React GraphQL Github Client";
const axiosGitHubGraphQL = axios.create({
  baseURL: "https://api.github.com/graphql",
  headers: {
    Authorization: `bearer ${process.env["REACT_APP_GITHUB_ACCESS_TOKEN"]}`
  }
});

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
    case "update_star":
      const totalStars = state.data.organization?.repository.stargazers
        .totalCount!;
      return {
        ...state,
        data: {
          ...state.data,
          organization: {
            ...state.data.organization!,
            repository: {
              ...state.data.organization?.repository!,
              viewerHasStarred: action.viewerHasStarred,
              stargazers: {
                totalCount: action.viewerHasStarred
                  ? totalStars + 1
                  : totalStars - 1
              }
            }
          }
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

const addStarToRepository = (repositoryId: string) => {
  return axiosGitHubGraphQL.post<AddStarMutationResponse>("", {
    query: ADD_STAR,
    variables: { repositoryId }
  });
};

const removeStarFromRepository = (repositoryId: string) => {
  return axiosGitHubGraphQL.post<RemoveStarMutationResponse>("", {
    query: REMOVE_STAR,
    variables: { repositoryId }
  });
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

  const onStarRespository = async (
    repositoryId: string,
    viewerHasStarred: any
  ) => {
    let starMutationResponse: AxiosResponse<
      AddStarMutationResponse | RemoveStarMutationResponse
    >;
    let newStarState: boolean;
    if (viewerHasStarred) {
      starMutationResponse = await removeStarFromRepository(repositoryId);
      newStarState = (starMutationResponse as AxiosResponse<
        RemoveStarMutationResponse
      >).data.data.removeStar.starrable.viewerHasStarred;
    } else {
      const starMutationResponse = await addStarToRepository(repositoryId);
      newStarState = (starMutationResponse as AxiosResponse<
        AddStarMutationResponse
      >).data.data.addStar.starrable.viewerHasStarred;
    }

    dispatch({
      type: "update_star",
      viewerHasStarred: newStarState
    });
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
              onStarRepository={onStarRespository}
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
