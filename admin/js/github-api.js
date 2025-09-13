/**
 * GitHub API integration for blog publishing (Browser-safe)
 * Uses Octokit via esm.sh CDN for browser-native module usage
 */

import { Octokit } from 'https://esm.sh/@octokit/rest';

/**
 * Push markdown content to GitHub repository
 */
export async function pushMarkdownToRepo(
  markdownContent,
  filename,
  accessToken,
  options = {}
) {
  const {
    owner = null,
  repo = 'portfolioWebsite',
    branch = 'main',
    commitMessage = `Add blog post: ${filename}`,
    frontmatter = {}
  } = options;

  try {
    const octokit = new Octokit({ auth: accessToken });

    let repoOwner = owner;
    if (!repoOwner) {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      repoOwner = user.login;
    }

    const frontmatterString = Object.keys(frontmatter).length > 0 
      ? `---\n${Object.entries(frontmatter).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n\n`
      : '';

    const fullContent = frontmatterString + markdownContent;
    const content = btoa(unescape(encodeURIComponent(fullContent)));

    let sha = null;
    try {
      const { data: existingFile } = await octokit.rest.repos.getContent({
        owner: repoOwner,
        repo,
        path: `blog/${filename}`,
        ref: branch,
      });
      sha = existingFile.sha;
    } catch (error) {
      if (error.status !== 404) throw error;
    }

    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo,
      path: `blog/${filename}`,
      message: commitMessage,
      content,
      branch,
      sha,
    });

    return {
      success: true,
      data: response.data,
      message: sha ? 'Blog post updated successfully' : 'Blog post created successfully',
      url: response.data.content.html_url,
    };
  } catch (error) {
    console.error('Error pushing to GitHub:', error);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null,
    };
  }
}

/**
 * Get list of existing blog posts
 */
export async function getBlogPosts(accessToken, options = {}) {
  const {
    owner = null,
  repo = 'portfolioWebsite',
    branch = 'main'
  } = options;

  try {
    const octokit = new Octokit({ auth: accessToken });

    let repoOwner = owner;
    if (!repoOwner) {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      repoOwner = user.login;
    }

    const { data: files } = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo,
      path: 'blog',
      ref: branch,
    });

    return {
      success: true,
      data: files.filter(file => file.name.endsWith('.md')),
    };

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return {
      success: false,
      error: error.message,
      data: [],
    };
  }
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(filename, accessToken, options = {}) {
  const {
    owner = null,
  repo = 'portfolioWebsite',
    branch = 'main',
    commitMessage = `Delete blog post: ${filename}`
  } = options;

  try {
    const octokit = new Octokit({ auth: accessToken });

    let repoOwner = owner;
    if (!repoOwner) {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      repoOwner = user.login;
    }

    const { data: file } = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo,
      path: `blog/${filename}`,
      ref: branch,
    });

    const response = await octokit.rest.repos.deleteFile({
      owner: repoOwner,
      repo,
      path: `blog/${filename}`,
      message: commitMessage,
      sha: file.sha,
      branch,
    });

    return {
      success: true,
      data: response.data,
      message: 'Blog post deleted successfully',
    };

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return {
      success: false,
      error: error.message,
      details: error.response?.data || null,
    };
  }
}

/**
 * Validate GitHub access token
 */
export async function validateGitHubToken(accessToken) {
  try {
    const octokit = new Octokit({ auth: accessToken });
    const { data: user } = await octokit.rest.users.getAuthenticated();

    return {
      success: true,
      user: {
        login: user.login,
        name: user.name,
        avatar_url: user.avatar_url,
        email: user.email,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid or expired access token',
    };
  }
}

/**
 * Check repository permissions
 */
export async function checkRepositoryPermissions(accessToken, options = {}) {
  const {
    owner = null,
  repo = 'portfolioWebsite'
  } = options;

  try {
    const octokit = new Octokit({ auth: accessToken });

    let repoOwner = owner;
    if (!repoOwner) {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      repoOwner = user.login;
    }

    const { data: repoData } = await octokit.rest.repos.get({
      owner: repoOwner,
      repo,
    });

    const { data: permissions } = await octokit.rest.repos.getCollaboratorPermissionLevel({
      owner: repoOwner,
      repo,
      username: repoOwner,
    });

    return {
      success: true,
      hasWriteAccess: ['admin', 'write'].includes(permissions.permission),
      permission: permissions.permission,
      repository: repoData,
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      hasWriteAccess: false,
    };
  }
}
