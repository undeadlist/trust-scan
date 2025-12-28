import { Octokit } from '@octokit/rest';
import { GithubData } from '../types';
import { withTimeout } from '../utils/timeout';

const GITHUB_TIMEOUT_MS = 15000;

function createOctokit(): Octokit {
  return new Octokit({
    auth: process.env.GITHUB_TOKEN || undefined,
    userAgent: 'TrustScan/1.0',
  });
}

function createNotFoundData(repoUrl: string | null = null, error?: string): GithubData {
  return {
    repoFound: false,
    repoUrl,
    stars: null,
    forks: null,
    openIssues: null,
    lastCommit: null,
    contributors: null,
    isArchived: false,
    ...(error ? { error } : {}),
  };
}

export async function checkGithub(domain: string, scrapedLinks: string[]): Promise<GithubData> {
  const octokit = createOctokit();

  try {
    // First, look for GitHub links in the scraped content
    const githubLinks = scrapedLinks.filter(link =>
      link && /github\.com\/[\w-]+\/[\w.-]+/i.test(link)
    );

    let owner: string | null = null;
    let repo: string | null = null;

    if (githubLinks.length > 0) {
      // Extract repo from the first valid GitHub link
      const match = githubLinks[0].match(/github\.com\/([\w-]+)\/([\w.-]+)/i);
      if (match) {
        owner = match[1];
        repo = match[2].replace(/\.git$/, '');
      }
    }

    // If no GitHub link found, try to guess based on domain
    if (!owner || !repo) {
      const domainWithoutTld = domain.split('.')[0];
      const guesses = [
        { owner: domainWithoutTld, repo: domainWithoutTld },
        { owner: domainWithoutTld, repo: 'app' },
        { owner: domainWithoutTld, repo: 'website' },
      ];

      for (const guess of guesses) {
        try {
          const repoData = await withTimeout(
            octokit.repos.get({ owner: guess.owner, repo: guess.repo }),
            GITHUB_TIMEOUT_MS
          );
          return parseGithubData(octokit, repoData.data);
        } catch {
          // Continue to next guess
        }
      }

      return createNotFoundData();
    }

    // Fetch repo data using Octokit
    const repoData = await withTimeout(
      octokit.repos.get({ owner, repo }),
      GITHUB_TIMEOUT_MS
    );

    return parseGithubData(octokit, repoData.data);
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return createNotFoundData();
    }
    return createNotFoundData(null, error instanceof Error ? error.message : 'Unknown error');
  }
}

async function parseGithubData(
  octokit: Octokit,
  data: {
    owner: { login: string };
    name: string;
    html_url: string;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    pushed_at: string | null;
    archived: boolean;
  }
): Promise<GithubData> {
  let contributors: number | null = null;

  // Try to get contributor count
  try {
    const contribResponse = await withTimeout(
      octokit.repos.listContributors({
        owner: data.owner.login,
        repo: data.name,
        per_page: 1,
      }),
      5000
    );

    // Check Link header for total count
    const linkHeader = contribResponse.headers.link;
    if (linkHeader) {
      const lastPageMatch = linkHeader.match(/page=(\d+)>; rel="last"/);
      if (lastPageMatch) {
        contributors = parseInt(lastPageMatch[1], 10);
      }
    } else {
      contributors = contribResponse.data.length;
    }
  } catch {
    // Ignore contributor fetch errors
  }

  return {
    repoFound: true,
    repoUrl: data.html_url,
    stars: data.stargazers_count,
    forks: data.forks_count,
    openIssues: data.open_issues_count,
    lastCommit: data.pushed_at,
    contributors,
    isArchived: data.archived,
  };
}
