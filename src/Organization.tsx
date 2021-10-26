import {
  GQLError,
  OrganizationType,
  ReactionsContent,
  RepositoryType
} from "./types";
import React from "react";

type Props = {
  organization?: OrganizationType;
  errors?: GQLError[];
};

export const Organization: React.FC<Props> = ({
  organization,
  errors,
  children
}) => {
  if (errors) {
    return (
      <p>
        <strong>Something went wrong:</strong>
        {errors.map(error => error.message).join(" ")}
      </p>
    );
  }
  if (organization) {
    return (
      <div>
        <p>
          <strong>Issues form Organization:</strong>
          <a href={organization.url}>{organization.name}</a>
        </p>
        {children}
      </div>
    );
  }
  return null;
};
type RepoPros = {
  repository: RepositoryType;
  onFetchMoreIssues: () => void;
  onStarRepository: (repositoryId: string, viewerHasStarred: boolean) => void;
};
export const Repository = ({
  repository,
  onFetchMoreIssues,
  onStarRepository
}: RepoPros) => {
  return (
    <div>
      <p>
        <strong>In Repository</strong>
        <a href={repository.url}>{repository.name}</a>
      </p>
      <button
        type={"button"}
        onClick={() =>
          onStarRepository(repository.id, repository.viewerHasStarred)
        }
      >
        {repository.stargazers.totalCount}
        {repository.viewerHasStarred ? " Unstar" : " Star"}
      </button>
      <ul>
        {repository.issues.edges.map(issue => (
          <li key={issue.node.id}>
            <a href={issue.node.url}>{issue.node.title}</a>

            <ul>
              {issue.node.reactions.edges.map(reaction => (
                <li key={reaction.node.id}>
                  {
                    ReactionsContent[
                      (reaction.node
                        .content as string) as keyof typeof ReactionsContent
                    ]
                  }
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
      <hr />
      {repository.issues.pageInfo.hasNextPage && (
        <button onClick={onFetchMoreIssues}>More</button>
      )}
    </div>
  );
};
