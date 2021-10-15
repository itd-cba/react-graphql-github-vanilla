import { OrganizationType, RepositoryType } from "./types";

type Props = {
  organization?: OrganizationType;
  errors?: any[];
};

export const Organization = ({ organization, errors }: Props) => {
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
        <Repository repository={organization.repository} />
      </div>
    );
  }
  return null;
};
type RepoPros = {
  repository: RepositoryType;
};
const Repository = ({ repository }: RepoPros) => {
  return (
    <div>
      <p>
        <strong>In Repository</strong>
        <a href={repository.url}>{repository.name}</a>
      </p>
      <ul>
        {repository.issues.edges.map(issue => (
          <li key={issue.node.id}>
            <a href={issue.node.url}>{issue.node.title}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};
