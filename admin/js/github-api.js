/**
 * GitHub API integration for blog publishing
 * Requires @octokit/rest library
 */

import { Octokit } from '@octokit/rest';

/**
 * Push markdown content to GitHub repository
 * @param {string} markdownContent - The markdown content to push
 * @param {string} filename - The filename (e.g., '2024-01-15-my-post.md')
 * @param {string} accessToken - GitHub personal access token
 * @param {Object} options - Additional options
 * @param {string} options.owner - Repository owner (default: current user)
 * @param {string} options.repo - Repository name (default: 'mywebsite')
 * @param {string} options.branch - Branch name (default: 'main')
 * @param {string} options.commitMessage - Custom commit message
 * @param {Object} options.frontmatter - Frontmatter object for the post
 * @returns {Promise<Object>} GitHub API response
 */
export async function pushMarkdownToRepo(
  markdownContent,
  filename,
  accessToken,
  options = {}
) {
  const {
    owner = null, // Will be determined from token
    repo = 'mywebsite',
    branch = 'main',
    commitMessage = `Add blog post: ${filename}`,
    frontmatter = {}
  } = options;

  try {
    // Initialize Octokit with authentication
    const octokit = new Octokit({
      auth: accessToken,
    });

    // Get authenticated user info if owner not provided
    let repoOwner = owner;
    if (!repoOwner) {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      repoOwner = user.login;
    }

    // Create frontmatter string
    const frontmatterString = Object.keys(frontmatter).length > 0 
      ? `---\n${Object.entries(frontmatter)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}\n---\n\n`
      : '';

    // Combine frontmatter with content
    const fullContent = frontmatterString + markdownContent;

    // Encode content to base64
    const content = btoa(unescape(encodeURIComponent(fullContent)));

    // Check if file already exists
    let sha = null;
    try {
      const { data: existingFile } = await octokit.rest.repos.getContent({
        owner: repoOwner,
        repo: repo,
        path: `blog/${filename}`,
        ref: branch,
      });
      sha = existingFile.sha;
    } catch (error) {
      // File doesn't exist, that's fine
      if (error.status !== 404) {
        throw error;
      }
    }

    // Push the file
    const response = await octokit.rest.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repo,
      path: `blog/${filename}`,
      message: commitMessage,
      content: content,
      branch: branch,
      sha: sha, // Include SHA if updating existing file
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
 * @param {string} accessToken - GitHub personal access token
 * @param {Object} options - Additional options
 * @returns {Promise<Array>} Array of blog post files
 */
export async function getBlogPosts(accessToken, options = {}) {
  const {
    owner = null,
    repo = 'mywebsite',
    branch = 'main'
  } = options;

  try {
    const octokit = new Octokit({
      auth: accessToken,
    });

    let repoOwner = owner;
    if (!repoOwner) {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      repoOwner = user.login;
    }

    const { data: files } = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repo,
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
 * @param {string} filename - The filename to delete
 * @param {string} accessToken - GitHub personal access token
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} GitHub API response
 */
export async function deleteBlogPost(filename, accessToken, options = {}) {
  const {
    owner = null,
    repo = 'mywebsite',
    branch = 'main',
    commitMessage = `Delete blog post: ${filename}`
  } = options;

  try {
    const octokit = new Octokit({
      auth: accessToken,
    });

    let repoOwner = owner;
    if (!repoOwner) {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      repoOwner = user.login;
    }

    // Get file SHA first
    const { data: file } = await octokit.rest.repos.getContent({
      owner: repoOwner,
      repo: repo,
      path: `blog/${filename}`,
      ref: branch,
    });

    // Delete the file
    const response = await octokit.rest.repos.deleteFile({
      owner: repoOwner,
      repo: repo,
      path: `blog/${filename}`,
      message: commitMessage,
      sha: file.sha,
      branch: branch,
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
 * @param {string} accessToken - GitHub personal access token
 * @returns {Promise<Object>} Validation result
 */
export async function validateGitHubToken(accessToken) {
  try {
    const octokit = new Octokit({
      auth: accessToken,
    });

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
 * @param {string} accessToken - GitHub personal access token
 * @param {Object} options - Repository options
 * @returns {Promise<Object>} Permission check result
 */
export async function checkRepositoryPermissions(accessToken, options = {}) {
  const {
    owner = null,
    repo = 'mywebsite'
  } = options;

  try {
    const octokit = new Octokit({
      auth: accessToken,
    });

    let repoOwner = owner;
    if (!repoOwner) {
      const { data: user } = await octokit.rest.users.getAuthenticated();
      repoOwner = user.login;
    }

    // Check if user has write access to the repository
    const { data: repoData } = await octokit.rest.repos.get({
      owner: repoOwner,
      repo: repo,
    });

    // Check user's permission level
    const { data: permissions } = await octokit.rest.repos.getCollaboratorPermissionLevel({
      owner: repoOwner,
      repo: repo,
      username: (await octokit.rest.users.getAuthenticated()).data.login,
    });

    return {
      success: true,
      hasWriteAccess: permissions.permission === 'admin' || permissions.permission === 'write',
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
