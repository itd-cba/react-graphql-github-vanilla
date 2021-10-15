export type OrganizationType = {
  name: string;
  url: string;
  repository: RepositoryType;
};

export type RepositoryType = {
  name: string;
  url: string;
  issues: IssueList;
};

export type IssueList = {
  edges: IssueListEdge[];
};
export type IssueListEdge = {
  node: Issue;
};

export type Issue = {
  id: string;
  title: string;
  url: string;
};

export type ErrorMessage = {
  message: string;
};
