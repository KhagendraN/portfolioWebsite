# GitHub OAuth Security Best Practices

## 🔐 Security Considerations for Blog Admin Panel

### 1. **GitHub Personal Access Token Security**

#### **Token Creation & Permissions**
- **Minimal Permissions**: Only grant necessary scopes:
  - `repo` (for private repos) or `public_repo` (for public repos)
  - `user:email` (if you need email access)
- **Token Expiration**: Set reasonable expiration dates (30-90 days)
- **Token Rotation**: Regularly rotate tokens

#### **Token Storage**
```javascript
// ❌ NEVER store tokens in plain text
localStorage.setItem('token', 'ghp_xxxxxxxxx');

// ✅ Use secure storage with encryption
const encryptedToken = encrypt(token, userPassword);
localStorage.setItem('encrypted_token', encryptedToken);

// ✅ Or use sessionStorage (cleared on browser close)
sessionStorage.setItem('token', token);
```

### 2. **Frontend Security Measures**

#### **Input Validation**
```javascript
function validateInput(input) {
    // Sanitize markdown content
    const sanitized = DOMPurify.sanitize(input);
    
    // Validate filename format
    const filenameRegex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9-]+\.md$/;
    if (!filenameRegex.test(filename)) {
        throw new Error('Invalid filename format');
    }
    
    return sanitized;
}
```

#### **Content Security Policy (CSP)**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' cdnjs.cloudflare.com; 
               style-src 'self' 'unsafe-inline' fonts.googleapis.com cdnjs.cloudflare.com;
               font-src 'self' fonts.gstatic.com;
               img-src 'self' data: github.com;
               connect-src 'self' api.github.com;">
```

### 3. **Backend Security (If Using Server)**

#### **Environment Variables**
```bash
# .env file (never commit to git)
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_WEBHOOK_SECRET=your_webhook_secret
```

#### **Rate Limiting**
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 4. **GitHub Webhook Security**

#### **Webhook Secret Verification**
```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
    const expectedSignature = 'sha256=' + 
        crypto.createHmac('sha256', secret)
              .update(payload)
              .digest('hex');
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}
```

### 5. **Repository Security**

#### **Branch Protection Rules**
- Enable branch protection on `main` branch
- Require pull request reviews
- Require status checks (GitHub Actions)
- Restrict pushes to specific users/teams

#### **Repository Settings**
```yaml
# .github/settings.yml
repository:
  name: mywebsite
  description: "Personal portfolio and blog"
  homepage: "https://khagendraneupane.com.np"
  private: false
  has_issues: true
  has_projects: false
  has_wiki: false
  has_downloads: false
  allow_squash_merge: true
  allow_merge_commit: false
  allow_rebase_merge: true
  delete_branch_on_merge: true
```

### 6. **Authentication Flow Security**

#### **OAuth App Configuration**
```javascript
// OAuth app settings
const oauthConfig = {
    clientId: 'your_client_id',
    redirectUri: 'https://yourdomain.com/admin/callback',
    scope: 'repo,user:email',
    state: generateRandomState() // CSRF protection
};

function generateRandomState() {
    return crypto.randomBytes(32).toString('hex');
}
```

#### **State Parameter Validation**
```javascript
function validateState(providedState, storedState) {
    return crypto.timingSafeEqual(
        Buffer.from(providedState),
        Buffer.from(storedState)
    );
}
```

### 7. **Content Security**

#### **Markdown Sanitization**
```javascript
import DOMPurify from 'dompurify';
import { marked } from 'marked';

// Configure marked with security options
marked.setOptions({
    sanitize: true,
    breaks: true,
    gfm: true
});

function sanitizeMarkdown(content) {
    // Remove potentially dangerous HTML
    const cleanHtml = DOMPurify.sanitize(marked.parse(content));
    return cleanHtml;
}
```

#### **File Upload Validation**
```javascript
function validateFileUpload(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type');
    }
    
    if (file.size > maxSize) {
        throw new Error('File too large');
    }
    
    return true;
}
```

### 8. **Monitoring & Logging**

#### **Security Event Logging**
```javascript
function logSecurityEvent(event, details) {
    const logEntry = {
        timestamp: new Date().toISOString(),
        event: event,
        details: details,
        userAgent: navigator.userAgent,
        ip: getClientIP() // if available
    };
    
    // Send to logging service
    fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logEntry)
    });
}
```

### 9. **Deployment Security**

#### **GitHub Actions Security**
```yaml
# .github/workflows/security.yml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security scan
        uses: github/super-linter@v4
        env:
          DEFAULT_BRANCH: main
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 10. **Best Practices Summary**

#### **Do's ✅**
- Use HTTPS everywhere
- Implement proper CSP headers
- Validate all inputs
- Use environment variables for secrets
- Enable GitHub's security features
- Regular security audits
- Keep dependencies updated
- Use strong, unique tokens

#### **Don'ts ❌**
- Never commit secrets to git
- Don't store tokens in plain text
- Avoid using `eval()` or `innerHTML` with user content
- Don't trust client-side validation alone
- Avoid hardcoded credentials
- Don't ignore security warnings
- Never use deprecated authentication methods

### 11. **Emergency Response**

#### **Incident Response Plan**
1. **Immediate**: Revoke compromised tokens
2. **Short-term**: Rotate all credentials
3. **Medium-term**: Audit access logs
4. **Long-term**: Review and improve security measures

#### **Token Revocation**
```javascript
// Emergency token revocation
async function revokeToken(token) {
    try {
        await fetch('https://api.github.com/applications/your_client_id/token', {
            method: 'DELETE',
            headers: {
                'Authorization': `Basic ${btoa('client_id:client_secret')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ access_token: token })
        });
    } catch (error) {
        console.error('Token revocation failed:', error);
    }
}
```

## 🚨 Security Checklist

- [ ] GitHub token has minimal required permissions
- [ ] Token is stored securely (encrypted/sessionStorage)
- [ ] Input validation on all user inputs
- [ ] CSP headers implemented
- [ ] HTTPS enforced
- [ ] Branch protection rules enabled
- [ ] Webhook signatures verified
- [ ] Rate limiting implemented
- [ ] Security monitoring in place
- [ ] Regular security audits scheduled
- [ ] Incident response plan documented
- [ ] Dependencies kept updated
- [ ] Secrets never committed to git

Remember: Security is an ongoing process, not a one-time setup. Regularly review and update your security measures.
